const { Server } = require("socket.io");
const {
  User,
  FriendShip,
  Follow,
  Message,
  Notification,
  RequestNotification,
  Reminder,
  CalendarItem,
} = require("./database");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

let io; // Socket.io server instance
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // CORS origin
const onlineUsers = []; // Tracks currently connected users

// -------------------- Helper Functions --------------------

// Fetch all messages between two users, sorted by creation time (ascending)
const getMessagesBetweenUsers = async (userId1, userId2) => {
  return Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    order: [["createdAt", "ASC"]],
  });
};

const createFriendRequestNotification = async (sender, receiver, friendship) => {
  const notification = await Notification.create({ userId: receiver });
  const fr_notif = await RequestNotification.create({
    notificationId: notification.id,
    friendshipId: friendship.id,
  });
  const senderInfo = friendship.primary.id === sender ? friendship.primary : friendship.secondary;
  const notifInfo = {
    id: notification.id,
    time: notification.createdAt,
    read: notification.read,
    userId: notification.userId,
    type: 'request',
    friendshipId: friendship.id,
    status: friendship.status,
    otherUser: {
      id: senderInfo.id,
      firstName: senderInfo.firstName,
      username: senderInfo.username,
    }
  };
  return notifInfo;
};


const deleteFriendship = async ({ friendship, action, senderIsUser1, receiverId }) => {
  if (!friendship)
    throw new Error("Cannot delete friendship, relation does not exist");

  if ((action === 'decline') &&
      ((senderIsUser1 && friendship.status === 'pending2') || 
      (!senderIsUser1 && friendship.status === 'pending1')))
    throw new Error("Cannot decline friend request, you are not the recipient");

  if ((action === 'cancel') &&
      ((senderIsUser1 && friendship.status === 'pending1') ||
      (!senderIsUser1 && friendship.status === 'pending2')))
    throw new Error("Cannot cancel friend request, you are not the sender");
  
  try {
    const senderId = senderIsUser1 ? friendship.user1 : friendship.user2;
    const notifs = await Notification.findAll({
      include: [{ 
        model: RequestNotification,
        where: {
          friendshipId: friendship.id,
        },
      }]
    });
    notifs.map(async (notif) => (await notif.destroy()));
    await friendship.destroy();
    io.to(`user:${receiverId}`)
      .to(`user:${senderId}`)
      .emit("friendship-deleted", {
      user1: senderId,
      user2: receiverId,
      status: "none",
      friendshipId: friendship.id,
    });

  } catch (error) {
    throw new Error(`Failed to ${action} friendship: ${error}`);
  }
}

// const reminderCheck = async () => {
//   const now = Date.now();
//   const formattedDate = now.toLocaleString(`en-US`, {
//     year: "numeric",
//     month: "numeric",
//     day: "numeric",
//     minute: "numeric",
//   });
//   const reminders = await Reminder.findAll({
//     where: reminderTime === formattedDate,
//   });

//   reminders.forEach(async (reminder) => {
//     const calendarItem = await CalendarItem.findByPk(reminder.calendarId);
//     socket.to(`user:${reminder.ownerId}`).emit();
//   });
// };

// setInterval(reminderCheck, 30000);

// -------------------- Main Socket Server Initialization --------------------
const initSocketServer = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: FRONTEND_URL, // Allow frontend origin
        credentials: true, // Allow cookies/auth headers
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });

    // --------------- Authentication Middleware --------------
    io.use((socket, next) => {
      const cookies = socket.request.headers.cookie;
      if (!cookies) {
        next(new Error("Access token required!"));
        return;
      }
      
      const token = cookie.parse(cookies).token;      
      if (!token) {
        next(new Error("Access token required!"));
        return;
      }

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
          next(new Error("Invalid or expired token"));

        socket.user = user;
        next();
      });
    });

    // -------------------- Main Namespace --------------------
    io.on("connection", (socket) => {
      console.log(`🔗 User connected to main namespace: ${socket.id}`);
      const userId = socket.user.id;
      socket.join(`user:${userId}`); // Join personal room for private events
      if (!onlineUsers.some((u) => u.id === userId))
        onlineUsers.push(userId); // Add user to online users list
      console.log(`👤 User ${userId} connected to main namespace`);

      // -------------------- Message Rooms --------------------
      socket.on("join-message-room", async (roomName, user, userClicked) => {
        if (!user?.id || !userClicked?.id) {
          return;
        }

        socket.join(roomName); // Join chat room

        try {
          const messages = await getMessagesBetweenUsers(
            user.id,
            userClicked.id
          );
          io.to(roomName).emit("receive-message", messages); // Send all messages in room
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      });

      /************************************************************************************/
      /* Response to a friend request event                                               */
      /************************************************************************************/
      /* receiverId: The ID of the user meant to receive this event                       */
      /* friendshipId: The ID of the frienship to be modified, if any                     */
      /* action: The action to take with the friendship (create, accept, decline, remove) */
      /************************************************************************************/
      socket.on("friend-request", async({ receiverId, friendshipId, action }) => {
        console.log(`Received Friend Request Event For Friendship #${friendshipId}`);
        const senderId = userId;
        const senderIsUser1 = senderId < receiverId;
        let notification = null;
        let status = "none";
        let newStatus = "none";
        try {
          const friendship = await FriendShip.findByPk(friendshipId, {
            include: [
              { model: User, as: 'primary' },
              { model: User, as: 'secondary' },
            ],
          });
          status = friendship ? friendship.status : "none";
          switch (action) {
            /* Sender has added Receiver as a friend */
            case 'create':
              if (friendship)
                throw new Error("Cannot create new friend request, relation already exists");

              const info = {
                user1: senderIsUser1 ? senderId : receiverId,
                user2: senderIsUser1 ? receiverId : senderId,
                status: senderIsUser1 ? "pending2" : "pending1",
              }
              const newFriendship = await FriendShip.create(info);
              newFriendship.primary = await User.findByPk(info.user1);
              newFriendship.secondary = await User.findByPk(info.user2);
              notification = await createFriendRequestNotification(senderId, receiverId, newFriendship);
              io.to(`user:${receiverId}`).emit("friend-request-received", notification);
              newStatus = info.status;
              friendshipId = newFriendship.id;
              break;
            /* Sender has accepted Receiver's friend request */
            case 'accept':
              if (!friendship)
                throw new Error("Cannot accept friend request, relation does not exist");

              if (friendship.status === 'accepted')
                throw new Error("Cannot accept friend request, relation status is already 'accepted'");

              if ((senderIsUser1 && friendship.status === 'pending2') || 
                  (!senderIsUser1 && friendship.status === 'pending1'))
                throw new Error(`Cannot accept friend request, user ${senderId} is not the recipient`);
              
              await friendship.update({ status: 'accepted' });
              notification = await createFriendRequestNotification(senderId, receiverId, friendship);
              io.to(`user:${receiverId}`).emit("friend-request-accepted", notification);
              io.to(`userProfile:${senderId}`)
                .to(`userProfile:${receiverId}`)
                .emit("friend-gained");
              newStatus = 'accepted';
              break;
            /* Sender has declined Receiver's friend request */
            case 'decline':
              await deleteFriendship({ friendship, action, receiverId, senderIsUser1 });
              newStatus = 'declined';
              break;
            /* Sender has removed the Receiver as a friend */
            case 'remove':
              await deleteFriendship({ friendship, action, receiverId, senderIsUser1 });
              io.to(`userProfile:${senderId}`)
                .to(`userProfile:${receiverId}`)
                .emit("friend-lost");
              newStatus = 'removed';
              break;
            /* Sender has canceled their friend request to Receiver */
            case 'cancel':
              await deleteFriendship({ friendship, action, receiverId, senderIsUser1 });
              newStatus = 'cancelled';
              break;
          }
        } catch (error) {
          console.error(error);
          io.to(`user:${senderId}`).emit("friendship-error", { 
            status,
            friendshipId,
            action,
            error,
          });
          return;
        }

        io.to(`user:${senderId}`).emit("friend-request-success", {
          newStatus,
          friendshipId,
          receiverId,
          action,
        });
      });

      socket.on("leave-message-room", (roomName) => {
        socket.leave(roomName);
        console.log(`User left room ${roomName}`);
      });

      // Sending a new message
      socket.on("sending-message",
        async (messageText, user, userClicked, room) => {
          if (!user?.id || !userClicked?.id || !room) return;

          try {
            // Save new message to database
            const newMessage = await Message.create({
              senderId: user.id,
              receiverId: userClicked.id,
              content: messageText,
            });

            // Emit only the new message to everyone in the room
            io.to(room).emit("receive-message", newMessage);
          } catch (err) {
            console.error("Message send error:", err);
          }
        }
      );

      // -------------------- Profile Rooms --------------------
      socket.on("join-profile-room", (profileId) => {
        if (!profileId) return;
        socket.join(`userProfile:${profileId}`); // Join profile-specific room
        console.log(`🚪 Joined profile room ${profileId}`);
      });

      socket.on("leave-profile-room", (profileId) => {
        if (!profileId) return;
        const roomName = `userProfile:${profileId}`;
        socket.leave(roomName);
        console.log(`🚪 User ${socket.userId} left profile room ${roomName}`);
      });

      // -------------------- Business Rooms --------------------
      socket.on("join-business-room", (businessId) => {
        if (!businessId) return;
        socket.join(`business:${businessId}`);
        console.log(`🏢 Joined business room ${businessId}`);
      });

      socket.on("business-follow", async ({ businessId, userId, action }) => {
        try {
          if (action === "follow") {
            await Follow.findOrCreate({ where: { businessId, userId } });
          } else {
            await Follow.destroy({ where: { businessId, userId } });
          }

          const followingCount = await Follow.count({ where: { businessId } });
          io.to(`business:${businessId}`).emit(
            "followers/amount",
            followingCount
          );
          socket.emit("follow-status", {
            success: true,
            isFollowing: action === "follow",
          });
        } catch (error) {
          console.error("business-follow error:", error);
          socket.emit("follow-status", {
            success: false,
            message: "Action failed",
          });
        }
      });

      // -------------------- Disconnect --------------------
      socket.on("disconnect", () => {
        if (socket.userId) {
          const index = onlineUsers.findIndex((u) => u.id === socket.userId);
          if (index !== -1) onlineUsers.splice(index, 1);
          console.log(
            `🔗 User ${socket.userId} disconnected from main namespace`
          );
        }
      });
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:", error);
  }
};

module.exports = initSocketServer;

const { Server } = require("socket.io");
const { User, FriendShip, Follow, Message } = require("./database");
const { Op } = require("sequelize");

let io; // Socket.io server instance
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

    // -------------------- Main Namespace --------------------
    io.on("connection", (socket) => {
      console.log(`🔗 User connected to main namespace: ${socket.id}`);

      // Track connected users
      socket.on("connected", (id) => {
        if (!id) return;

        socket.userId = id; // Attach userId to socket
        socket.join(`user:${id}`); // Join personal room for private events
        if (!onlineUsers.some((u) => u.id === id))
          onlineUsers.push(id); // Add user to online users list
        console.log(`👤 User ${id} connected to main namespace`);
      });

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
        console.log("Received Friend Request Event");
        const senderId = socket.userId;        
        const senderIsUser1 = senderId < receiverId;
        try {
          const friendship = await FriendShip.findByPk(friendshipId, {
            include: [
              { model: User, as: 'primary' },
              { model: User, as: 'secondary' },
            ],
          });
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
              io.to(`user:${receiverId}`).emit("friend-request-received", newFriendship);
              return;
            /* Sender has accepted Receiver's friend request */
            case 'accept':
              if (!friendship)
                throw new Error("Cannot accept friend request, relation does not exist");

              if ((senderIsUser1 && friendship.status === 'pending1') || 
                  (!senderIsUser1 && friendship.status === 'pending2'))
                throw new Error(`Cannot accept friend request, user ${senderId} is not the recipient`);
              
              await friendship.update({ status: 'accepted' });
              io.to(`user:${receiverId}`).emit("friend-request-accepted", friendship);
              return;
            /* Sender has declined Receiver's friend request (fall through) */
            case 'decline':
            /* Sender has removed the Receiver as a friend (fall through) */
            case 'remove':
            /* Sender has canceled their friend request to Receiver */
            case 'cancel':
              if (!friendship)
                throw new Error("Cannot delete friendship, relation does not exist");

              if ((action === 'decline') &&
                  (senderIsUser1 && friendship.status === 'pending1') || 
                  (!senderIsUser1 && friendship.status === 'pending2'))
                throw new Error("Cannot decline friend request, you are not the recipient");

              if ((action === 'cancel') &&
                  (senderIsUser1 && friendship.status === 'pending2') ||
                  (!senderIsUser1 && friendship.status === 'pending1'))
                throw new Error("Cannot cancel friend request, you are not the sender");
              
              await friendship.destroy();
              io.to(`user:${receiverId}`).emit("friendship-deleted", friendship);
          }
        } catch (error) {
          console.error(error);
          io.to(`user:${senderId}`).emit("friendship-error", { action, error });
        }
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
        socket.join(`profile:${profileId}`); // Join profile-specific room
        console.log(`🚪 Joined profile room ${profileId}`);
      });

      socket.on("leave-profile-room", (profileId) => {
        if (!profileId) return;
        const roomName = `profile:${profileId}`;
        socket.leave(roomName);
        console.log(`🚪 User ${socket.userId} left profile room ${roomName}`);
      });

      // -------------------- Friend Request Handling --------------------
      socket.on("friend-request", async ({ profileId, viewerId, action }) => {
        try {
          console.log(
            `Friend request action: ${action} between ${viewerId} and ${profileId}`
          );

          // Ensure consistent ordering of user IDs
          const [user1, user2] =
            viewerId < profileId
              ? [viewerId, profileId]
              : [profileId, viewerId];

          let friendship = await FriendShip.findOne({
            where: { user1, user2 },
          });

          // Handle friend request actions
          if (action === "add" && !friendship) {
            friendship = await FriendShip.create({
              user1,
              user2,
              status: viewerId < profileId ? "pending2" : "pending1",
            });
          } else if (
            action === "accept" &&
            friendship?.status.startsWith("pending")
          ) {
            await friendship.update({ status: "accepted" });
          } else if (
            ["cancel", "unfriend", "decline"].includes(action) &&
            friendship
          ) {
            await friendship.destroy();
            friendship = null;
          }

          // Count accepted friends for each user
          const getCount = async (userId) => {
            return FriendShip.count({
              where: {
                [Op.or]: [{ user1: userId }, { user2: userId }],
                status: "accepted",
              },
            });
          };
          const [count1, count2] = await Promise.all([
            getCount(user1),
            getCount(user2),
          ]);

          // Get lists of friends for each user
          const getFriends = async (userId) => {
            const friends = await FriendShip.findAll({
              where: {
                [Op.or]: [{ user1: userId }, { user2: userId }],
                status: "accepted",
              },
              include: [
                { model: User, as: "primary" },
                { model: User, as: "secondary" },
              ],
            });

            return friends
              .map((f) => (f.user1 === userId ? f.secondary : f.primary))
              .filter((friend) => friend.id !== userId);
          };
          const [friends1, friends2] = await Promise.all([
            getFriends(user1),
            getFriends(user2),
          ]);

          // Broadcast friendship updates
          const profileRoom1 = `profile:${user1}`;
          const profileRoom2 = `profile:${user2}`;
          io.to(profileRoom1)
            .to(profileRoom2)
            .emit("friendship-update", {
              user1,
              user2,
              friendship,
              status: friendship ? friendship.status : "none",
              action,
              friendsCount: profileId === user1 ? count1 : count2,
            });

          io.to(profileRoom1).emit("friends/amount", count1);
          io.to(profileRoom2).emit("friends/amount", count2);
          io.to(`user:${user1}`).emit("friendsList", friends1);
          io.to(`user:${user2}`).emit("friendsList", friends2);
        } catch (err) {
          console.error("Friend request error:", err);
          socket.emit("friend-error", { action, error: "Operation failed" });
        }
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

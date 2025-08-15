const { Server } = require("socket.io");
const { User, FriendShip, Follow, Message } = require("./database");
const { Op } = require("sequelize");

let io;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const onlineUsers = [];

// -------------------- Helper --------------------
const sendMessagesToRoom = async ({
  socket,
  messageText,
  user,
  userClicked,
  room,
}) => {
  console.log("sendMessagesToRoom inputs:", {
    user,
    userClicked,
    room,
    messageText,
  });
  if (!user || !user.id || !userClicked || !userClicked.id) {
    console.warn("sendMessagesToRoom called without valid user/userClicked:", {
      user,
      userClicked,
      room,
    });
    return;
  }

  const [user1, user2] =
    user.id < userClicked.id
      ? [user.id, userClicked.id]
      : [userClicked.id, user.id];

  try {
    if (messageText) {
      await Message.create({
        senderId: user.id,
        receiverId: userClicked.id,
        content: messageText,
      });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    console.log(`Emitting ${messages.length} messages to room: ${room}`);
    io.to(room)
      .to(`user:${user1}`)
      .to(`user:${user2}`)
      .emit("receive-message", messages, user1, user2);
  } catch (err) {
    console.error("Error sending messages:", err);
  }
};

// -------------------- Main Function --------------------
const initSocketServer = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });

    // -------------------- Main Namespace --------------------
    io.on("connection", (socket) => {
      console.log(`🔗 User connected to main namespace: ${socket.id}`);

      socket.on("userConnected", (user) => {
        if (!user?.id) return;
        socket.userId = user.id;
        socket.join(`user:${user.id}`);
        if (!onlineUsers.some((u) => u.id === user.id)) {
          onlineUsers.push(user);
        }
        console.log(`👤 User ${user.id} connected to main namespace`);
      });

      // Message room functionality
      socket.on("join-message-room", async (roomName, user, userClicked) => {
        socket.join(roomName);
        console.log(`✅ User ${user?.id} joined room: ${roomName}`, {
          user,
          userClicked,
        });
        if (!user?.id || !userClicked?.id) {
          console.error("Invalid user data in join-message-room:", {
            user,
            userClicked,
          });
          return;
        }
        await sendMessagesToRoom({ socket, user, userClicked, room: roomName });
      });

      socket.on("leave-message-room", (roomName) => {
        socket.leave(roomName);
        console.log(`User left room ${roomName}`);
      });

      socket.on(
        "sending-message",
        async (messageText, user, userClicked, room) => {
          console.log(
            "Sending message:",
            messageText,
            "from",
            user?.id,
            "to",
            userClicked?.id,
            "in room",
            room
          );
          await sendMessagesToRoom({
            socket,
            messageText,
            user,
            userClicked,
            room,
          });
        }
      );

      // Profile room functionality (moved from userProfile namespace)
      socket.on("join-profile-room", (profileId) => {
        if (!profileId) return;
        socket.join(`profile:${profileId}`);
        console.log(`🚪 Joined profile room ${profileId}`);
      });

      socket.on("leave-profile-room", (profileId) => {
        if (!profileId) return;
        const roomName = `profile:${profileId}`;
        socket.leave(roomName);
        console.log(`🚪 User ${socket.userId} left profile room ${roomName}`);
      });

      // Friend Request Handling
      socket.on("friend-request", async ({ profileId, viewerId, action }) => {
        try {
          console.log(
            `Friend request action: ${action} between ${viewerId} and ${profileId}`
          );

          const [user1, user2] =
            viewerId < profileId
              ? [viewerId, profileId]
              : [profileId, viewerId];

          let friendship = await FriendShip.findOne({
            where: { user1, user2 },
          });

          // Handle different actions
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

          // Get friend counts for both users
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

          // Prepare update data
          const update = {
            user1,
            user2,
            friendship,
            status: friendship ? friendship.status : "none",
            action,
            friendsCount: profileId === user1 ? count1 : count2,
          };

          // Get friends lists
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

          // Broadcast updates
          const profileRoom1 = `profile:${user1}`;
          const profileRoom2 = `profile:${user2}`;

          console.log(
            `Broadcasting to rooms: ${profileRoom1}, ${profileRoom2}`
          );

          io.to(profileRoom1)
            .to(profileRoom2)
            .emit("friendship-update", update);

          io.to(profileRoom1).emit("friends/amount", count1);
          io.to(profileRoom2).emit("friends/amount", count2);

          io.to(`user:${user1}`).emit("friendsList", friends1);
          io.to(`user:${user2}`).emit("friendsList", friends2);
        } catch (err) {
          console.error("Friend request error:", err);
          socket.emit("friend-error", { action, error: "Operation failed" });
        }
      });

      // Business room functionality (moved from businessProfile namespace)
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

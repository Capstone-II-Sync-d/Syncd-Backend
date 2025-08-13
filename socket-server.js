const { Server } = require("socket.io");
const { User, FriendShip, Follow } = require("./database");
const { Op } = require("sequelize");

let io;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const onlineUsers = [];

const initSocketServer = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });

    // Initialize namespaces
    const userSocket = io.of("/userProfile");
    const businessSocket = io.of("/businessProfile");

    // -------------------- Main Namespace --------------------
    io.on("connection", (socket) => {
      console.log(`🔗 User connected to main namespace: ${socket.id}`);

      socket.on("userConnected", (user) => {
        socket.userId = user.id;
        socket.join(`user:${user.id}`);
        if (!onlineUsers.some((u) => u.id === user.id)) {
          onlineUsers.push(user);
        }
        console.log(`👤 User ${user.id} connected to main namespace`);
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

    // -------------------- User Profile Namespace --------------------
    userSocket.on("connection", (socket) => {
      console.log(`🔗 User connected to userProfile namespace: ${socket.id}`);

      socket.on("join-profile-room", (profileId) => {
        if (!profileId) return;
        socket.join(`profile:${profileId}`);
        console.log(`🚪 Joined profile room ${profileId}`);
      });

      socket.on("friend-request", async ({ profileId, viewerId, action }) => {
        try {
          const [user1, user2] =
            viewerId < profileId
              ? [viewerId, profileId]
              : [profileId, viewerId];
          let friendship = await FriendShip.findOne({
            where: { user1, user2 },
          });

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
          const update = {
            user1,
            user2,
            friendship,
            status: friendship ? friendship.status : "none",
            action,
            friendsCount: profileId === user1 ? count1 : count2,
          };

          userSocket
            .to(`profile:${user1}`)
            .to(`profile:${user2}`)
            .emit("friendship-update", update);
          userSocket.to(`profile:${user1}`).emit("friends/amount", count1);
          userSocket.to(`profile:${user2}`).emit("friends/amount", count2);
        } catch (err) {
          console.error("Friend request error:", err);
          socket.emit("friend-error", { action, error: "Operation failed" });
        }
      });

      socket.on("disconnect", () => {
        console.log(
          `🔗 User disconnected from userProfile namespace: ${socket.id}`
        );
      });
    });

    // -------------------- Business Profile Namespace --------------------
    businessSocket.on("connection", (socket) => {
      console.log(
        `🔗 User connected to businessProfile namespace: ${socket.id}`
      );

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
          businessSocket
            .to(`business:${businessId}`)
            .emit("followers/amount", followingCount);
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
        console.log(
          `🔗 User disconnected from businessProfile namespace: ${socket.id}`
        );
      });
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:", error);
  }
};

module.exports = initSocketServer;

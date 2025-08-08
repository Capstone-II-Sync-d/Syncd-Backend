const { Server } = require("socket.io");
const { User, FriendShip } = require("./database");
const { Op } = require("sequelize");

let io;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// -- Keep track of connected users
const onlineUsers = [];

const initSocketServer = (server) => {
  try {
    // -- Create Socket.IO server with CORS configuration
    io = new Server(server, {
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });

    // -- Listen for socket connections
    io.on("connection", (socket) => {
      console.log(`🔗 User ${socket.id} connected to sockets`);

      // -- Handle user disconnecting
      socket.on("disconnect", () => {
        if (socket.userId) {
          const index = onlineUsers.findIndex((u) => u.id === socket.userId);
          if (index !== -1) onlineUsers.splice(index, 1);
        }
        console.log(`🔗 User ${socket.id} disconnected from sockets`);
      });

      // -- Add connected user to onlineUsers list
      socket.on("userConnected", async (user) => {
        onlineUsers.push(user);
      });

      // ------------------------------------------------
      // -- Handle friend request creation or acceptance
      // ------------------------------------------------

      // Join profile rooms
      socket.on("join-profile-room", (profileId) => {
        socket.join(profileId);
      });

      socket.on("friend-request", async ({ profileId, viewerId }) => {
        try {
          const friendship = await FriendShip.findOne({
            where: {
              [Op.or]: [
                { user1: profileId, user2: viewerId },
                { user1: viewerId, user2: profileId },
              ],
            },
          });

          if (friendship) {
            if (friendship.status === "accepted") {
              // If already friends, delete the friendship (unfriend)
              await friendship.destroy();
            } else if (
              friendship.status === "pending1" ||
              friendship.status === "pending2"
            ) {
              // Accept pending friend request
              await friendship.update({ status: "accepted" });
            }
          } else {
            // Create new friend request
            await FriendShip.create({
              user1: viewerId,
              user2: profileId,
              status: "pending2",
            });
          }

          // Fetch updated friends count
          const friendsConnected = await FriendShip.findAll({
            where: {
              [Op.or]: [{ user1: profileId }, { user2: profileId }],
              status: "accepted",
            },
            include: [
              { model: User, as: "primary" },
              { model: User, as: "secondary" },
            ],
          });

          const friends = friendsConnected.map((f) =>
            f.user1 === profileId ? f.secondary : f.primary
          );

          // Emit updated friend count to everyone viewing this profile
          io.to(profileId).emit("friends/amount", friends.length);
        } catch (err) {
          console.error("Error in friend-request:", err);
        }
      });

      });
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:", error);
  }
};

module.exports = initSocketServer;

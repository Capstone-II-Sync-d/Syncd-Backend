const { Server } = require("socket.io");
const { User, FriendShip } = require("./database");
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
    // Happens Whenever a user connects to a socket
    io.on("connection", (socket) => {
      console.log(`🔗 User ${socket.id} connected to sockets`);

      socket.on("disconnect", () => {
        if (socket.userId) {
          const index = onlineUsers.findIndex((u) => u.id === socket.userId);
          if (index !== -1) {
            onlineUsers.splice(index, 1);
          }
        }
        console.log(`🔗 User ${socket.id} disconnected from sockets`);
      });

      // Add custom socket event handlers here

      socket.on("userConnected", async (user) => {
        // Take that Users informationa and add it to the online Users array
        onlineUsers.push(user);
      });

      socket.on("friend-request", async (profileId, viewerId) => {
        //Check if there is already a freiendship record between the two users
        const friendship = await FriendShip.findOne({
          where: {
            [Op.or]: [
              { user1: profileId, user2: viewerId },
              { user1: viewerId, user2: profileId },
            ],
          },
        });
        //If there is, change stats to accepted
        if (friendship) {
          if ((friendship.stauts = "pending1"))
            friendship.update({ status: "accepted" });
          else if ((friendship.stauts = "pending2"))
            friendship.update({ status: "accepted" });
        } else if (!friendship)
          FriendShip.create({
            user1: viewerId,
            user2: profileId,
            status: "pending2",
          });

        // Find all friends of the current user
        const friendsConnected = await FriendShip.findAll({
          where: {
            // or operator to check for any friendship where user1 OR user2 is the current user
            [Op.or]: [
              { user1: profileId, user2: viewerId },
              { user1: viewerId, user2: profileId },
            ],
            status: "accepted",
          },
          // Loads user details for both people in the friendship
          include: [
            { model: User, as: "primary" },
            { model: User, as: "secondary" },
          ],
        });

        // maps through friendships to find the friend of the current user
        const friends = friendsConnected.map((friendship) => {
          if (friendship.user1 === viewerId) {
            return friendship.secondary;
          } else {
            return friendship.primary;
          }
        });

        socket.emit("friendsList", friends);
      });
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:");
    console.error(error);
  }
};

module.exports = initSocketServer;

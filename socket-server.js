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
    //Happens Whenever a user connects to a socket
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
        //Take that Users informationa and add it to the online Users array
        onlineUsers.push(user);
      });
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:");
    console.error(error);
  }
};

module.exports = initSocketServer;

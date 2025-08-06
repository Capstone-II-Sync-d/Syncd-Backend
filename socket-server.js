const { Server } = require("socket.io");
const { User, FriendShip } = require("./database");

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

    io.on("connection", (socket) => {
      console.log(`🔗 User ${socket.id} connected to sockets`);

      socket.on("userConnected", (user) => {
        onlineUsers.push(user);
        console.log(onlineUsers);
      });
      socket.on("disconnect", () => {
        console.log(`🔗 User ${socket.id} disconnected from sockets`);
      });

      // Add custom socket event handlers here
    });
  } catch (error) {
    console.error("❌ Error initializing socket server:");
    console.error(error);
  }
};

module.exports = initSocketServer;

const { DataTypes } = require("sequelize");
const db = require("./db");

const Message = db.define("message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },

  senderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },

  receiverId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Message;

const { DataTypes } = require("sequelize");
const db = require("./db");

const FriendRequest = db.define("friend_request", {
  sender: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  receiver: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = FriendRequest;

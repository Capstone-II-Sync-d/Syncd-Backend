const { DataTypes } = require("sequelize");
const db = require("./db");

const Friend = db.define("friend", {
  user1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  user2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM[("pending1", "pending2", "accepted")],
    allowNull: false,
  },
});

module.exports = Friend;

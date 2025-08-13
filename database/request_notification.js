const { DataTypes } = require("sequelize");
const db = require("./db");

const RequestNotification = db.define("request_notification", {
  notificationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  friendshipId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  }
});

module.exports = RequestNotification;

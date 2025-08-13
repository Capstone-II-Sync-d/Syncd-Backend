const { DataTypes } = require("sequelize");
const db = require("./db");

const ReminderNotification = db.define("reminder_notification", {
  notificationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  reminderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  }
});

module.exports = ReminderNotification;

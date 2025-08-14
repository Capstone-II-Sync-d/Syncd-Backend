const { DataTypes } = require("sequelize");
const db = require("./db");

const EventNotification = db.define("event_notification", {
  notificationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  eventId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(['reminder', 'starting', 'cancelled', 'invite']),
    allowNull: false,
  },
});

module.exports = EventNotification;

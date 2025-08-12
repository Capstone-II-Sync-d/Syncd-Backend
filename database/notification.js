const { DataTypes } = require("sequelize");
const db = require("./db");

const Notification = db.define("notifications", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  type: {
    type: DataTypes.ENUM(['common', 'request', 'reminder', 'event', 'invite']),
    allowNull: false,
  },
});

module.exports = Notification;

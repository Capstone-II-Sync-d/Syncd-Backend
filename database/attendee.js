const { DataTypes } = require("sequelize");
const db = require("./db");

const Attendee = db.define("attendee", {
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  confirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Attendee;

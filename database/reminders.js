const { DataTypes } = require("sequelize");
const db = require("./db");

const Reminder = db.define("reminder", {
  timeValue: {
    type: DataTypes.INTEGER,
    validate: {
      isTimePositive(timeValue) {
        if (timeValue <= 0) {
          throw new Error("Time value must be positive");
        }
      },
    },
  },
  timeScale: {
    type: DataTypes.ENUM[("minutes", "hours", "days", "weeks")],
  },
  calendarItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Reminder;

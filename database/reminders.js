const { DataTypes } = require("sequelize");
const db = require("./db");

const Reminder = db.define("reminder", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  timeValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isTimePositive(value) {
        if (value <= 0) {
          throw new Error("Time value must be positive");
        }
      },
    },
  },
  timeScale: {
    type: DataTypes.ENUM(["minutes", "hours", "days", "weeks"]),
    allowNull: false,
  },
  reminderTime: {
    type: DataTypes.DATE,
    allowNull: true,
    // validate: {
    //   isDateCalid(dateStri) {
    //     STRING(dateStri);
    //     if (isNaN(new Date(dateStri)) === false) {
    //       throw new Error("Time Value is not a Date");
    //     }
    //   },
    // },
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

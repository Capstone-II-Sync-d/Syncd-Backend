const { DataTypes } = require("sequelize");
const db = require("./db");

const CalendarItem = db.define("calendar_item", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  chatLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  itemType: {
    type: DataTypes.ENUM[("personal", "event")],
    allowNull: false,
  },
  privacy: {
    type: DataTypes.ENUM[("public", "private")],
    defaultValue: "private",
    allowNull: false,
  },
  businessId: {
    type: DataTypes.INTEGER,
    references: {
      model: "businesses",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = CalendarItem;

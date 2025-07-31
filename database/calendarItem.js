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
    allowNull: true,
    validate: {
      notNullForEvent(value) {
        if (value === null && this.itemType !== "personal")
          throw new Error("Decription cannot be null unless it's a personal calendar item");
      }
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notNullForEvent(value) {
        if (value === null && this.itemType !== "personal" && this.privacy !== "private")
          throw new Error("Location cannot be null unless it's a private personal calendar item");
      }
    },
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
    type: DataTypes.ENUM(["personal", "event"]),
    allowNull: false,
    validate: {
      notPersonalForBusiness(value) {
        if (this.businessId !== null && value === "personal")
          throw new Error("Item Type cannot be 'personal' for businesses");
      }
    },
  },
  privacy: {
    type: DataTypes.ENUM(["public", "private"]),
    defaultValue: "private",
    allowNull: false,
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      notNullForEvent(value) {
        if (value === null && this.itemType !== "personal")
          throw new Error("BusinessID cannot be null unless it's a personal calendar item");
      }
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = CalendarItem;

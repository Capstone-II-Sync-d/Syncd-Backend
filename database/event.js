const { DataTypes } = require("sequelize");
const db = require("./db");
const Business = require("./business");
const CalendarItem = require("./calendarItem");

const Event = db.define(
  "event",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    validate: {
      async isValidEvent() {
        try {
          const item = await CalendarItem.findByPk(this.itemId);

          if (this.published && !item.description)
            throw new Error(
              "Calendar Item description cannot be null or empty for a published event"
            );

          if (this.published && !item.location)
            throw new Error(
              "Calendar Item location cannot be null or empty for a published event"
            );

          if (!this.businessId) return;

          const business = await Business.findByPk(this.businessId);
          if (business.ownerId !== item.userId)
            throw new Error("Business owner must match calendar item owner");
        } catch (error) {
          throw new Error("Failed to run custom validator:", error);
        }
      },
    },
  }
);

module.exports = Event;

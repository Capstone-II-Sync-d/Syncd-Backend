const { DataTypes } = require("sequelize");
const db = require("./db");

const CalendarItem = db.define("calendar_item", {
<<<<<<< Updated upstream
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING
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
        type: DataTypes.ENUM[('personal','event')],
        allowNull: false,
    },
    privacy: {
        type: DataTypes.ENUM[('public','private')],
        defaultValue: 'private',
        allowNull: false,
    },
    businessId:  {
        type: DataTypes.INTEGER,
        references: {
            model: 'businesses',
            key: 'id',
        }
    },
    userId: {
        type: DataTypes. INTEGER,
        allowNull: false,
=======
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  start: {
    type: DataTypes.DATETIME,
  },
  end: {
    type: DataTypes.DATETIME,
  },
  chatLink: {
    type: DataTypes.STRING,
  },
  itemType: {
    type: DataTypes.ENUM[("personal", "event")],
  },
  privacy: {
    type: DataTypes.ENUM[("public", "private")],
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "businesses",
      key: "id",
>>>>>>> Stashed changes
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = CalendarItem;

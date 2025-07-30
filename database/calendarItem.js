const { DataTypes } = require("sequelize");
const db = require("./db");

const CalendarItem = db.define("calendar_item", {
    title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING
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
        type: DataTypes.ENUM[('personal','event')],
    },
    privacy: {
        type: DataTypes.ENUM[('public','private')],
    },
    businessId:  {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'businesses',
            key: 'id',
        }
    },
    userId: {
        type: DataTypes. INTEGER,
        allowNull: false,
    },
});

module.exports = CalendarItem;
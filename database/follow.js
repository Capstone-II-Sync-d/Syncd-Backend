const { DataTypes } = require("sequelize");
const db = require("./db");

const Follow = db.define("follow", {
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Follow;

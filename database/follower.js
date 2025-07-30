const { DataTypes } = require("sequelize");
const db = require("./db");

const Follower = db.define("follower", {
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

module.exports = Follower;

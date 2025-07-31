const { DataTypes } = require("sequelize");
const db = require("./db");

const FriendShip = db.define("friendship", {
  user1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  user2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM[("pending1", "pending2", "accepted")],
    allowNull: false,
  },
}, {
  validate: {
    idsInOrder() {
      if (this.user1 > this.user2)
        throw new Error("ID of user1 must be smaller than the ID of user2");
    },
    notSelfFriendship() {
      if (this.user1 === this.user2)
        throw new Error("A user cannot have a friendship with themselves");
    },
  },
});

module.exports = FriendShip;

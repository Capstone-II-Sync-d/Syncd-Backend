const db = require("./db");
const User = require("./user");
const Business = require("./business");
const CalendarItem = require("./calendarItem");
const FriendRequest = require("./friendRequest");
const Friend = require("./friend");
const Follower = require("./follower");

// -------------- associations -----------------//

User.hasMany(CalendarItem, {
  foreignKey: 'userId'
});
User.hasMany(Business, {
  foreignKey: 'ownerID'
});
Business.belongsTo(User, {
  foreignKey: 'userId'
});
User.hasMany(Friend, {
  foreignKey:'userId'
});
Business.hasMany(CalendarItem, {
  foreignKey: 'businessId'
});
Business.hasMany(Follower, {
  foreignKey: 'businessId'
});
Follower.belongsTo(Business, {
  foreignKey: 'businessId'
});
User.hasMany(Follower, {
  foreignKey: 'userId'
});
Follower.belongsTo(User, {
  foreignKey: 'userId'
});
CalendarItem.hasMany(Attendee, {
  foreignKey: 'eventId'
});
Attendee.belongsTo(CalendarItem, {
  foreignKey: 'eventId'
});

module.exports = {
  db,
  User,
  Business,
  CalendarItem,
  FriendRequest,
  Friend,
  Follower,
};
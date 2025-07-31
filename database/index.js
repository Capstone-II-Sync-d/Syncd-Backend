const db = require("./db");
const User = require("./user");
const Business = require("./business");
const CalendarItem = require("./calendarItem");
const Friendship = require("./friendship");
const Follower = require("./follower");
const Attendee = require("./attendee");

// -------------- Associations -----------------//
// User owns a business
User.hasMany(Business, {
  foreignKey: 'ownerId'
});
Business.belongsTo(User, {
  foreignKey: 'ownerId'
});

// --------------------------------------------
// User has calendar items
User.hasMany(CalendarItem, {
  foreignKey: 'userId'
});
CalendarItem.belongsTo(User, {
  foreignKey: 'ownerId'
})

// -------------------------------------------
// business has calendar items
Business.hasMany(CalendarItem, {
  foreignKey: 'businessId'
});
CalendarItem.belongsTo(User, {
  foreignKey: "ownerId",
});

// --------------------------------------------
// Calendar item has attendees
CalendarItem.hasMany(Attendee, {
  foreignKey: 'eventId'
});
Attendee.belongsTo(CalendarItem, {
  foreignKey: 'eventId'
});

User.hasMany(Friend, {
  foreignKey:'userId'
});

// Business has followers
Business.hasMany(Follower, {
  foreignKey: 'businessId'
});
Follower.belongsTo(Business, {
  foreignKey: 'businessId'
});

// User has followers
User.hasMany(Follower, {
  foreignKey: 'userId'
});
Follower.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = {
  db,
  User,
  Business,
  CalendarItem,
  FriendShip,
  Follower,
};
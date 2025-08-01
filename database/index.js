const db = require("./db");
const User = require("./user");
const Business = require("./business");
const CalendarItem = require("./calendarItem");
const FriendShip = require("./friendship");
const Follow = require("./follow");
const Attendee = require("./attendee");
const Event = require("./event");
const Reminder = require("./reminders");

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
  foreignKey: 'userId'
});

// -------------------------------------------
// Business has events
Business.hasMany(Event, {
  foreignKey: 'businessId'
});
Event.belongsTo(Business, {
  foreignKey: "businessId",
});

// -------------------------------------------
// Event is calendar item
CalendarItem.hasOne(Event, {
  foreignKey: 'itemId'
});
Event.belongsTo(CalendarItem, {
  foreignKey: 'itemId'
})

// --------------------------------------------
// Events have attendees
Event.hasMany(Attendee, {
  foreignKey: 'eventId'
});
Attendee.belongsTo(Event, {
  foreignKey: 'eventId'
});

// --------------------------------------------
// User has friends
User.hasMany(FriendShip, {
  foreignKey: 'user1'
});
FriendShip.belongsTo(User, {
  foreignKey: 'user1',
  as: 'primary',
});
User.hasMany(FriendShip, {
  foreignKey: 'user2'
});
FriendShip.belongsTo(User, {
  foreignKey: 'user2',
  as: 'secondary',
});

//------------------------------------------
// Business has follows
Business.hasMany(Follow, {
  foreignKey: 'businessId'
});
Follow.belongsTo(Business, {
  foreignKey: 'businessId'
});

//------------------------------------------
// User is a follower
User.hasMany(Follow, {
  foreignKey: 'userId'
});
Follow.belongsTo(User, {
  foreignKey: 'userId'
});

module.exports = {
  db,
  User,
  Business,
  CalendarItem,
  Event,
  FriendShip,
  Follow,
  Attendee,
  Reminder,
};
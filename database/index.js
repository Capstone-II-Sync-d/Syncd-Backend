const db = require("./db");
const User = require("./user");
<<<<<<< Updated upstream
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
=======
const Friend = require("./friend");
const Follower = require("./follower");
const Attendee = require("./attendee");
const Business = require("./business");
const CalendarItem = require("./calendarItem");
const Reminder = require("./reminder");

// ---------------------------------------------------------------------
//User owns a business
User.hasMany(Business, {
  foreignKey: "ownerId",
});
Business.belongsTo(User, {
  foreignKey: "ownerId",
});

// ---------------------------------------------------------------------
//User has CalendarItems
User.hasMany(CalendarItem, {
  foreignKey: "ownerId",
});
CalendarItem.belongsTo(User, {
  foreignKey: "ownerId",
});

//Business has calendar items
Business.hasMany(CalendarItem, {
  foreignKey: "businessId",
});
CalendarItem.belongsTo(Business, {
  foreignKey: "businessId",
});

// ---------------------------------------------------------------------
//CalendarItem has many saves from Users
CalendarItem.hasMany(Attendee, {
  foreignKey: "eventId",
});
Attendee.belongsTo(CalendarItem, {
  foreignKey: "ownerId",
});

Attendee.belongsTo(User, {
  foreignKey: "userId",
});

// ---------------------------------------------------------------------
//Follower Associations
Business.hasMany(Follower, {
  foreignKey: "businessId",
});
Follower.belongsTo(Business, {
  foreignKey: "businessId",
});

//User follows many businesses
User.hasMany(Follower, {
  foreignKey: "userId",
});
Follower.belongsTo(Business, {
  foreignKey: "userId",
>>>>>>> Stashed changes
});

module.exports = {
  db,
  User,
<<<<<<< Updated upstream
  Business,
  CalendarItem,
  FriendRequest,
  Friend,
  Follower,
};
=======
  Friend,
  Follower,
  Attendee,
  Business,
  CalendarItem,
  Reminder,
};
>>>>>>> Stashed changes

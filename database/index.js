const db = require("./db");
const User = require("./user");
const Business = require("./business");
const CalendarItem = require("./calendarItem");
const FriendShip = require("./friendship");
const Follow = require("./follow");
const Attendee = require("./attendee");
const Event = require("./event");
const Reminder = require("./reminders");
const Notification = require("./notification");
const RequestNotification = require("./request_notification");
const ReminderNotification = require("./reminder_notification");
const EventNotification = require("./event_notification");
const Message = require("./message");

// -------------- Associations -----------------//
// User owns a business
User.hasMany(Business, {
  foreignKey: "ownerId",
});
Business.belongsTo(User, {
  foreignKey: "ownerId",
});

// --------------------------------------------
// User has calendar items
User.hasMany(CalendarItem, {
  foreignKey: "userId",
});
CalendarItem.belongsTo(User, {
  foreignKey: "userId",
});

// -------------------------------------------
// Business has events
Business.hasMany(Event, {
  foreignKey: "businessId",
});
Event.belongsTo(Business, {
  foreignKey: "businessId",
});

// -------------------------------------------
// Event is calendar item
CalendarItem.hasOne(Event, {
  foreignKey: "itemId",
});
Event.belongsTo(CalendarItem, {
  foreignKey: "itemId",
});

// --------------------------------------------
// Events have attendees
Event.hasMany(Attendee, {
  foreignKey: "eventId",
});
Attendee.belongsTo(Event, {
  foreignKey: "eventId",
});

// --------------------------------------------
// Users are attendees
User.hasMany(Attendee, {
  foreignKey: "userId",
});
Attendee.belongsTo(User, {
  foreignKey: "userId",
});

// --------------------------------------------
// User has friends
User.hasMany(FriendShip, {
  foreignKey: "user1",
});
FriendShip.belongsTo(User, {
  foreignKey: "user1",
  as: "primary",
});
User.hasMany(FriendShip, {
  foreignKey: "user2",
});
FriendShip.belongsTo(User, {
  foreignKey: "user2",
  as: "secondary",
});

//------------------------------------------
// Business has follows
Business.hasMany(Follow, {
  foreignKey: "businessId",
});
Follow.belongsTo(Business, {
  foreignKey: "businessId",
});

//------------------------------------------
// User is a follower
User.hasMany(Follow, {
  foreignKey: "userId",
});
Follow.belongsTo(User, {
  foreignKey: "userId",
});

//Messages belong to users
User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
});

User.hasMany(Message, {
  foreignKey: "receiverId",
  as: "receivedMessages",
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

Message.belongsTo(User, {
  foreignKey: "receiverId",
  as: "receiver",
});

//------------------------------------------
// User has notifications
User.hasMany(Notification, {
  foreignKey: "userId",
});
Notification.belongsTo(User, {
  foreignKey: "userId",
}),
  //------------------------------------------
  // Notification can be a friend request notification
  Notification.hasOne(RequestNotification, {
    foreignKey: "notificationId",
  });
RequestNotification.belongsTo(Notification, {
  foreignKey: "notificationId",
});

//------------------------------------------
// Request notifications reference a friendship
FriendShip.hasMany(RequestNotification, {
  foreignKey: "friendshipId",
});
RequestNotification.belongsTo(FriendShip, {
  foreignKey: "friendshipId",
});

//------------------------------------------
// Notification can be a reminder notification
Notification.hasOne(ReminderNotification, {
  foreignKey: "notificationId",
});
ReminderNotification.belongsTo(Notification, {
  foreignKey: "notificationId",
});

//------------------------------------------
// Reminder notifications reference a reminder
Reminder.hasOne(ReminderNotification, {
  foreignKey: "reminderId",
});
ReminderNotification.belongsTo(Reminder, {
  foreignKey: "reminderId",
});

//------------------------------------------
// Notification can be an event notification
Notification.hasOne(EventNotification, {
  foreignKey: "notificationId",
});
EventNotification.belongsTo(Notification, {
  foreignKey: "notificationId",
});

//------------------------------------------
// Event notifications reference an event
Event.hasMany(EventNotification, {
  foreignKey: "eventId",
});
EventNotification.belongsTo(Event, {
  foreignKey: "eventId",
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
  Notification,
  RequestNotification,
  ReminderNotification,
  EventNotification,
  Message,
};

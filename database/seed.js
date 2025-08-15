const db = require("./db");
const {
  User,
  Business,
  Follow,
  FriendShip,
  CalendarItem,
  Event,
  Attendee,
  Reminder,
  Notification,
  RequestNotification,
} = require("./index");

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    const users = await User.bulkCreate([
      {
        firstName: "Nuria",
        lastName: "Siddiqa",
        username: "cnasty",
        email: "nuria@example.com",
        passwordHash: User.hashPassword("user111"),
        isAdmin: true,
      },
      {
        firstName: "Mekhribon",
        lastName: "Yusufbekova",
        username: "Bonnie",
        email: "mekhribon@example.com",
        passwordHash: User.hashPassword("user222"),
        isAdmin: true,
      },
      {
        firstName: "Guarionex",
        lastName: "Tavares",
        username: "GuaroChief",
        email: "guaro@example.com",
        passwordHash: User.hashPassword("user333"),
        isAdmin: true,
      },
      {
        firstName: "Joseph",
        lastName: "Collado",
        username: "TPenguin",
        email: "joseph@example.com",
        passwordHash: User.hashPassword("user444"),
        isAdmin: true,
      },
      {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe92",
        email: "johndoe92@example.com",
        passwordHash: User.hashPassword("securePass123"),
      },
      {
        firstName: "Maria",
        lastName: "Gomez",
        username: "mariag",
        email: "mariag@example.com",
        passwordHash: User.hashPassword("mariaSecret!45"),
      },
      {
        firstName: "Akira",
        lastName: "Tanaka",
        username: "akira.t",
        email: "akira.t@example.com",
        passwordHash: User.hashPassword("T@naka2025"),
      },
      {
        firstName: "Lila",
        lastName: "Thompson",
        username: "lilat",
        email: "lilat@example.com",
        passwordHash: User.hashPassword("Lila#7890"),
      },
      {
        firstName: "Nina",
        lastName: "Patel",
        username: "npatel",
        email: "npatel@example.com",
        passwordHash: User.hashPassword("NinaPass!9"),
      },
      {
        firstName: "Omar",
        lastName: "Hassan",
        username: "omarh",
        email: "omarh@example.com",
        passwordHash: User.hashPassword("OmarSecure88"),
      },
      {
        firstName: "Chloe",
        lastName: "Reed",
        username: "chloer",
        email: "chloer@example.com",
        passwordHash: User.hashPassword("ChloeReed@22"),
      },
      {
        firstName: "Leo",
        lastName: "Nguyen",
        username: "leong",
        email: "leong@example.com",
        passwordHash: User.hashPassword("LeoNguyen77"),
      },
      {
        firstName: "Isabella",
        lastName: "Martinez",
        username: "isabellam",
        email: "isabellam@example.com",
        passwordHash: User.hashPassword("IsaMartinez!2025"),
      },
      {
        firstName: "Mateo",
        lastName: "Silva",
        username: "mateos",
        email: "mateos@example.com",
        passwordHash: User.hashPassword("SilvaMateo09"),
      },
      {
        firstName: "Grace",
        lastName: "Liu",
        username: "graceliu",
        email: "graceliu@example.com",
        passwordHash: User.hashPassword("Grace_Liu123"),
      },
      {
        firstName: "Derek",
        lastName: "Foster",
        username: "dfoster",
        email: "dfoster@example.com",
        passwordHash: User.hashPassword("DerekF!45"),
      },
    ]);

    console.log(`👤 Created ${users.length} users`);

    const businesses = await Business.bulkCreate([
      {
        name: "Green Leaf Café",
        email: "contact@greenleafcafe.com",
        bio: "A cozy plant-based café offering locally sourced meals and specialty drinks.",
        category: "Restaurant",
        ownerId: 3,
      },
      {
        name: "Pixel Forge Studio",
        email: "hello@pixelforge.io",
        bio: "Creative digital design agency specializing in branding, UI/UX, and web development.",
        category: "Design",
        ownerId: 1,
      },
      {
        name: "Urban Threads",
        email: "info@urbanthreads.shop",
        bio: "Modern streetwear brand bringing bold fashion to everyday wear.",
        category: "Retail",
        ownerId: 5,
      },
      {
        name: "MindSpring Therapy",
        email: "support@mindspringtherapy.org",
        bio: "Licensed counselors offering mental health support both in-person and online.",
        category: "Healthcare",
        ownerId: 2,
      },
      {
        name: "Summit Climb Co.",
        email: "contact@summitclimbco.com",
        bio: "Indoor climbing gym and outdoor adventure gear store.",
        category: "Fitness",
        ownerId: 3,
      },
      {
        name: "Bloom & Root",
        email: "team@bloomandroot.com",
        bio: "Boutique plant shop with curated greenery and home decor accessories.",
        category: "Retail",
        ownerId: 7,
      },
    ]);

    console.log(`🏢 Created ${businesses.length} businesses`);

    const follows = await Follow.bulkCreate([
      { businessId: 1, userId: 3 },
      { businessId: 1, userId: 2 },
      { businessId: 1, userId: 5 },
      { businessId: 1, userId: 9 },
      { businessId: 1, userId: 13 },

      { businessId: 2, userId: 1 },
      { businessId: 2, userId: 4 },
      { businessId: 2, userId: 10 },
      { businessId: 2, userId: 12 },

      { businessId: 3, userId: 5 },
      { businessId: 3, userId: 2 },
      { businessId: 3, userId: 6 },
      { businessId: 3, userId: 3 },
      { businessId: 3, userId: 9 },
      { businessId: 3, userId: 12 },

      { businessId: 4, userId: 2 },
      { businessId: 4, userId: 1 },
      { businessId: 4, userId: 3 },
      { businessId: 4, userId: 10 },
      { businessId: 4, userId: 13 },

      { businessId: 5, userId: 3 },
      { businessId: 5, userId: 4 },
      { businessId: 5, userId: 6 },
      { businessId: 5, userId: 7 },
      { businessId: 5, userId: 1 },
      { businessId: 5, userId: 11 },
      { businessId: 5, userId: 12 },

      { businessId: 6, userId: 7 },
      { businessId: 6, userId: 8 },
      { businessId: 6, userId: 3 },
      { businessId: 6, userId: 10 },
      { businessId: 6, userId: 13 },
      { businessId: 6, userId: 14 },
    ]);

    console.log(`👀 Created ${follows.length} follows`);

    const friendships = await FriendShip.bulkCreate([
      { user1: 1, user2: 2, status: "accepted" },
      { user1: 1, user2: 3, status: "accepted" },
      { user1: 1, user2: 4, status: "accepted" },
      { user1: 2, user2: 3, status: "accepted" },
      { user1: 2, user2: 4, status: "accepted" },
      { user1: 3, user2: 4, status: "accepted" },

      { user1: 5, user2: 6, status: "pending1" },
      { user1: 5, user2: 7, status: "pending2" },
      { user1: 6, user2: 8, status: "accepted" },

      { user1: 9, user2: 10, status: "accepted" },
      { user1: 9, user2: 11, status: "pending2" },
      { user1: 10, user2: 12, status: "pending1" },

      { user1: 13, user2: 14, status: "accepted" },
      { user1: 14, user2: 15, status: "accepted" },
    ]);

    console.log(`🫂  Created ${friendships.length} friendships`);

    const calendarItems = await CalendarItem.bulkCreate([
      {
        title: "Weekly Team Sync",
        description: "Staff sync-up and planning meeting.",
        location: "123 Main St, Springfield",
        start: "2025-08-01T10:00:00Z",
        end: "2025-08-01T11:00:00Z",
        public: false,
        userId: 3,
      },
      {
        title: "Brand Strategy Workshop",
        description: "Brainstorming session with designers and marketers.",
        location: "45 Market Ave, Suite 200",
        start: "2025-08-02T13:00:00Z",
        end: "2025-08-02T15:30:00Z",
        public: true,
        userId: 1,
      },
      {
        title: "Summer Collection Launch",
        description: "Showcasing the new streetwear line.",
        location: "Urban Threads HQ, 501 Fashion Blvd",
        start: "2025-08-10T17:00:00Z",
        end: "2025-08-10T20:00:00Z",
        public: true,
        userId: 5,
      },
      {
        title: "Personal Therapy Session",
        description: "Weekly therapy with Dr. Logan",
        location: "Online (Zoom)",
        start: "2025-08-05T09:00:00Z",
        end: "2025-08-05T10:00:00Z",
        public: false,
        userId: 8,
      },
      {
        title: "Mental Health Awareness Talk",
        description: "Free community session hosted by MindSpring Therapy.",
        location: "Community Center, 88 Elm St",
        start: "2025-08-08T18:00:00Z",
        end: "2025-08-08T19:30:00Z",
        public: true,
        userId: 2,
      },
      {
        title: "Climbing Competition Finals",
        description: "Summit Climb Co. hosts its annual competition.",
        location: "Summit Climb Gym, 200 Heights Dr",
        start: "2025-08-15T12:00:00Z",
        end: "2025-08-15T16:00:00Z",
        public: true,
        userId: 3,
      },
      {
        title: "Weekend Plant Care",
        description: "Water and repot my houseplants.",
        location: "Home",
        start: "2025-08-03T09:00:00Z",
        end: "2025-08-03T10:00:00Z",
        public: false,
        userId: 14,
      },
      {
        title: "Pottery and Plants Workshop",
        description: "Learn pottery basics while repotting new plants.",
        location: "Bloom & Root Studio, 321 Grove Ln",
        start: "2025-08-12T14:00:00Z",
        end: "2025-08-12T16:30:00Z",
        public: true,
        userId: 7,
      },
      {
        title: "Yoga and Breathwork",
        description: "Guided session to unwind before the week begins.",
        location: "Summit Climb Studio Room B",
        start: "2025-08-04T08:00:00Z",
        end: "2025-08-04T09:15:00Z",
        public: false,
        userId: 3,
      },
      {
        title: "Dentist Appointment",
        description: "Routine cleaning at Dr. Kim’s office.",
        location: "Smile Dental Clinic, 789 Wellness Rd",
        start: "2025-08-07T11:30:00Z",
        end: "2025-08-07T12:00:00Z",
        public: false,
        userId: 9,
      },
      {
        title: "Morning Jog",
        description: "Jog through the park for 30 minutes.",
        location: "Maple Park Trail",
        start: "2025-08-06T06:30:00Z",
        end: "2025-08-06T07:00:00Z",
        public: false,
        userId: 12,
      },
      {
        title: "Book Club Meetup",
        description: "Discuss this month’s novel: *The Silent Patient*.",
        location: "City Library, Room 3A",
        start: "2025-08-09T18:00:00Z",
        end: "2025-08-09T19:30:00Z",
        public: true,
        userId: 10,
      },
      {
        title: "Grocery Run",
        description: "Weekly grocery shopping trip.",
        location: "Whole Market, 125 Greenway",
        start: "2025-08-03T14:00:00Z",
        end: "2025-08-03T15:00:00Z",
        public: false,
        userId: 11,
      },
      {
        title: "Photography Walk",
        description: "Nature walk with friends to take photos.",
        location: "Ridgewood Nature Reserve",
        start: "2025-08-17T09:30:00Z",
        end: "2025-08-17T11:30:00Z",
        public: true,
        userId: 13,
      },
      {
        title: "Meditation Time",
        description: "20 minutes of silent meditation.",
        location: "Living Room",
        start: "2025-08-01T08:00:00Z",
        end: "2025-08-01T08:20:00Z",
        public: false,
        userId: 14,
      },
      {
        title: "Birthday Dinner with Family",
        description: "Celebrating mom’s birthday at her favorite place.",
        location: "Olivetto’s Italian Bistro",
        start: "2025-08-13T19:00:00Z",
        end: "2025-08-13T21:00:00Z",
        public: false,
        userId: 6,
      },
      {
        title: "Online Coding Bootcamp",
        description: "Live workshop on React & Node.js development.",
        location: "Online - Zoom link provided",
        start: "2025-08-20T17:00:00Z",
        end: "2025-08-20T20:00:00Z",
        public: true,
        userId: 9,
      },
      {
        title: "Lunch with Sarah",
        description: "Catching up over lunch with an old friend.",
        location: "Cafe Lume, 42 Riverfront Drive",
        start: "2025-08-07T12:30:00Z",
        end: "2025-08-07T13:30:00Z",
        public: false,
        userId: 15,
      },
      {
        title: "Weekly Meal Prep",
        description: "Prepare meals for the upcoming week.",
        location: "Home Kitchen",
        start: "2025-08-04T17:30:00Z",
        end: "2025-08-04T19:00:00Z",
        public: false,
        userId: 13,
      },
      {
        title: "Game Night",
        description: "Board games and snacks with roommates.",
        location: "Apartment 4C",
        start: "2025-08-05T20:00:00Z",
        end: "2025-08-05T22:30:00Z",
        public: false,
        userId: 9,
      },
    ]);

    const events = await Event.bulkCreate([
      {
        itemId: 1,
        chatLink: null,
        published: true,
        businessId: 1,
      },
      {
        itemId: 2,
        chatLink: null,
        published: true,
        businessId: 2,
      },
      {
        itemId: 3,
        chatLink: null,
        published: false,
        businessId: 3,
      },
      {
        itemId: 5,
        chatLink: null,
        published: true,
        businessId: 4,
      },
      {
        itemId: 6,
        chatLink: null,
        published: true,
        businessId: 5,
      },
      {
        itemId: 8,
        chatLink: null,
        published: true,
        businessId: 6,
      },
      {
        itemId: 9,
        chatLink: null,
        published: true,
        businessId: 5,
      },
      {
        itemId: 12,
        chatLink: null,
        published: true,
        businessId: null,
      },
      {
        itemId: 14,
        chatLink: null,
        published: true,
        businessId: null,
      },
      {
        itemId: 17,
        chatLink: null,
        published: false,
        businessId: null,
      },
    ]);

    console.log(
      `📆 Created ${calendarItems.length} calendar items with ${events.length} corresponding events`
    );

    const notifications = await Notification.bulkCreate([
      // Accepted Friend Requests
      { userId: 1, read: true },
      { userId: 1, read: false },
      { userId: 1, read: true },
      { userId: 2, read: false },
      { userId: 3, read: false },
      { userId: 4, read: false },
      { userId: 8, read: false },
      { userId: 9, read: false },
      { userId: 14, read: false },
      { userId: 14, read: false },

      // Friend Requests Pending 1
      { userId: 6, read: false },
      { userId: 12, read: false },

      // Friend Requests Pending 2
      { userId: 5, read: false },
      { userId: 9, read: false },
    ]);

    const request_notifications = await RequestNotification.bulkCreate([
      { notificationId: 1, friendshipId: 1 },
      { notificationId: 2, friendshipId: 2 },
      { notificationId: 3, friendshipId: 3 },
      { notificationId: 4, friendshipId: 5 },
      { notificationId: 5, friendshipId: 4 },
      { notificationId: 6, friendshipId: 6 },
      { notificationId: 7, friendshipId: 9 },
      { notificationId: 8, friendshipId: 10 },
      { notificationId: 9, friendshipId: 13 },
      { notificationId: 10, friendshipId: 14 },

      { notificationId: 11, friendshipId: 7 },
      { notificationId: 12, friendshipId: 12 },
      { notificationId: 13, friendshipId: 8 },
      { notificationId: 14, friendshipId: 11 },
    ]);

    console.log(`🔔 Created ${notifications.length} notifications`);

    const attendees = await Attendee.bulkCreate([
      // Business Event: Weekly Team Sync (itemId: 1, owner: userId 3)
      { eventId: 1, userId: 3 },
      { eventId: 1, userId: 1 },
      { eventId: 1, userId: 2 },
      { eventId: 1, userId: 4 },

      // Business Event: Brand Strategy Workshop (itemId: 2, owner: userId 1)
      { eventId: 2, userId: 1 },
      { eventId: 2, userId: 5 },
      { eventId: 2, userId: 9 },
      { eventId: 2, userId: 10 },
      { eventId: 2, userId: 11 },

      // Business Event: Summer Collection Launch (itemId: 3, owner: userId 5)
      { eventId: 3, userId: 5 },
      { eventId: 3, userId: 2 },
      { eventId: 3, userId: 6 },
      { eventId: 3, userId: 8 },
      { eventId: 3, userId: 10 },
      { eventId: 3, userId: 12 },
      { eventId: 3, userId: 14 },
      { eventId: 3, userId: 16 },

      // Business Event: Mental Health Awareness Talk (itemId: 5, owner: userId 2)
      { eventId: 4, userId: 2 },
      { eventId: 4, userId: 3 },
      { eventId: 4, userId: 6 },
      { eventId: 4, userId: 7 },
      { eventId: 4, userId: 10 },
      { eventId: 4, userId: 11 },
      { eventId: 4, userId: 15 },

      // Business Event: Climbing Competition Finals (itemId: 6, owner: userId 3)
      { eventId: 5, userId: 3 },
      { eventId: 5, userId: 1 },
      { eventId: 5, userId: 4 },
      { eventId: 5, userId: 6 },
      { eventId: 5, userId: 9 },
      { eventId: 5, userId: 11 },
      { eventId: 5, userId: 13 },
      { eventId: 5, userId: 15 },

      // Business Event: Pottery and Plants Workshop (itemId: 8, owner: userId 7)
      { eventId: 6, userId: 7 },
      { eventId: 6, userId: 4 },
      { eventId: 6, userId: 6 },
      { eventId: 6, userId: 10 },
      { eventId: 6, userId: 13 },
      { eventId: 6, userId: 14 },

      // Business Event: Yoga and Breathwork (itemId: 9, owner: userId 3)
      { eventId: 7, userId: 3 },
      { eventId: 7, userId: 2 },
      { eventId: 7, userId: 4 },
      { eventId: 7, userId: 7 },
      { eventId: 7, userId: 8 },
      { eventId: 7, userId: 11 },

      // User Event: Book Club Meetup (itemId: 12, userId: 10)
      { eventId: 8, userId: 10 },
      { eventId: 8, userId: 6 },
      { eventId: 8, userId: 11 },
      { eventId: 8, userId: 13 },

      // User Event: Photography Walk (itemId: 14, userId: 13)
      { eventId: 9, userId: 13 },
      { eventId: 9, userId: 9 },
      { eventId: 9, userId: 12 },

      // User Event: Online Coding Bootcamp (itemId: 17, userId: 9)
      { eventId: 10, userId: 9 },
      { eventId: 10, userId: 10 },
      { eventId: 10, userId: 12 },
    ]);

    console.log(`👥 Created ${attendees.length} attendees`);

    const reminders = await Reminder.bulkCreate([
      // User 1 — attending 1, 2, 6
      { timeValue: 30, timeScale: "minutes", calendarItemId: 1, ownerId: 1 },
      { timeValue: 2, timeScale: "hours", calendarItemId: 2, ownerId: 1 },
      { timeValue: 2, timeScale: "days", calendarItemId: 6, ownerId: 1 },

      // User 2 — attending 1, 2, 3, 5, 9
      { timeValue: 1, timeScale: "days", calendarItemId: 1, ownerId: 2 },
      { timeValue: 2, timeScale: "hours", calendarItemId: 2, ownerId: 2 },
      { timeValue: 2, timeScale: "hours", calendarItemId: 3, ownerId: 2 },
      { timeValue: 30, timeScale: "minutes", calendarItemId: 5, ownerId: 2 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 9, ownerId: 2 },

      // User 3 — attending 1, 5, 6, 9
      { timeValue: 30, timeScale: "minutes", calendarItemId: 1, ownerId: 3 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 5, ownerId: 3 },
      { timeValue: 1, timeScale: "days", calendarItemId: 6, ownerId: 3 },
      { timeValue: 15, timeScale: "minutes", calendarItemId: 9, ownerId: 3 },

      // User 8 — attending 1, 3, 9; owns 4
      { timeValue: 15, timeScale: "minutes", calendarItemId: 1, ownerId: 8 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 3, ownerId: 8 },
      { timeValue: 30, timeScale: "minutes", calendarItemId: 9, ownerId: 8 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 4, ownerId: 8 },

      // User 9 — attending 2, 6, 14, 17; owns 10, 20
      { timeValue: 2, timeScale: "hours", calendarItemId: 10, ownerId: 9 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 20, ownerId: 9 },
      { timeValue: 30, timeScale: "minutes", calendarItemId: 2, ownerId: 9 },
      { timeValue: 2, timeScale: "hours", calendarItemId: 6, ownerId: 9 },
      { timeValue: 1, timeScale: "days", calendarItemId: 14, ownerId: 9 },
      { timeValue: 3, timeScale: "hours", calendarItemId: 17, ownerId: 9 },

      // User 10 — attending 1, 2, 5, 8, 12, 17
      { timeValue: 2, timeScale: "hours", calendarItemId: 1, ownerId: 10 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 2, ownerId: 10 },
      { timeValue: 30, timeScale: "minutes", calendarItemId: 5, ownerId: 10 },
      { timeValue: 45, timeScale: "minutes", calendarItemId: 8, ownerId: 10 },
      { timeValue: 1, timeScale: "days", calendarItemId: 12, ownerId: 10 },
      { timeValue: 3, timeScale: "hours", calendarItemId: 17, ownerId: 10 },

      // User 13 — attending 3, 8, 12, 14; owns 19
      { timeValue: 15, timeScale: "minutes", calendarItemId: 14, ownerId: 13 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 19, ownerId: 13 },
      { timeValue: 1, timeScale: "days", calendarItemId: 3, ownerId: 13 },
      { timeValue: 2, timeScale: "hours", calendarItemId: 8, ownerId: 13 },
      { timeValue: 1, timeScale: "days", calendarItemId: 12, ownerId: 13 },

      // User 14 — attending 3, 8; owns 7, 15
      { timeValue: 1, timeScale: "hours", calendarItemId: 7, ownerId: 14 },
      { timeValue: 30, timeScale: "minutes", calendarItemId: 15, ownerId: 14 },
      { timeValue: 30, timeScale: "minutes", calendarItemId: 3, ownerId: 14 },
      { timeValue: 1, timeScale: "hours", calendarItemId: 8, ownerId: 14 },
    ]);

    console.log(`⏰ Created ${reminders.length} reminders`);

    console.log("🌱 Seeded the database");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();

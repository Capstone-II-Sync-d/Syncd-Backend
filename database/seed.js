const db = require("./db");
const { User, Business, Follow, FriendShip } = require("./index");

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
      { user1: 14, user2: 15, status: "accepted" }
    ]);

    console.log(`🫂  Created ${friendships.length} friendships`);

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

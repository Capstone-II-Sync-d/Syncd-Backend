const db = require("./db");
const { User, Business } = require("./index");

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

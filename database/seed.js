const db = require("./db");
const { User } = require("./index");

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
        passwordHash: User.hashPassword("securePass123")
      },
      {
        firstName: "Maria",
        lastName: "Gomez",
        username: "mariag",
        email: "mariag@example.com",
        passwordHash: User.hashPassword("mariaSecret!45")
      },
      {
        firstName: "Akira",
        lastName: "Tanaka",
        username: "akira.t",
        email: "akira.t@example.com",
        passwordHash: User.hashPassword("T@naka2025")
      },
      {
        firstName: "Lila",
        lastName: "Thompson",
        username: "lilat",
        email: "lilat@example.com",
        passwordHash: User.hashPassword("Lila#7890")
      }
    ]);

    console.log(`👤 Created ${users.length} users`);

    // Create more seed data here once you've created your models
    // Seed files are a great way to test your database schema!

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

const express = require("express");
const router = express.Router();
//Importing models needed
const { User, Business, FriendShip, Follows } = reuire("../database");
// Import Sequelize operators
const { Op } = require("sequelize");

//User Profile Routing
//|-----------------------------------------------------------------|

//Edit a users profile information
router.patch("/user-edit/:id", async (req, res) => {
  try {
    //Get user ID from url parameters
    const userId = req.params.id;

    //Find the user with the id inside url params
    const user = await User.findByPk(userId);

    //Get the body of information sent.
    //If anything was changed, it will be updated.
    const userProfile = req.body;

    //Updates the user profile with body sent in.
    await user.update(userProfile);
    res.status(200).json("Profile has successfully updated");
  } catch (error) {
    console.error("Error editing user profile:", error);
    res.status(500).json({ error: "Failed to edit user profile" });
  }
});

//Delete a users profile
router.delete("/user-delete/:id", async (req, res) => {
  try {
    //Get user ID from url parameters
    const userId = req.params.id;

    //Find the user with the id inside url params
    const user = await User.findByPk(userId);

    //Deletes that user
    await user.delete();
    res.status(200).json("User has successfully been deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//Get all friendships of a user
router.get("/user-friendShip/:id", async (req, res) => {
  try {
    //Get user ID from url parameters
    const userId = req.params.id;

    const friends = await FriendShip.findAll({
      where: {
        [Op.or]: [
          {
            user1: userId,
            user2: userId,
          },
        ],
      },
    });
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error detching friendships:", error);
    res.status(500).json({ error: "Failed to fetch friendships" });
  }
});

//Get all businesses made by a user
router.get("/user-businesseses-made/:id", async (req, res) => {
  try {
    //Get user ID from url parameters
    const userId = req.params.id;

    const businesses = Business.findAll({ where: { ownerId: userId } });

    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error detching businesses made by user:", error);
    res.status(500).json({ error: "Failed to fetch businesses made by user" });
  }
});

//Get all businesses a user follows
router.post("/user-follows/:id", async (req, res) => {});

//Business Profile Routing

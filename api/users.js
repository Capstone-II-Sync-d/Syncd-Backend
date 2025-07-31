const express = require("express");
const router = express.Router();
//Importing models needed
const { User, Business, FriendShip, Follow } = reuire("../database");
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
    //Send a status of 200 if it goes through and send a json message saying what the 200 message was for
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
    //Send a status of 200 if it goes through and send a json message saying what the 200 message was for
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

    //Find all friend of that specific user
    const friends = await FriendShip.findAll({
      where: {
        //or operator in express to check for any friendship where user1 OR user2 has that specific userId
        [Op.or]: [
          {
            user1: userId,
            user2: userId,
          },
        ],
      },
    });
    //Send back status of 200 if everything goes through and send the friends of that user
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

    //Find all business by this owner
    const businesses = Business.findAll({ where: { ownerId: userId } });

    //Send back status of 200 if everything goes through and send the friends of that user
    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error detching businesses made by user:", error);
    res.status(500).json({ error: "Failed to fetch businesses made by user" });
  }
});

//Get all businesses a user follows
router.post("/user-follows/:id", async (req, res) => {
  //Get user ID from url parameters
  const user_id = req.params.id;

  const businessFollowing = Follow.findAll({ where: { userId: user_id } });
});

//|---------------------------------------------------------------------------------|
//Business Profile Routing

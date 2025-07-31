const express = require("express");
const router = express.Router();
//Importing models needed
const { User, Business, FriendShip, Follow } = require("../database");
// Import Sequelize operators
const { Op } = require("sequelize");

//|---------------------------------------------------------------------------------------|
//              **************|User Profile Routing|****************
//|---------------------------------------------------------------------------------------|
//Edit a users profile information
router.patch("/user/:id", async (req, res) => {
  //Get user ID from url parameters
  const userId = req.params.id;
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
    res.status(500).json({ error: `Failed to edit user ${userId} profile` });
  }
});

//|-----------------------------------------------------------------|
//Delete a users profile
router.delete("/user/:id", async (req, res) => {
  //Get user ID from url parameters
  const userId = req.params.id;
  try {
    //Find the user with the id inside url params
    const user = await User.findByPk(userId);

    //Deletes that user
    await user.delete();
    //Send a status of 200 if it goes through and send a json message saying what the 200 message was for
    res.status(200).json("User has successfully been deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: `Failed to delete user ${userId}` });
  }
});

//|-----------------------------------------------------------------|
//Get all friendships of a user
router.get("/user/:id/friends", async (req, res) => {
  //Get user ID from url parameters
  const userId = req.params.id;
  try {
    //Find all friend of that specific user
    const friendsConnected = await FriendShip.findAll({
      where: {
        //or operator in express to check for any friendship where user1 OR user2 has that specific userId
        [Op.or]: [
          {
            user1: userId,
            user2: userId,
          },
        ],
      },
      // Loads user details for both people in the friendship
      include: [
        { model: User, as: "primary" },
        { model: User, as: "secondary" },
      ],
    });
    //maps through friendships that we gained to find the friend of that specific user
    const friends = friendsConnected.map((friendship) => {
      if (friendship.user1 === userId) {
        return friendship.secondary;
      } else if (friendship.user2 === userId) {
        return friendship.primary;
      }
    });
    //Send back status of 200 if everything goes through and send the friends of that user
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch friends of user ${userId}` });
  }
});

//|-----------------------------------------------------------------|
//Get all businesses made by a user
router.get("/user/business/owner/:id", async (req, res) => {
  //Get user ID from url parameters
  const userId = req.params.id;
  try {
    //Find all business by this owner
    const businesses = Business.findAll({ where: { ownerId: userId } });

    //Send back status of 200 if everything goes through and send the friends of that user
    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error fetching businesses made by user:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch businesses made by user ${userId}` });
  }
});

//|-----------------------------------------------------------------|
//Get all businesses a user follows
router.post("/user/following/:id", async (req, res) => {
  //Get user ID from url parameters
  const userId = req.params.id;
  try {
    //Get all Follows with a specific User
    const businessFollowing = Follow.findAll({
      where: { userId: userId },
      include: Business,
    });

    //Send back status of 200 if everything goes through and send the friends of that user
    res.status(200).json(businessFollowing);
  } catch (error) {
    console.error("Error fetching businesses a user follows:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch businesses user ${userId} follows` });
  }
});
//|---------------------------------------------------------------------------------|
//        **************|Business Profile Routing|****************
//|---------------------------------------------------------------------------------|

// Create a business
router.post("/business/:userId", async (req, res) => {
  try {
    const ownerId = req.params.userId; // Get the user ID from the URL
    const businessInfo = req.body; // Get business data from request body

    // Attach the ownerId to the business info
    const newBusiness = await Business.create({
      ...businessInfo,
      ownerId: parseInt(ownerId),
    });

    res.status(201).json(newBusiness); // Respond with the newly created business
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
});

//|-----------------------------------------------------------------|
//Get a specific business by id
router.get("/business/:id", async (req, res) => {
  //Get the id from URL
  const businessId = req.params.id;
  try {
    //Find the specific business with that id
    const business = await Business.findByPk(businessId);

    res.status(200).json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ error: "Failed to fetch business" });
  }
});

//|-----------------------------------------------------------------|
//Edit a business profile information
router.patch("/business/:id", async (req, res) => {
  //Get the id from URL
  const businessId = req.params.id;
  try {
    //Get all of the information they are trying to edit
    const businessInfoChange = req.body;
    //Find the specific business with that id
    const business = await Business.findByPk(businessId);

    //Update the business with the edited information
    await business.update(businessInfoChange);

    res.status(200).json(business);
  } catch (error) {
    console.error("Error editing business:", error);
    res.status(500).json({ error: "Failed to edit business" });
  }
});

//|-----------------------------------------------------------------|
//Delete a business profile
router.delete("/business", async (req, res) => {
  //Get the id from URL
  const businessId = req.params.id;
  try {
    //Find the specific business with that id
    const business = await Business.findByPk(businessId);

    //Delete the business
    await business.delete();

    res.status(200);
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ error: "Failed to delete business" });
  }
});

//|-----------------------------------------------------------------|
//Get all the followers of a business
router.get("/business/:id", async (req, res) => {
  //Get the id from URL
  const business_id = req.params.id;
  try {
    //Find the specific business with that id
    const followers = await Business.findAll({
      where: { businessId: business_id },
      include: User,
    });

    res.status(200).json(followers);
  } catch (error) {
    console.error("Error fetching all followers:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch all followers of the business" });
  }
});

//|-------------------------------------------------------------------|

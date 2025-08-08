const express = require("express");
const router = express.Router();
//Importing models needed
const { User, Business, FriendShip, Follow } = require("../database");
// Import Sequelize operators
const { Op } = require("sequelize");
const { authenticateJWT } = require("../auth");

//|---------------------------------------------------------------------------------------|
//              **************|User Profile Routing|****************
//|---------------------------------------------------------------------------------------|

// Get a specific user's information
// If they are friends, get all information, if not only username
router.get("/user/:id", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from url parameters and requesting user ID from auth token
    const userId = req.params.id;
    const requestingUserId = req.user.id;

    const isOwner = parseInt(userId) === parseInt(requestingUserId);

    // Find the requested user with only public info by default
    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "profilePicture"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if requesting user is friends with the requested user
    const friendship = await FriendShip.findOne({
      where: {
        [Op.or]: [
          { user1: userId, user2: requestingUserId },
          { user1: requestingUserId, user2: userId },
        ],
      },
    });

    // If friends, return all user information
    if (isOwner || friendship) {
      const fullUser = await User.findByPk(userId);
      return res.status(200).json(fullUser);
    }

    // If not friends, return only public information
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

//|-----------------------------------------------------------------|
// Edit current user's profile information [Protected]
// Uses /me endpoint and gets user ID from auth token
router.patch("/me", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Get the body of information sent
    const userProfile = req.body;

    // Find the current user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Updates the user profile with body sent in
    await user.update(userProfile);
    // Send a status of 200 if it goes through and send a json message
    res.status(200).json("Profile has successfully updated");
  } catch (error) {
    console.error("Error editing user profile:", error);
    res.status(500).json({ error: "Failed to edit user profile" });
  }
});

//|-----------------------------------------------------------------|
// Delete current user's profile [Protected]
// Uses /me endpoint and gets user ID from auth token
router.delete("/me", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Find the current user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Deletes that user
    await user.destroy();
    // Send a status of 200 if it goes through and send a json message
    res.status(200).json("User has successfully been deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//|-----------------------------------------------------------------|
// Get all friendships of current user [Protected]
router.get("/me/friends", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id;

    // Find all friends of the current user
    const friendsConnected = await FriendShip.findAll({
      where: {
        // or operator to check for any friendship where user1 OR user2 is the current user
        [Op.or]: [{ user1: userId }, { user2: userId }],
      },
      // Loads user details for both people in the friendship
      include: [
        { model: User, as: "primary" },
        { model: User, as: "secondary" },
      ],
    });

    // maps through friendships to find the friend of the current user
    const friends = friendsConnected.map((friendship) => ({
      status: friendship.status,
      user:
        friendship.user1 === userId ? friendship.secondary : friendship.primary,
    }));

    // Send back status of 200 if everything goes through and send the friends
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

//|-----------------------------------------------------------------|
// Get all friendships of a user by id[Protected]
router.get("/user/:id/friends", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.params.id;

    // Find all friends of the current user
    const friendsConnected = await FriendShip.findAll({
      where: {
        // or operator to check for any friendship where user1 OR user2 is the current user
        [Op.or]: [{ user1: userId }, { user2: userId }],
      },
      // Loads user details for both people in the friendship
      include: [
        { model: User, as: "primary" },
        { model: User, as: "secondary" },
      ],
      status: "accepted",
    });

    // maps through friendships to find the friend of the current user
    const friends = friendsConnected.map((friendship) => ({
      user:
        friendship.user1 === userId ? friendship.secondary : friendship.primary,
    }));

    // Send back status of 200 if everything goes through and send the friends
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

//|-----------------------------------------------------------------|
// Get all friendships of a user by id[Protected]
router.get("/user/:id/friends", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.params.id;

    // Find all friends of the current user
    const friendsConnected = await FriendShip.findAll({
      where: {
        // or operator to check for any friendship where user1 OR user2 is the current user
        [Op.or]: [{ user1: userId }, { user2: userId }],
      },
      // Loads user details for both people in the friendship
      include: [
        { model: User, as: "primary" },
        { model: User, as: "secondary" },
      ],
    });

    // maps through friendships to find the friend of the current user
    const friends = friendsConnected.map((friendship) => ({
      status: friendship.status,
      user:
        friendship.user1 === userId ? friendship.secondary : friendship.primary,
    }));

    // Send back status of 200 if everything goes through and send the friends
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

//|-----------------------------------------------------------------|
// Get all businesses made by current user [Protected]
router.get("/me/businesses", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Find all business by this owner
    const businesses = await Business.findAll({ where: { ownerId: userId } });

    // Send back status of 200 if everything goes through
    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error fetching businesses made by user:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

//|-----------------------------------------------------------------|
// Get all businesses made by current user [Protected]
router.get("/user/:id/businesses", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Find all business by this owner
    const businesses = await Business.findAll({ where: { ownerId: userId } });

    // Send back status of 200 if everything goes through
    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error fetching businesses made by user:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

//|-----------------------------------------------------------------|
// Get all businesses current user follows [Protected]
router.get("/me/following", authenticateJWT, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Get all Follows for the current user
    const businessFollowing = await Follow.findAll({
      where: { userId: userId },
      include: Business,
    });

    // Send back status of 200 if everything goes through
    res.status(200).json(businessFollowing);
  } catch (error) {
    console.error("Error fetching businesses a user follows:", error);
    res.status(500).json({ error: "Failed to fetch followed businesses" });
  }
});

//|---------------------------------------------------------------------------------|
//        **************|Business Profile Routing|****************
//|---------------------------------------------------------------------------------|

// Create a business [Protected]
// Gets owner ID from auth token instead of URL parameter
router.post("/business", authenticateJWT, async (req, res) => {
  try {
    // Get owner ID from auth token
    const ownerId = req.user.id;
    // Get business data from request body
    const businessInfo = req.body;

    // Create the new business with ownerId attached
    const newBusiness = await Business.create({
      ...businessInfo,
      ownerId: ownerId,
    });

    // Respond with the newly created business
    res.status(200).json(newBusiness);
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
});

//|-----------------------------------------------------------------|
// Get a specific business by id
router.get("/business/:id", async (req, res) => {
  // Get the id from URL
  const businessId = req.params.id;
  try {
    // Find the specific business with that id
    const business = await Business.findByPk(businessId, { include: User });

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.status(200).json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ error: "Failed to fetch business" });
  }
});

//|-----------------------------------------------------------------|
// Edit a business profile information [Protected]
// Only the owner can edit their business
router.patch("/business/:id", authenticateJWT, async (req, res) => {
  // Get the id from URL
  const businessId = req.params.id;
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Get all of the information they are trying to edit
    const businessInfoChange = req.body;

    // Find the specific business with that id
    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check if user is the owner of the business
    if (business.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this business" });
    }

    // Update the business with the edited information
    await business.update(businessInfoChange);

    res.status(200).json(business);
  } catch (error) {
    console.error("Error editing business:", error);
    res.status(500).json({ error: "Failed to edit business" });
  }
});

//|-----------------------------------------------------------------|
// Delete a business profile by id [Protected]
// Only the owner can delete their business
router.delete("/business/:id", authenticateJWT, async (req, res) => {
  // Get the id from URL
  const businessId = req.params.id;
  try {
    // Get user ID from auth token
    const userId = req.user.id;
    // Find the specific business with that id
    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check if user is the owner of the business
    if (business.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this business" });
    }

    // Delete the business
    await business.destroy();

    res.status(200).json("Business has been deleted");
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ error: "Failed to delete business" });
  }
});

//|-----------------------------------------------------------------|
// Get all the followers of a business
router.get("/business/:id/followers", async (req, res) => {
  // Get the id from URL
  const business_id = req.params.id;
  try {
    // Find all followers for this business
    const followers = await Follow.findAll({
      where: { businessId: business_id },
      include: User,
    });

    res.status(200).json(followers);
  } catch (error) {
    console.error("Error fetching all followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

//|-------------------------------------------------------------------|
module.exports = router;

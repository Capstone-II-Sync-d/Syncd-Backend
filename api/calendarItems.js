const express = require("express");
const router = express.Router();
//Importing models needed
const {
  User,
  Business,
  CalendarItem,
  Attendee,
  Reminder,
  Event,
  FriendShip,
} = require("../database");
// Import Sequelize operators
const { Op } = require("sequelize");
const { authenticateJWT } = require("../auth");

//|=====================================================================================|
//         **************|User Calendar Item Routing (Nuria)|****************
//|=====================================================================================|

//|-----------------------------------------------------------------|
// Get all calendar items for current user [Protected]
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    // Get user id from paramaters
    const id = req.user.id;
    // Find all calendar items created by this user
    const userCalendarItems = await CalendarItem.findAll({
      // Filter so we only get calendar items created by this specific user
      where: { userId: id },
      // Sort by start time (earliest first)
      order: [["start", "ASC"]],
    });

    // Send success response if everything works and send back the user's calendar items
    res.status(200).json(userCalendarItems);
  } catch (error) {
    console.error("Error fetching user's calendar items:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch calendar items for user ${id}` });
  }
});

//|-----------------------------------------------------------------|
// Get all public calendar items for a specific user (only friends can see) [Protected]
router.get("/user/:id", authenticateJWT, async (req, res) => {
  try {
    // Get user id from paramaters
    const id = req.params.id;
    // Get requesting user's id from auth token
    const requestingUserId = req.user.id;
    // Check if requesting user is friends with requested user
    const friendship = await FriendShip.findOne({
      where: {
        [Op.or]: [
          { user1: id, user2: requestingUserId },
          { user1: requestingUserId, user2: id },
        ],
        status: "accepted",
      },
    });

    // If not friends, return error
    if (!friendship) {
      return res
        .status(403)
        .json({ error: "You can only view calendar items of your friends" });
    }
    // Find all calendar items created by this user
    const userCalendarItems = await CalendarItem.findAll({
      // Filter so we only get calendar items created by this specific user
      where: { userId: id, privacy: "public" },
      // Sort by start time (earliest first)
      order: [["start", "ASC"]],
    });

    // Send success response if everything works and send back the user's public calendar items
    res.status(200).json(userCalendarItems);
  } catch (error) {
    console.error("Error fetching user's calendar items:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch calendar items for user ${id}` });
  }
});

//|-----------------------------------------------------------------|
// Get one of a user's calendar items id [Protected]
router.get("/user/item/:itemId", authenticateJWT, async (req, res) => {
  try {
    // Get calendar item id from parameters
    const itemId = req.params.itemId;
    // Get requesting user's id from auth token
    const requestingUserId = req.user.id;
    // Find this specific calendar item
    const calendarItem = await CalendarItem.findByPk(itemId);

    // Check if calendar item was found, send error message if !found
    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found" });
    }

    // If the calendar item is private, check if requesting user is the owner
    if (
      calendarItem.privacy === "private" &&
      calendarItem.userId !== requestingUserId
    ) {
      return res
        .status(403)
        .json({ error: "You are unauthorized to view this item" });
    }

    // If calendar item is public but not owned by the requesting user, check if they are friends
    if (
      calendarItem.privacy === "public" &&
      calendarItem.userId !== requestingUserId
    ) {
      const friendship = await FriendShip.findOne({
        where: {
          [Op.or]: [
            { user1: calendarItem.userId, user2: requestingUserId },
            { user1: requestingUserId, user2: calendarItem.userId },
          ],
          status: "accepted",
        },
      });
      // If not friends, return error
      if (!friendship) {
        return res
          .status(403)
          .json({ error: "You can only view calendar items of your friends" });
      }
    }

    // Send success if everything is good and return the calendar item
    res.status(200).json(calendarItem);
  } catch (error) {
    console.error("Error fetching calendar item: ", error);
    res.status(500).json({ error: `Failed to fetch calendar item ${itemId}` });
  }
});

//|-----------------------------------------------------------------|
// Create a new calendar item for a user
router.post("/user/item", authenticateJWT, async (req, res) => {
  try {
    // Get user id from path
    const userId = req.user.id;
    // Get calendar item information from request body
    const calendarItemData = req.body;

    // Create new calendar item with the user id attached
    const newCalendarItem = await CalendarItem.create({
      ...calendarItemData,
      userId: userId,
    });

    // Return success message with the new calendar item
    res.status(201).json(newCalendarItem);
  } catch (error) {
    console.error("Error creating calendar item: ", error);
    res.status(500).json({ error: "Failed to create calendar item" });
  }
});

//|-----------------------------------------------------------------|
// Edit a user calendar item by id
router.patch("/user/item/:itemId", authenticateJWT, async (req, res) => {
  try {
    // Get calendar item id from url
    const itemId = req.params.itemId;
    // Get user id from token
    const userId = req.user.id;
    // Find the specific calendar item with that id
    const calendarItem = await CalendarItem.findByPk(itemId);

    // Check if calendar item was found, send message if not
    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found" });
    }

    // Check if logged in user is the owner of the calendar item
    if (calendarItem.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this calendar item" });
    }

    // Get the updated information from the request body
    const updatedData = req.body;
    // Update the calendar item with the new information
    await calendarItem.update(updatedData);

    // Send success message with the updated calendar item
    res.status(200).json(calendarItem);
  } catch (error) {
    console.error("Error editing calendar item: ", error);
    res.status(500).json({ error: "Failed to edit calendar item" });
  }
});

//|-----------------------------------------------------------------|
// Delete a user calendar item by id
router.delete("/user/item/:itemId", authenticateJWT, async (req, res) => {
  try {
    // Get calendar item id from URL
    const itemId = req.params.itemId;
    // Get user id from auth token
    const requestingUserId = req.user.id;
    // Find the calendar item with that id
    const calendarItem = await CalendarItem.findByPk(itemId);

    // Check if calendar item was found, send error message if !found
    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found" });
    }

    // Check if user logged in is the owner of the item
    if (calendarItem.userId !== requestingUserId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this item" });
    }
    // Delete the item
    await calendarItem.destroy();

    // Send success message
    res.status(200).json({ message: "Calendar item deleted" });
  } catch (error) {
    console.error("Error deleting calendar item:", error);
    res.status(500).json({ error: "Failed to delete calendar item" });
  }
});

//|=====================================================================================|
//       **************|Business Caldendar Item Routing (Bonnie)|****************
//|=====================================================================================|

//|-----------------------------------------------------------------|
// Get all calendar items for a specific business
router.get("/business/:id", async (req, res) => {
  //get business id from URL parameters
  const id = req.params.id;
  try {
    //find all calendar items created by this business
    const calendarItems = await CalendarItem.findAll({
      // Filter to only get calendar items that belong to this specific business
      where: { businessId: id },

      // Load business information as well
      include: [
        {
          model: Business,
          // Only get these specific fields from the business table
          attributes: ["id", "name"],
        },
      ],

      // Sort the calendar items by start time in ascending order (earliest first)
      order: [["start", "ASC"]],
    });

    // Send success response with the business's calendar items
    res.status(200).json(calendarItems);
  } catch (error) {
    // Log error to the console and send failure response
    console.error("Error fetching business's calendar items:", error);
    res
      .status(500)
      .json({ error: `Failed to fetch calendar items for business ${id}` });
  }
});

//|-----------------------------------------------------------------|
// Get a specific business calendar item by id
router.get("/business/:id/:itemId", async (req, res) => {
  // Get business ID and calendar item ID from URL parameters
  const businessId = req.params.id;
  const itemId = req.params.itemId;

  try {
    // Find the calendar item with matching ID that belongs to this business
    const calendarItem = await CalendarItem.findOne({
      where: {
        id: itemId,
        businessId: businessId, // Ensure the item belongs to this business
      },
      include: [
        {
          model: Business,
          attributes: ["id", "name"], // Only include limited business details
        },
      ],
    });

    // If no item is found, send a 404 Not Found response
    if (!calendarItem) {
      return res.status(404).json({
        error: `No calendar item with ID ${itemId} found for business ${businessId}`,
      });
    }

    // Send success response with the found calendar item
    res.status(200).json(calendarItem);
  } catch (error) {
    // Log error and send failure response
    console.error("Error fetching specific business calendar item:", error);
    res.status(500).json({
      error: `Failed to fetch calendar item ${itemId} for business ${businessId}`,
    });
  }
});

//|-----------------------------------------------------------------|
// Create a new calendar item for a business
router.post("/business/:id", async (req, res) => {
  // Get business ID from URL parameters
  const businessId = req.params.id;

  try {
    // Get the calendar item details from the request body
    const calendarItemData = req.body;

    // Create a new calendar item and attach the businessId to it
    const newItem = await CalendarItem.create({
      ...calendarItemData,
      businessId: businessId,
    });

    // Send success response with the newly created calendar item
    res.status(201).json(newItem);
  } catch (error) {
    // Log error to console and send failure response
    console.error("Error creating business calendar item:", error);
    res.status(500).json({
      error: `Failed to create calendar item for business ${businessId}`,
    });
  }
});

//|-----------------------------------------------------------------|
// Edit a business calendar item by id
router.patch("/business/:id/:itemId", async (req, res) => {
  // Get business ID and calendar item ID from URL parameters
  const businessId = req.params.id;
  const itemId = req.params.itemId;

  try {
    // Find the calendar item with matching ID and businessId
    const calendarItem = await CalendarItem.findOne({
      where: {
        id: itemId,
        businessId: businessId,
      },
    });

    // If item not found, send 404
    if (!calendarItem) {
      return res.status(404).json({
        error: `No calendar item with ID ${itemId} found for business ${businessId}`,
      });
    }

    // Update the calendar item with the new data
    await calendarItem.update(req.body);

    // Send success response with updated calendar item
    res.status(200).json(calendarItem);
  } catch (error) {
    // Log error and send failure response
    console.error("Error updating business calendar item:", error);
    res.status(500).json({
      error: `Failed to update calendar item ${itemId} for business ${businessId}`,
    });
  }
});

//|-----------------------------------------------------------------|
// Delete a business calendar item by id
router.delete("/business/:id/:itemId", async (req, res) => {
  // Get business ID and calendar item ID from URL parameters
  const businessId = req.params.id;
  const itemId = req.params.itemId;

  try {
    // Find the calendar item with matching ID and businessId
    const calendarItem = await CalendarItem.findOne({
      where: {
        id: itemId,
        businessId: businessId,
      },
    });

    // If item not found, send 404
    if (!calendarItem) {
      return res.status(404).json({
        error: `No calendar item with ID ${itemId} found for business ${businessId}`,
      });
    }

    // Delete the calendar item
    await calendarItem.destroy();

    // Send success response
    res.status(200).json({
      message: `Calendar item ${itemId} successfully deleted for business ${businessId}`,
    });
  } catch (error) {
    // Log error and send failure response
    console.error("Error deleting business calendar item:", error);
    res.status(500).json({
      error: `Failed to delete calendar item ${itemId} for business ${businessId}`,
    });
  }
});

//|-------------------------------------------------------------------|
// Get all public events
router.get("/events", async (req, res) => {
  try {
    const events = await getEvents(false);
    res.status(200).send(events);
  } catch (error) {
    console.error("Error getting all public events:", error);
    res.status(500).json({
      error: `Failed to get all public events`,
    });
  }
});

//|-------------------------------------------------------------------|
// Get all future public events
router.get("/events/future", async (req, res) => {
  try {
    const events = await getEvents(true);
    res.status(200).send(events);
  } catch (error) {
    console.error("Error getting all future public events:", error);
    res.status(500).json({
      error: `Failed to get all future public events`,
    });
  }
});

//|-------------------------------------------------------------------|
// Helper function to get events using a flag for only future events 
// or all events
const getEvents = async (onlyFuture) => {
  const whereOptions = { public: true }
  if (onlyFuture) {
    const now = new Date();
    whereOptions.start = { [Op.gt]: now };
  }

  try {
    const rawEvents = await Event.findAll({
      where: { published: true },
      include: [
        { model: Business },
        { 
          model: CalendarItem,
          where: whereOptions,
          include: [ { model: User } ],
        },
      ],
      order: [[CalendarItem, 'start']],
    });
    const events = rawEvents.map((event) => ({
      id: event.id,
      title: event.calendar_item.title,
      description: event.calendar_item.description,
      location: event.calendar_item.location,
      startTime: event.calendar_item.start,
      endTime: event.calendar_item.end,
      business: event.business ? event.business.name : null,
      chatLink: event.chatLink,
      creatorName: `${event.calendar_item.user.firstName} ${event.calendar_item.user.lastName}`,
      creatorUsername: event.calendar_item.user.username,
    }));
    return events;
  } catch (error) {
    throw error;
  }
}

module.exports = router;

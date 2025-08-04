const express = require("express");
const router = express.Router();
//Importing models needed
const {
  User,
  Business,
  CalendarItem,
  Attendee,
  Reminder,
} = require("../database");
// Import Sequelize operators
const { Op } = require("sequelize");

//|=====================================================================================|
//         **************|User Calendar Item Routing (Nuria)|****************
//|=====================================================================================|

//|-----------------------------------------------------------------|
// Get all calendar items for a specific user
router.get("/user/:id/calendaritems", async (req, res) => {
  // Get user id from paramaters
  const id = req.params.id;
  try {
    // Find all calendar items created by this user
    const userCalendarItems = await CalendarItem.findAll({
      // Filter so we only get calendar items created by this specific user
      where: { userId: id },
      // Load user information as well
      include: [
        {
          model: User,
          // Only get these specific fields from the user table
          attributes: ["id", "firstName", "lastName", "username"],
        },
      ],
      //Sort by start time (earliest first)
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
//Get one of a user calendarItems by id


//|-----------------------------------------------------------------|
// Create a new calendar item by id


//|-----------------------------------------------------------------|
// Edit a user calendar item by id

//|-----------------------------------------------------------------|
// Delete a user calendar item by id

//|=====================================================================================|
//       **************|Business Caldendar Item Routing (Bonnie)|****************
//|=====================================================================================|

//|-----------------------------------------------------------------|
// Get all calendar items for a specific business
router.get("/business/:id/calendaritems", async (req, res) => {
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

router.get("/business/:id/calendaritems/:itemId", async (req, res) => {
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
router.post("/business/:id/calendaritems", async (req, res) => {
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
router.patch("/business/:id/calendaritems/:itemId", async (req, res) => {
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

router.delete("/business/:id/calendaritems/:itemId", async (req, res) => {
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

modeul.exports = router;

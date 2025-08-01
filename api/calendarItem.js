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
// Get a specific calendar item by id
router.get("/calendaritems/:itemId", async (req, res) => {
  // Get calendar item id from parameters
  const itemId = req.params.itemId;
  try {
    // Find this specific calendar item
    const calendarItem = await CalendarItem.findOne({
      // Filter so we only recieve this specific item
      where: { id: itemId },
    });
    // Check if calendar item was found, send error message if !found
    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found" });
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
router.post("usr");
//|-----------------------------------------------------------------|
// Edit a user calendar item by id

//|-----------------------------------------------------------------|
// Delete a user calendar item by id

//|=====================================================================================|
//       **************|Business Caldendar Item Routing (Bonnie)|****************
//|=====================================================================================|

//|-----------------------------------------------------------------|
// Get all calendar items for a specific business

//|-----------------------------------------------------------------|
// Get a specific business calendar item by id

//|-----------------------------------------------------------------|
// Create a new calendar item for a business

//|-----------------------------------------------------------------|
// Edit a business calendar item by id

//|-----------------------------------------------------------------|
// Delete a business calendar item by id

//|-------------------------------------------------------------------|

module.exports = router;

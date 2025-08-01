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
// Get one of a user's calendar items id
router.get("/calendaritems/:itemId", async (req, res) => {
  // Get calendar item id from parameters
  const itemId = req.params.itemId;
  try {
    // Find this specific calendar item
    const calendarItem = await CalendarItem.findByPk(itemId);

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
router.post("/user/:id/calendaritems", async (req, res) => {
  // Get user id from path
  const userId = req.params.id;
  try {
    // Get calendar item information from request body
    const calendarItemData = req.body;

    // Create new calendar item with the user id attached
    const newCalendarItem = await CalendarItem.create({
      ...calendarItemData,
      userId: parseInt(userId),
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
router.patch("/calendaritems/:itemId", async (req, res) => {
  // Get calendar item id from url
  const itemId = req.params.itemId;
  try {
    // Get the updated information from the request body
    const updatedData = req.body;
    // Find the specific calendar item with that id
    const calendarItem = await CalendarItem.findByPk(itemId);

    // Check if calendar item was found, send message if not
    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found"});
    }

    // Update the calendar item with the new information
    await calendarItem.update(updatedData);

    // Send success message with the updated calendar item
    res.status(200).json(calendarItem);
  } catch (error) {
    console.error("Error editing calendar item: ", error);
    res.status(500).json({error: "Failed to edit calendar item"});
  }
});

//|-----------------------------------------------------------------|
// Delete a user calendar item by id
router.delete("/calendaritems/:itemId", async (req,res) => {
  // Get calendar item id from URL
  const itemId = req.params.itemId;
  try {
    // Find the calendar item with that id
    const calendarItem = await CalendarItem.findByPk(itemId);

    // Check if calendar item was found, send error message if !found
    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found"});
    }

    // Delete the item
    await calendarItem.destroy();

    // Send success message
    res.status(200).json9({message: "Calendar item deleted"});
  } catch (error) {
    console.error("Error deleting calendar item:", error);
    res.status(500).json({error: "Failed to delete calendar item"});
  }
});

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

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
// Get a specific calendar item by id for a specific user

//|-----------------------------------------------------------------|
// Create a new calendar item for a user

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

//|-----------------------------------------------------------------|
// Create a new calendar item for a business

//|-----------------------------------------------------------------|
// Edit a business calendar item by id

//|-----------------------------------------------------------------|
// Delete a business calendar item by id

//|-------------------------------------------------------------------|

modeul.exports = router;

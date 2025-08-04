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
router.get("/user/:id", async (req, res) => {
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
router.get("/:itemId", async (req, res) => {
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
router.post("/user/:id", async (req, res) => {
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
router.patch("/:itemId", async (req, res) => {
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
router.delete("/:itemId", async (req,res) => {
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

module.exports = router;

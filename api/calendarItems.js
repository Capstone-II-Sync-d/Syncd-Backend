const express = require("express");
const router = express.Router();
//Importing models needed
const {
  User,
  Business,
  CalendarItem,
  Event,
  Attendee,
  Reminder,
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
      include: [
        {
          model: Event,
          required: false, // left join - includes items even if no event exists
        },
      ],
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
      where: { userId: id, public: true },
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
    console.log("Calender info", calendarItemData);

    // Create new calendar item with the user id attached
    const newCalendarItem = await CalendarItem.create({
      title: calendarItemData.title,
      description: calendarItemData.description,
      location: calendarItemData.location,
      start: calendarItemData.start,
      end: calendarItemData.end,
      public: calendarItemData.public,
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
//Helper function to check if user owns the business
const checkBusinessOwnership = async (businessId, userId) => {
  const business = await Business.findByPk(businessId);
  if (!business) {
    return { authorized: false, error: "Business not found" };
  }
  if (business.ownerId !== userId) {
    return {
      authorized: false,
      error: "Unauthorized: You must be the business owner",
    };
  }
  return { authorized: true, business };
};

//|-----------------------------------------------------------------|
//Get all calendar items for a specific business [Protected]
router.get("/business/:id", authenticateJWT, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const authCheck = await checkBusinessOwnership(id, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.error });
    }
    const calendarItems = await CalendarItem.findAll({
      include: [
        {
          model: Event,
          where: { businessId: id },
          required: true,
          include: [{ model: Business }],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "username"],
        },
      ],
      order: [["start", "ASC"]],
    });

    res.status(200).json(calendarItems);
  } catch (error) {
    console.error("Error fetching business calendar items:", error);
    res.status(500).json({
      error: `Failed to fetch calendar items for business ${id}`,
    });
  }
});

// Get all calendar items for a specific business
router.get("/business/:id/public", async (req, res) => {
  //get business id from URL parameters
  const id = req.params.id;
  try {
    //verify business exists
    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    //Find all PUBLIC calendar items for this business
    const calendarItems = await CalendarItem.findAll({
      where: { public: true },

      // Load business information as well
      include: [
        {
          model: Event,
          where: {
            businessId: id,
            published: true,
          },
          required: true,
          include: [{ model: Business }],
        },
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "username"],
        },
      ],

      // Sort the calendar items by start time in ascending order (earliest first)
      order: [["start", "ASC"]],
    });

    // Send success response with the business's calendar items
    res.status(200).json(calendarItems);
  } catch (error) {
    // Log error to the console and send failure response
    console.error("Error fetching public business's calendar items:", error);
    res.status(500).json({
      error: `Failed to fetch public calendar items for business ${id}`,
    });
  }
});

///|-----------------------------------------------------------------|
// Get a specific business calendar item by id [Protected]
router.get("/business/:id/:itemId", authenticateJWT, async (req, res) => {
  const businessId = req.params.id;
  const itemId = req.params.itemId;
  const userId = req.user.id;

  try {
    // Check if user owns the business FIRST
    const authCheck = await checkBusinessOwnership(businessId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.error });
    }

    // Find the calendar item
    const calendarItem = await CalendarItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: Event,
          where: { businessId: businessId },
          required: true,
        },
        {
          model: Business,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!calendarItem) {
      return res.status(404).json({
        error: `No calendar item with ID ${itemId} found for business ${businessId}`,
      });
    }

    res.status(200).json(calendarItem);
  } catch (error) {
    console.error("Error fetching business calendar item:", error);
    res.status(500).json({
      error: `Failed to fetch calendar item ${itemId} for business ${businessId}`,
    });
  }
});

//|-----------------------------------------------------------------|
// Create a new calendar item for a business
router.post("/business/:id", authenticateJWT, async (req, res) => {
  // Get business ID from URL parameters
  const businessId = req.params.id;
  const userId = req.user.id;

  try {
    const authCheck = await checkBusinessOwnership(businessId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.error });
    }
    // Get the calendar item details from the request body
    const calendarItemData = req.body;

    // Create a new calendar item and attach the businessId to it
    const newItem = await CalendarItem.create({
      ...calendarItemData,
      userId: userId,
    });
    await Event.create({
      itemId: newItem.id,
      businessId: businessId,
      published: false,
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
router.patch("/business/:id/:itemId", authenticateJWT, async (req, res) => {
  // Get business ID and calendar item ID from URL parameters
  const businessId = req.params.id;
  const itemId = req.params.itemId;
  const userId = req.user.id;

  try {
    const authCheck = await checkBusinessOwnership(businessId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.error });
    }

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
router.delete("/business/:id/:itemId", authenticateJWT, async (req, res) => {
  // Get business ID and calendar item ID from URL parameters
  const businessId = req.params.id;
  const itemId = req.params.itemId;
  const userId = req.user.id;

  try {
    const authCheck = await checkBusinessOwnership(businessId, userId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.error });
    }

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

//|=====================================================================================|
//               **************|Events Routing|****************
//|=====================================================================================|

//|-------------------------------------------------------------------|
// Helper function to get events using a flag for only future events
// or all events
const getEvents = async (onlyFuture) => {
  const whereOptions = { public: true };
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
          include: [{ model: User }],
        },
      ],
      order: [[CalendarItem, "start"]],
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
};

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
// Create a new event (converts calendar item to event) [Protected]
router.post("/events", authenticateJWT, async (req, res) => {
  try {
    const { itemId, businessId = null, published = true } = req.body;
    const userId = req.user.id;

    // Verify the calendar item exists and belongs to user
    const calendarItem = await CalendarItem.findByPk(itemId);

    if (!calendarItem) {
      return res.status(404).json({ error: "Calendar item not found" });
    }

    if (calendarItem.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized to create event from this calendar item",
      });
    }

    // Validate required fields for events (description and location)
    if (!calendarItem.description || !calendarItem.location) {
      return res.status(400).json({
        error:
          "Calendar item must have description and location to become an event",
      });
    }

    // Check if event already exists for this calendar item
    const existingEvent = await Event.findOne({ where: { itemId } });
    if (existingEvent) {
      return res
        .status(409)
        .json({ error: "Event already exists for this calendar item" });
    }

    // Create the event
    const newEvent = await Event.create({
      itemId,
      businessId,
      published,
      chatLink: null,
    });

    res.status(201).send(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

//|-------------------------------------------------------------------|
// Get a specific event by id
router.get("/events/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId, {
      include: [
        { model: Business },
        {
          model: CalendarItem,
          include: [{ model: User }],
        },
        {
          model: Attendee,
          include: [{ model: User }],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if event is published or if user is the owner
    if (
      !event.published &&
      (!req.user || event.calendar_item.userId !== req.user.id)
    ) {
      return res
        .status(403)
        .json({ error: "This is a private event (invite only)" });
    }

    // Format the response
    const formattedEvent = {
      id: event.id,
      title: event.calendar_item.title,
      description: event.calendar_item.description,
      location: event.calendar_item.location,
      startTime: event.calendar_item.start,
      endTime: event.calendar_item.end,
      business: event.business ? event.business.name : null,
      chatLink: event.chatLink,
      published: event.published,
      creatorName: `${event.calendar_item.user.firstName} ${event.calendar_item.user.lastName}`,
      creatorUsername: event.calendar_item.user.username,
      attendees: event.attendees
        ? event.attendees.map((attendee) => ({
            id: attendee.user.id,
            name: `${attendee.user.firstName} ${attendee.user.lastName}`,
            username: attendee.user.username,
          }))
        : [],
    };

    res.status(200).send(formattedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

//|-------------------------------------------------------------------|
// Update event (publish/unpublish, add chat link) [Protected]
router.patch("/events/:eventId", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const { published, chatLink } = req.body;

    const event = await Event.findByPk(eventId, {
      include: [CalendarItem],
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user owns the calendar item
    if (event.calendar_item.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this event" });
    }

    // Update event
    const updateData = {};
    if (published !== undefined) updateData.published = published;
    if (chatLink !== undefined) updateData.chatLink = chatLink;

    await event.update(updateData);

    res.status(200).send(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

//|-------------------------------------------------------------------|
// Delete event (converts back to regular calendar item) [Protected]
router.delete("/events/:eventId", authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId, {
      include: [CalendarItem],
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user owns the calendar item
    if (event.calendar_item.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this event" });
    }

    // Delete the event (calendar item remains)
    await event.destroy();

    res.status(200).json({ message: "Event deleted, calendar item preserved" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

//|-----------------------------------------------------------------|

module.exports = router;

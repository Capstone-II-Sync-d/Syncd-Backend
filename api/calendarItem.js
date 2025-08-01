const express = require("express");
const router = express.Router();
//Importing models needed
const { User, Business, CalendarItem, Attendee, Reminder } = require("../database");
// Import Sequelize operators
const { Op } = require("sequelize");

//|=====================================================================================|
//         **************|User Calendar Item Routing (Nuria)|****************
//|=====================================================================================|

//|-----------------------------------------------------------------|
// Get all calendar items for a specific user


//|-----------------------------------------------------------------|
// Get a specific calendar item by id (for a user)


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
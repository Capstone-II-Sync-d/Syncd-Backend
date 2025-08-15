const express = require("express");
const router = express.Router();
const profileRouter = require("./users");
const calendarItemsRouter = require("./calendarItems");
const notificationsRouter = require("./notifications");
const messageRouter = require("./messages");

router.use("/profiles", profileRouter);
router.use("/calendarItems", calendarItemsRouter);
router.use("/notifications", notificationsRouter);
router.use("/messages", messageRouter);

module.exports = router;

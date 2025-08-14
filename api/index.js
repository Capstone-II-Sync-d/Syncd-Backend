const express = require("express");
const router = express.Router();
const profileRouter = require("./users");
const calendarItemsRouter = require("./calendarItems");
const notificationsRouter = require("./notifications");

router.use("/profiles", profileRouter);
router.use("/calendarItems", calendarItemsRouter);
router.use("/notifications", notificationsRouter);

module.exports = router;

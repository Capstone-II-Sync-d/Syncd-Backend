const express = require("express");
const router = express.Router();
const profileRouter = require("./users");
const calendarItemsRouter = require("./calendarItem");

router.use("/profiles", profileRouter);
router.use("/calendarItems", calendarItemsRouter);

module.exports = router;

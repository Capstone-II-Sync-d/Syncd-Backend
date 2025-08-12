const express = require("express");
const Notification = require("../database/notification");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notifs = await Notification.findAll();
    res.status(200).send(notifs);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: `Error getting all notifications: ${error}` });
  }
});

module.exports = router;

const express = require("express");
const Notification = require("../database/notification");
const { authenticateJWT } = require("../auth");
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

router.get("/me", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const notifs = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({
      message: "Successfully retrieved user's notifications",
      notifications: notifs,
    });
  } catch (error) {
    console.error("Error fetching user's notifications:", error);
    res.status(500).json({ error: "Failed to get user's notifications" });
  }
});

module.exports = router;

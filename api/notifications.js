const express = require("express");
const Notification = require("../database/notification");
const { authenticateJWT } = require("../auth");
const { RequestNotification, ReminderNotification, EventNotification, FriendShip, User } = require("../database");
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
      include: [
        {
          model: RequestNotification,
          required: false,
          include: [
            {
              model: FriendShip,
              include: [
                {
                  model: User,
                  as: 'primary'
                },
                {
                  model: User,
                  as: 'secondary'
                },
              ],
            },
          ],
        },
        { model: ReminderNotification, required: false },
        { model: EventNotification, required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    notifs.forEach((notif, index, array) => {
      const notifInfo = {
        id: notif.id,
        time: notif.createdAt,
        read: notif.read,
        userId: notif.userId,
        type: 'blank',
      }
      
      if (notif.request_notification) {
        notifInfo.type = 'request';
        notifInfo.status = notif.request_notification.status;
        const otherUser = notif.request_notification.friendship.primary.id === userId ?
          notif.request_notification.friendship.secondary : notif.request_notification.friendship.primary;
        notifInfo.otherUser = {
          id: otherUser.id,
          firstName: otherUser.firstName,
          username: otherUser.username,
        }
      }
      // ELSE IF REMINDER NOTIF
      // ELSE IF EVENT NOTIF

      array[index] = notifInfo;
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

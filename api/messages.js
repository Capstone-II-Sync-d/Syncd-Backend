const express = require("express");
const router = express.Router();
//Importing models needed
const { Message } = require("../database");

// Import Sequelize operators
const { Op } = require("sequelize");
const { authenticateJWT } = require("../auth");

router.get("/me", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json("Error fetching uers messages", err);
  }
});

module.exports = router;

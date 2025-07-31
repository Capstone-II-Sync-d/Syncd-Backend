const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const profileRouter = require("./users");
router.use("/test-db", testDbRouter);
router.use("/profiles", profileRouter);
module.exports = router;

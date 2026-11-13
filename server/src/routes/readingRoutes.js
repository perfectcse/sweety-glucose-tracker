const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
  createReading,
  getReadings,
  updateReading,
  deleteReading
} = require("../controllers/readingController");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createReading);
router.get("/", getReadings);
router.put("/:id", updateReading);
router.delete("/:id", deleteReading);

module.exports = router;

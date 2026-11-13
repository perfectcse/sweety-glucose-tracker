const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
  getDailyReport,
  getCurrentMonthReport,
  getPreviousMonthReport
} = require("../controllers/reportController");

const router = express.Router();

router.use(authenticateToken);

router.get("/daily", getDailyReport);
router.get("/current-month", getCurrentMonthReport);
router.get("/previous-month", getPreviousMonthReport);

module.exports = router;

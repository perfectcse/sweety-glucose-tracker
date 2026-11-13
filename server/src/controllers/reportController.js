const prisma = require("../config/db");

const getSummary = (readings) => {
  const values = readings.map((reading) => reading.value);

  if (values.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      count: 0
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Number((total / values.length).toFixed(1)),
    count: values.length
  };
};

const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
};

// DAILY REPORT
const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date ||
      new Date().toISOString().slice(0, 10);

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date in YYYY-MM-DD format."
      });
    }

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const readings = await prisma.reading.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { slot: "asc" }
    });

    return res.status(200).json({
      success: true,
      report: "daily",
      date,
      summary: getSummary(readings),
      readings
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate daily report."
    });
  }
};

// MONTHLY REPORT HELPER
const getMonthlyReport = async (req, res, startDate, endDate, label) => {
  try {
    const readings = await prisma.reading.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: [
        { date: "asc" },
        { slot: "asc" }
      ]
    });

    return res.status(200).json({
      success: true,
      report: label,
      period: {
        startDate: startDate.toISOString().slice(0, 10),
        endDate: new Date(endDate.getTime() - 86400000)
          .toISOString().slice(0, 10)
      },
      summary: getSummary(readings)
    });
  } catch (error) {
    console.error("Monthly report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report."
    });
  }
};

// CURRENT MONTH REPORT
const getCurrentMonthReport = async (req, res) => {
  const now = new Date();

  const startDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    1
  ));

  const endDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  ));

  return getMonthlyReport(
    req, res, startDate, endDate, "current_month"
  );
};

// PREVIOUS MONTH REPORT
const getPreviousMonthReport = async (req, res) => {
  const now = new Date();

  const startDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  ));

  const endDate = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    1
  ));

  return getMonthlyReport(
    req, res, startDate, endDate, "previous_month"
  );
};

module.exports = {
  getDailyReport,
  getCurrentMonthReport,
  getPreviousMonthReport
};

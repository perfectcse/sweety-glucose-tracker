const prisma = require("../config/db");

const VALID_SLOTS = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER"
];

const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
};

const isFutureDate = (date) => {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  return date > todayString;
};

const validateReading = ({ value, date, slot }) => {
  if (!Number.isInteger(value) || value < 40 || value > 600) {
    return "Glucose value must be an integer between 40 and 600 mg/dL.";
  }

  if (!isValidDate(date)) {
    return "Date must be valid and use YYYY-MM-DD format.";
  }

  if (isFutureDate(date)) {
    return "Future dates are not allowed.";
  }

  if (!VALID_SLOTS.includes(slot)) {
    return "Invalid reading slot.";
  }

  return null;
};

// CREATE READING
const createReading = async (req, res) => {
  try {
    const { value, date, slot } = req.body;

    const validationError = validateReading({ value, date, slot });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const reading = await prisma.reading.create({
      data: {
        userId: req.user.id,
        value,
        date: new Date(`${date}T00:00:00.000Z`),
        slot
      }
    });

    return res.status(201).json({
      success: true,
      message: "Glucose reading created successfully.",
      reading
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this slot on this date."
      });
    }

    console.error("Create reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create glucose reading."
    });
  }
};

// GET ALL USER READINGS
const getReadings = async (req, res) => {
  try {
    const readings = await prisma.reading.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { date: "desc" },
        { slot: "asc" }
      ]
    });

    return res.status(200).json({
      success: true,
      count: readings.length,
      readings
    });
  } catch (error) {
    console.error("Get readings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch glucose readings."
    });
  }
};

// UPDATE READING
const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, date, slot } = req.body;

    const validationError = validateReading({ value, date, slot });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const existingReading = await prisma.reading.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingReading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found."
      });
    }

    const reading = await prisma.reading.update({
      where: { id },
      data: {
        value,
        date: new Date(`${date}T00:00:00.000Z`),
        slot
      }
    });

    return res.status(200).json({
      success: true,
      message: "Glucose reading updated successfully.",
      reading
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this slot on this date."
      });
    }

    console.error("Update reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update glucose reading."
    });
  }
};

// DELETE READING
const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const existingReading = await prisma.reading.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingReading) {
      return res.status(404).json({
        success: false,
        message: "Reading not found."
      });
    }

    await prisma.reading.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Glucose reading deleted successfully."
    });
  } catch (error) {
    console.error("Delete reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete glucose reading."
    });
  }
};

module.exports = {
  createReading,
  getReadings,
  updateReading,
  deleteReading
};

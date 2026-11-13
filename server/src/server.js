
require("dotenv").config();

const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`Sweety server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

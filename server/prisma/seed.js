const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("DemoPass123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@sweetytracker.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@sweetytracker.com",
      password,
    },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const readings = [
    { slot: "MORNING", value: 110 },
    { slot: "AFTER_BREAKFAST", value: 145 },
    { slot: "AFTER_LUNCH", value: 130 },
    { slot: "AFTER_DINNER", value: 125 },
  ];

  for (const reading of readings) {
    await prisma.reading.upsert({
      where: {
        userId_date_slot: {
          userId: user.id,
          date: today,
          slot: reading.slot,
        },
      },
      update: { value: reading.value },
      create: {
        userId: user.id,
        date: today,
        slot: reading.slot,
        value: reading.value,
      },
    });
  }

  console.log("Demo user and sample readings seeded successfully.");
  console.log("Demo email: demo@sweetytracker.com");
  console.log("Demo password: DemoPass123!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

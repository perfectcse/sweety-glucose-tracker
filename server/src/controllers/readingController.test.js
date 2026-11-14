const {
  createReading,
  getReadings
} = require("./readingController");

const prisma = require("../config/db");

jest.mock("../config/db", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  reading: {
    create: jest.fn(),
    findMany: jest.fn()
  }
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Reading controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("rejects glucose values outside the valid range", async () => {
    const req = {
      user: { id: "user-123" },
      body: {
        value: 650,
        date: "2026-01-10",
        slot: "MORNING"
      }
    };
    const res = mockResponse();

    await createReading(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.reading.create).not.toHaveBeenCalled();
  });

  test("creates a valid glucose reading", async () => {
    const reading = {
      id: "reading-123",
      userId: "user-123",
      value: 120,
      slot: "MORNING"
    };

    prisma.reading.create.mockResolvedValue(reading);

    const req = {
      user: { id: "user-123" },
      body: {
        value: 120,
        date: "2026-01-10",
        slot: "MORNING"
      }
    };
    const res = mockResponse();

    await createReading(req, res);

    expect(prisma.reading.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-123",
          value: 120,
          slot: "MORNING"
        })
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("rejects duplicate reading slots", async () => {
    prisma.reading.create.mockRejectedValue({ code: "P2002" });

    const req = {
      user: { id: "user-123" },
      body: {
        value: 120,
        date: "2026-01-10",
        slot: "MORNING"
      }
    };
    const res = mockResponse();

    await createReading(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("fetches readings only for the authenticated user", async () => {
    prisma.reading.findMany.mockResolvedValue([]);

    const req = { user: { id: "user-123" } };
    const res = mockResponse();

    await getReadings(req, res);

    expect(prisma.reading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123" }
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});


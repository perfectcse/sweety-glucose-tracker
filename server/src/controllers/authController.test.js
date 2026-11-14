const { registerUser } = require("./authController");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
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

describe("Authentication controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("rejects registration with missing fields", async () => {
    const req = { body: { name: "", email: "", password: "" } };
    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test("registers user with hashed password", async () => {
    process.env.JWT_SECRET = "test-secret";

    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");

    prisma.user.create.mockResolvedValue({
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      createdAt: new Date()
    });

    jwt.sign.mockReturnValue("test-token");

    const req = {
      body: {
        name: "Test User",
        email: "TEST@example.com",
        password: "Password123"
      }
    };
    const res = mockResponse();

    await registerUser(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 12);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "test@example.com",
          password: "hashed-password"
        })
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0].token).toBe("test-token");
  });
});


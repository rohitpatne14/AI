import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const port = process.env.PORT2 || 4002;
const mongoUri = process.env.MONGO_URI || "";
const jwtSecret = process.env.JWT_SECRET || "change-me";

if (!mongoUri) {
  console.error("Missing MONGO_URI. Set it in .env");
  process.exit(1);
}
if (!jwtSecret || jwtSecret === "change-me") {
  console.warn("Using default JWT secret. Set JWT_SECRET in .env for security.");
}

app.use(cors({ origin: process.env.ALLOW_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const connectDb = async () => {
  await mongoose.connect(mongoUri);
  console.log("User-service connected to MongoDB");
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid auth header." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user-service" });
});

app.get("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select("name email");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error("Fetch profile error", err);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`User service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });


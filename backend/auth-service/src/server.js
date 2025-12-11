import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const port = process.env.PORT || 4001;
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
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const connectDb = async () => {
  await mongoose.connect(mongoUri);
  console.log("Auth-service connected to MongoDB");
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ sub: user._id, email: user.email, name: user.name }, jwtSecret, {
      expiresIn: "3d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error", err);
    res.status(500).json({ message: "Failed to sign up." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ sub: user._id, email: user.email, name: user.name }, jwtSecret, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Failed to log in." });
  }
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Auth service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });


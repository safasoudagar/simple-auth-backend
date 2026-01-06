// simple-auth-backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ---- MongoDB connection ----
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/authdb";
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    process.exit(1);
  });

// ---- User model ----
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, default: "student" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ---- Routes ----

/*
  POST /api/auth/register
  Body: { name, email, password, role? }
*/
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ message: "Account already exists. Please login." });
    }

    await User.create({ name, email, password, role: role || "student" });
    return res.json({ message: "Account created successfully. Please login." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/*
  POST /api/auth/login
  Body: { email, password }
  Responses:
   - account not found -> { message: "Account does not exist. Please create an account." }
   - wrong password    -> { message: "Incorrect password." }
   - success           -> { message: "Login successful", user: { name, email, role } }
*/
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Account does not exist. Please create an account." });
    }

    if (user.password !== password) {
      return res.json({ message: "Incorrect password." });
    }

    return res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---- Start server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Auth server running on port " + PORT);
});

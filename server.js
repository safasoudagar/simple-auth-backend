const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(cors());                 // ⭐ REQUIRED for frontend (Render + browser)
app.use(express.json());

/* ===================== MONGODB ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ===================== USER MODEL ===================== */
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
});

const User = mongoose.model("User", UserSchema);

/* ===================== ROUTES ===================== */

// Health check (IMPORTANT)
app.get("/", (req, res) => {
  res.json({ status: "Auth backend running" });
});

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.json({ message: "Email and password required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.json({ message: "User already exists" });
  }

  await User.create({ email, password, role });
  res.json({ message: "Registration successful" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "Account does not exist. Please register." });
  }

  if (user.password !== password) {
    return res.json({ message: "Wrong email or password" });
  }

  res.json({
    message: "Login successful",
    user: {
      email: user.email,
      role: user.role,
    },
  });
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Auth server running on port", PORT);
});

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const router = express.Router();

const SECRET = "autoverse_secret";

// =========================
// SIGNUP
// =========================
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashed
    });

    await user.save();

    res.json({ message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
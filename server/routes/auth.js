import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

router.post("/register", async (req, res, next) => {
  try {
    const { name = "", email = "", password = "" } = req.body;
    const errors = {};
    if (name.trim().length < 2) errors.name = "Enter your full name.";
    if (!EMAIL_RX.test(email)) errors.email = "Enter a valid email address.";
    if (password.length < 6) errors.password = "Use at least 6 characters.";
    if (Object.keys(errors).length)
      return res
        .status(400)
        .json({ message: "Please fix the highlighted fields.", errors });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res
        .status(409)
        .json({
          message: "An account with this email already exists.",
          errors: { email: "Email already registered." },
        });
    }

    // The very first account becomes the admin; everyone after is a regular user.
    const isFirst = (await User.countDocuments()) === 0;
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: isFirst ? "admin" : "user",
    });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email = "", password = "" } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", protect, (req, res) =>
  res.json({ user: publicUser(req.user) }),
);

export default router;

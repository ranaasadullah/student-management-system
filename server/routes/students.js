import { Router } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect);

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function validate(b) {
  const errors = {};
  if (!b.fullName || b.fullName.trim().length < 2)
    errors.fullName = "Enter the student’s full name.";
  if (!b.rollNumber || !b.rollNumber.trim())
    errors.rollNumber = "Roll number is required.";
  if (!b.email || !EMAIL_RX.test(b.email))
    errors.email = "Enter a valid email address.";
  if (!b.course || !b.course.trim()) errors.course = "Course is required.";
  if (b.phone && !/^[0-9+\-\s()]{7,18}$/.test(b.phone))
    errors.phone = "Enter a valid phone number.";
  const year = Number(b.year);
  if (!Number.isInteger(year) || year < 1 || year > 6)
    errors.year = "Year must be between 1 and 6.";
  return errors;
}

const pick = (b) => ({
  fullName: b.fullName,
  rollNumber: b.rollNumber,
  email: b.email,
  phone: b.phone || "",
  course: b.course,
  year: Number(b.year) || 1,
  gender: b.gender || "Other",
  dateOfBirth: b.dateOfBirth || undefined,
  address: b.address || "",
});

const checkId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id)
    ? next()
    : res.status(404).json({ message: "Student not found." });

// Dashboard numbers
router.get("/stats", async (_req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [total, thisWeek, byCourse, recent] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ createdAt: { $gte: weekAgo } }),
      Student.aggregate([
        { $group: { _id: "$course", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Student.find().sort("-createdAt").limit(5),
    ]);
    res.json({
      total,
      thisWeek,
      courses: byCourse.length,
      average: byCourse.length ? Math.round(total / byCourse.length) : 0,
      byCourse: byCourse
        .slice(0, 6)
        .map((c) => ({ course: c._id, count: c.count })),
      recent,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/courses", async (_req, res, next) => {
  try {
    res.json({ courses: (await Student.distinct("course")).sort() });
  } catch (err) {
    next(err);
  }
});

// List with search, course filter and pagination
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 50);
    const filter = {};
    const search = (req.query.search || "").trim();
    if (search) {
      const rx = new RegExp(escapeRx(search), "i");
      filter.$or = [
        { fullName: rx },
        { rollNumber: rx },
        { email: rx },
        { course: rx },
      ];
    }
    if (req.query.course) filter.course = req.query.course;

    const [total, students] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    res.json({
      students,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", checkId, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ message: "Student not found." });
    res.json({ student });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (Object.keys(errors).length)
      return res
        .status(400)
        .json({ message: "Please fix the highlighted fields.", errors });
    const student = await Student.create({
      ...pick(req.body),
      createdBy: req.user._id,
    });
    res.status(201).json({ student });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", checkId, async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (Object.keys(errors).length)
      return res
        .status(400)
        .json({ message: "Please fix the highlighted fields.", errors });
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      pick(req.body),
      { new: true, runValidators: true },
    );
    if (!student)
      return res.status(404).json({ message: "Student not found." });
    res.json({ student });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", checkId, adminOnly, async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student)
      return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;

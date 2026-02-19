const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// 🔐 REGISTER
router.post('/register', async (req, res) => {
  try {
    const { studentId, name, department, password, role } = req.body;

    const existing = await User.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ msg: "Student ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      studentId,
      name,
      department,
      password: hashedPassword,
      role: role || "student"   // ✅ IMPORTANT LINE
    });

    await user.save();

    res.json({ msg: "Registration successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Student ID" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        studentId: user.studentId,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/User');

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // find user
    const user = await User.findOne({ studentId });
    if (!user) return res.status(400).json({ msg: "Invalid admin login" });

    // check role
    if (user.role !== "admin")
      return res.status(403).json({ msg: "Not an admin account" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid admin login" });

    // token
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
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

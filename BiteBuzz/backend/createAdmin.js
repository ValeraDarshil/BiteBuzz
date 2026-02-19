const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI);

const User = require("./models/user");
const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("canteen123", 10);

  await User.create({
    studentId: "ADMIN001",
    name: "Canteen Admin",
    department: "Management",
    password: hash,
    role: "admin"
  });

  console.log("✅ ADMIN CREATED");
  process.exit();
})();

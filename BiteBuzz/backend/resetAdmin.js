const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI);

const bcrypt = require("bcryptjs");
const User = require("./models/user");

(async () => {

  const hash = await bcrypt.hash("canteen123", 10);

  await User.updateOne(
    { studentId: "ADMIN001" },
    { $set: { password: hash, role: "admin" } }
  );

  console.log("ADMIN PASSWORD RESET DONE");
  process.exit();

})();

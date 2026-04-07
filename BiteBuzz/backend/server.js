// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/orders', require('./routes/orders'));
// app.use("/api/admin", require("./routes/adminLogin"));

// const auth = require('./middleware/authMiddleware');

// app.get('/test', auth, (req, res) => {
//   res.json({ msg: "Protected route working", user: req.user });
// });

// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log("✅ MongoDB Connected"))
// .catch(err => console.log(err));

// app.get('/', (req, res) => {
//   res.send("🚀 BiteBuzz Backend Running");
// });

// app.listen(process.env.PORT, () => {
//   console.log(`🔥 Server running on port ${process.env.PORT}`);
// });

// console.log("Server file started");





// --------- claude ai --------- //

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
 
app.use(cors({
  origin: ["https://bite-buzz-psi.vercel.app"],
  credentials: true
}));
app.use(express.json());
 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use("/api/admin", require("./routes/adminLogin"));
 
const auth = require('./middleware/authMiddleware');
 
app.get('/test', auth, (req, res) => {
  res.json({ msg: "Protected route working", user: req.user });
});
 
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => { console.error("❌ MongoDB connection error:", err); process.exit(1); });
 
app.get('/', (req, res) => {
  res.send("🚀 BiteBuzz Backend Running");
});
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
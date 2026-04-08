// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');
// const User = require('../models/User');
// const auth = require('../middleware/authMiddleware');

// const CANCEL_LIMIT = 5;
// const CANCEL_WINDOW_DAYS = 30;
// const SUSPEND_DAYS = 21;


// // 🛒 CREATE ORDER
// router.post('/create', auth, async (req, res) => {
//   try {

//     const user = await User.findById(req.user.id);

//     // 🔒 Suspension check
//     if (user.suspendedUntil && user.suspendedUntil > new Date()) {
//       return res.status(403).json({
//         msg: "You are suspended from ordering",
//         suspendedUntil: user.suspendedUntil
//       });
//     }

//     const { items, total } = req.body;

//     const order = new Order({
//       userId: user._id,
//       items,
//       total
//     });

//     await order.save();

//     res.json({ msg: "Order placed successfully", order });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // 📦 GET MY ORDERS
// router.get('/my', auth, async (req, res) => {
//   try {

//     const orders = await Order.find({ userId: req.user.id })
//       .sort({ createdAt: -1 });

//     res.json(orders);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // ❌ CANCEL ORDER
// router.post('/cancel/:id', auth, async (req, res) => {
//   try {

//     const order = await Order.findById(req.params.id);
//     const user = await User.findById(req.user.id);

//     if (!order) {
//       return res.status(404).json({ msg: "Order not found" });
//     }

//     if (order.userId.toString() !== req.user.id) {
//       return res.status(403).json({ msg: "Not allowed" });
//     }

//     if (order.status !== "Pending") {
//       return res.status(400).json({ msg: "Only pending orders can be cancelled" });
//     }

//     // 🧠 Clean old cancellations (30 days)
//     const cutoff = new Date();
//     cutoff.setDate(cutoff.getDate() - CANCEL_WINDOW_DAYS);

//     user.cancellations = user.cancellations.filter(
//       date => date > cutoff
//     );

//     user.cancellations.push(new Date());

//     // 🚨 Suspension logic
//     if (user.cancellations.length >= CANCEL_LIMIT) {
//       const suspendDate = new Date();
//       suspendDate.setDate(suspendDate.getDate() + SUSPEND_DAYS);
//       user.suspendedUntil = suspendDate;
//     }

//     order.status = "Cancelled";

//     await order.save();
//     await user.save();

//     res.json({
//       msg: "Order cancelled",
//       cancellations: user.cancellations.length,
//       suspendedUntil: user.suspendedUntil || null
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

// const admin = require('../middleware/adminMiddleware');


// // 👑 ADMIN UPDATE ORDER STATUS
// router.put('/update/:id', auth, admin, async (req, res) => {
//   try {

//     const { status } = req.body || {};
//     if (!status) return res.status(400).json({ msg: "Status required" });

//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({ msg: "Order not found" });
//     }

//     const allowedFlow = {
//       "Pending": ["Preparing"],
//       "Preparing": ["Ready"],
//       "Ready": ["Out for Delivery"],
//       "Out for Delivery": [],
//       "Cancelled": [] // 🔥 important fix
//     };

//     // Agar unknown status mila toh crash nahi karega
//     if (!allowedFlow[order.status]) {
//       return res.status(400).json({
//         msg: `Invalid current order status: ${order.status}`
//       });
//     }

//     if (!allowedFlow[order.status].includes(status)) {
//       return res.status(400).json({
//         msg: `Cannot change from ${order.status} to ${status}`
//       });
//     }

//     order.status = status;
//     await order.save();

//     res.json({
//       msg: "Order status updated",
//       newStatus: order.status
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// ------- claude ai ------ //

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const MenuAvailability = require('../models/MenuAvailability');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const CANCEL_LIMIT = 5;
const CANCEL_WINDOW_DAYS = 30;
const SUSPEND_DAYS = 21;


// =============================================
// STUDENT ROUTES
// =============================================

// CREATE ORDER
router.post("/create", auth, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ msg: "Cart empty" });

    // ✅ BULLETPROOF RACE CONDITION CHECK
    // Get item IDs from cart — filter out any that don't have an id (safety net)
    const cartItemIds = items.map(i => i.id).filter(id => id !== undefined && id !== null);

    // Fetch all unavailable records for these items from DB (real-time)
    const unavailableRecords = await MenuAvailability.find({
      itemId: { $in: cartItemIds },
      available: false
    });

    if (unavailableRecords.length > 0) {
      const unavailableIds = unavailableRecords.map(r => r.itemId);
      const unavailableNames = items
        .filter(i => unavailableIds.includes(i.id))
        .map(i => i.name)
        .join(', ');

      return res.status(400).json({
        msg: `Some items are no longer available: ${unavailableNames}. Please remove them and try again.`,
        unavailableIds
      });
    }

    // Suspension check
    const user = await User.findById(req.user.id);
    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
      return res.status(403).json({
        msg: "You are suspended from ordering",
        suspendedUntil: user.suspendedUntil
      });
    }

    const order = new Order({
      userId: req.user.id,
      items,
      total,
      status: "Pending"
    });

    await order.save();

    res.json({
      msg: "Order placed successfully",
      orderId: order._id,
      status: order.status
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MY ORDERS (for logged-in student)
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCEL ORDER
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!order) return res.status(404).json({ msg: "Order not found" });
    if (order.userId.toString() !== req.user.id) return res.status(403).json({ msg: "Not allowed" });
    if (order.status !== "Pending") return res.status(400).json({ msg: "Only pending orders can be cancelled" });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CANCEL_WINDOW_DAYS);
    user.cancellations = user.cancellations.filter(date => date > cutoff);
    user.cancellations.push(new Date());

    if (user.cancellations.length >= CANCEL_LIMIT) {
      const suspendDate = new Date();
      suspendDate.setDate(suspendDate.getDate() + SUSPEND_DAYS);
      user.suspendedUntil = suspendDate;
    }

    order.status = "Cancelled";
    await order.save();
    await user.save();

    res.json({
      msg: "Order cancelled",
      cancellations: user.cancellations.length,
      suspendedUntil: user.suspendedUntil || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET ORDER BY ID — MUST come after all named routes
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Not found" });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Invalid id" });
  }
});


// =============================================
// ADMIN ROUTES
// =============================================

// GET ALL ORDERS (admin only)
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name studentId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER STATUS (admin only)
router.put('/update/:id', auth, admin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ msg: "Status required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const allowedFlow = {
      "Pending":          ["Preparing"],
      "Preparing":        ["Ready"],
      "Ready":            ["Out for Delivery"],
      "Out for Delivery": ["Delivered"],
      "Delivered":        [],
      "Cancelled":        []
    };

    if (!allowedFlow[order.status])
      return res.status(400).json({ msg: `Invalid current order status: ${order.status}` });

    if (!allowedFlow[order.status].includes(status))
      return res.status(400).json({ msg: `Cannot change from ${order.status} to ${status}` });

    order.status = status;
    await order.save();

    res.json({ msg: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
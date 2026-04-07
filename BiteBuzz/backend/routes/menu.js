const express = require('express');
const router  = express.Router();
const MenuAvailability = require('../models/MenuAvailability');
const auth  = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// GET /api/menu/availability — public, anyone can fetch
router.get('/availability', async (req, res) => {
  try {
    const records = await MenuAvailability.find({});
    // Return as { itemId: true/false } map
    const map = {};
    records.forEach(r => { map[r.itemId] = r.available; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu/availability — admin only
router.post('/availability', auth, admin, async (req, res) => {
  try {
    const { itemId, available } = req.body;
    if (itemId === undefined || available === undefined)
      return res.status(400).json({ msg: 'itemId and available required' });

    await MenuAvailability.findOneAndUpdate(
      { itemId },
      { available },
      { upsert: true, new: true }
    );
    res.json({ msg: 'Updated', itemId, available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
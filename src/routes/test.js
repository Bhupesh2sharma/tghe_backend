const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TGHE---- Test Route Is Working Fine',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all parking slots with their floors
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of all parking slots
 */
router.get('/', slotController.getSlots);

module.exports = router;

const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

/**
 * @swagger
 * /api/pricing:
 *   get:
 *     summary: Get all pricing rules
 *     tags: [Pricing]
 *     responses:
 *       200:
 *         description: List of pricing rules
 */
router.get('/', pricingController.getPricingRules);

module.exports = router;

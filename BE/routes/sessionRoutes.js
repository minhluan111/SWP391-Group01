const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/sessions/checkin:
 *   post:
 *     summary: Staff checks in a vehicle
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *               slot_id:
 *                 type: integer
 *               reservation_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Check-in successful
 */
router.post('/checkin', verifyToken, sessionController.checkIn);

/**
 * @swagger
 * /api/sessions/checkout:
 *   post:
 *     summary: Staff checks out a vehicle and calculates total amount
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Check-out successful
 */
router.post('/checkout', verifyToken, sessionController.checkOut);

module.exports = router;

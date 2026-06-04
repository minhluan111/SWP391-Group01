const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/sessions/checkin:
 *   post:
 *     summary: Verify booking code/QR and check vehicle in (Staff only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - slot_id
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
router.post('/checkin', verifyToken, requireRole(['Staff', 'Admin']), sessionController.checkIn);

/**
 * @swagger
 * /api/sessions/checkout:
 *   post:
 *     summary: Check vehicle out, calculate fee and confirm payment (Staff only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Check-out and fee calculation successful
 */
router.post('/checkout', verifyToken, requireRole(['Staff', 'Admin']), sessionController.checkOut);

/**
 * @swagger
 * /api/sessions/search:
 *   get:
 *     summary: Search for active bookings or parking sessions by code or plate (Staff only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', verifyToken, requireRole(['Staff', 'Admin']), sessionController.searchBookingOrSession);

/**
 * @swagger
 * /api/sessions/daily-log:
 *   get:
 *     summary: View daily log of vehicle entries/exits today (Staff only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily activity logs list
 */
router.get('/daily-log', verifyToken, requireRole(['Staff', 'Admin']), sessionController.getDailyLog);

module.exports = router;

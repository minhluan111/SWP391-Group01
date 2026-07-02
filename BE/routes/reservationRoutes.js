const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new parking reservation
 *     tags: [Reservations]
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
 *               reservation_time:
 *                 type: string
 *                 format: date-time
 *               expected_checkout_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reservation created successfully
 *       400:
 *         description: Slot not available
 */
router.post('/', verifyToken, reservationController.createReservation);

/**
 * @swagger
 * /api/reservations/my-reservations:
 *   get:
 *     summary: Get all reservations for the logged-in user
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reservations
 */
router.get('/my-reservations', verifyToken, reservationController.getMyReservations);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   post:
 *     summary: Cancel a pending reservation (user must cancel at least 1h before check-in)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/cancel', verifyToken, reservationController.cancelReservation);

module.exports = router;

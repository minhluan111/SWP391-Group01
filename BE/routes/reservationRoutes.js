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

module.exports = router;

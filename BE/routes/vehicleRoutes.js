const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles for the logged-in user
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 *   post:
 *     summary: Add a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               license_plate:
 *                 type: string
 *               vehicle_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle added successfully
 */
router.get('/', verifyToken, vehicleController.getUserVehicles);
router.post('/', verifyToken, vehicleController.addVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               license_plate:
 *                 type: string
 *               vehicle_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 */
router.put('/:id', verifyToken, vehicleController.updateVehicle);
router.delete('/:id', verifyToken, vehicleController.deleteVehicle);

module.exports = router;

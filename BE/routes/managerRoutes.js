const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/manager/capacity:
 *   get:
 *     summary: Get capacity of all floors (Manager/Admin only)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of floors with capacities
 */
router.get('/capacity', verifyToken, requireRole(['Manager', 'Admin']), managerController.getFloorCapacity);

/**
 * @swagger
 * /api/manager/floors/{id}/capacity:
 *   put:
 *     summary: Adjust floor capacity dynamically (Manager/Admin only)
 *     tags: [Manager]
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
 *             required:
 *               - capacity
 *             properties:
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Capacity changed successfully
 */
router.put('/floors/:id/capacity', verifyToken, requireRole(['Manager', 'Admin']), managerController.setFloorCapacity);

/**
 * @swagger
 * /api/manager/pricing:
 *   get:
 *     summary: Get all pricing rules (Manager/Admin only)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pricing rules
 */
router.get('/pricing', verifyToken, requireRole(['Manager', 'Admin']), managerController.getPricingRules);

/**
 * @swagger
 * /api/manager/pricing/{id}:
 *   put:
 *     summary: Update a pricing rule (Manager/Admin only)
 *     tags: [Manager]
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
 *             required:
 *               - hourly_rate
 *             properties:
 *               hourly_rate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pricing rate updated successfully
 */
router.put('/pricing/:id', verifyToken, requireRole(['Manager', 'Admin']), managerController.updatePricingRule);

/**
 * @swagger
 * /api/manager/statistics:
 *   get:
 *     summary: Get parking and revenue statistics (Manager/Admin only)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed statistics object
 */
router.get('/statistics', verifyToken, requireRole(['Manager', 'Admin']), managerController.getStatistics);

module.exports = router;

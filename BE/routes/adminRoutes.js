const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all user accounts (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user accounts
 *       403:
 *         description: Forbidden
 */
router.get('/users', verifyToken, requireRole('Admin'), adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
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
 *               - role_name
 *             properties:
 *               role_name:
 *                 type: string
 *                 enum: [Customer, Staff, Manager, Admin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put('/users/:id/role', verifyToken, requireRole('Admin'), adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Lock or unlock a user account (Admin only)
 *     tags: [Admin]
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
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Account status changed successfully
 */
router.put('/users/:id/status', verifyToken, requireRole('Admin'), adminController.toggleUserStatus);

module.exports = router;

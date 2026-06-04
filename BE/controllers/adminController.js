const { sql, poolPromise } = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, r.role_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            ORDER BY u.created_at DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách tài khoản' });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role_name } = req.body;

        if (!role_name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên vai trò mới' });
        }

        const pool = await poolPromise;

        // Check if role exists
        const roleResult = await pool.request()
            .input('role_name', sql.VarChar, role_name)
            .query('SELECT id FROM roles WHERE role_name = @role_name');

        if (roleResult.recordset.length === 0) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        const roleId = roleResult.recordset[0].id;

        // Check if user exists
        const userCheck = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT id FROM users WHERE id = @userId');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Delete existing role mapping
        await pool.request()
            .input('userId', sql.Int, userId)
            .query('DELETE FROM user_roles WHERE user_id = @userId');

        // Insert new role mapping
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('roleId', sql.Int, roleId)
            .query('INSERT INTO user_roles (user_id, role_id) VALUES (@userId, @roleId)');

        res.json({ success: true, message: `Cập nhật vai trò sang ${role_name} thành công` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật vai trò' });
    }
};

// Toggle user status (lock/activate)
const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { is_active } = req.body; // expected boolean (0 or 1 / true or false)

        if (is_active === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái hoạt động' });
        }

        const pool = await poolPromise;

        // Update status
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('is_active', sql.Bit, is_active ? 1 : 0)
            .query('UPDATE users SET is_active = @is_active WHERE id = @userId');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({ success: true, message: `Tài khoản đã được ${is_active ? 'kích hoạt' : 'khóa'} thành công` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi thay đổi trạng thái tài khoản' });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    toggleUserStatus
};

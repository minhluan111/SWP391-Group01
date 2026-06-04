const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { full_name, email, password, phone } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
        }

        const pool = await poolPromise;

        // Check if user exists
        const checkUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await pool.request()
            .input('full_name', sql.NVarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.VarChar, password_hash)
            .input('phone', sql.VarChar, phone)
            .query(`
                INSERT INTO users (full_name, email, password_hash, phone, is_active) 
                OUTPUT inserted.id, inserted.full_name, inserted.email, inserted.phone
                VALUES (@full_name, @email, @password_hash, @phone, 1)
            `);

        const newUser = result.recordset[0];

        // Fetch customer role ID
        const roleResult = await pool.request()
            .input('role_name', sql.VarChar, 'Customer')
            .query('SELECT id FROM roles WHERE role_name = @role_name');
        
        const customerRoleId = roleResult.recordset[0]?.id;

        // Assign Customer role to new user
        if (customerRoleId) {
            await pool.request()
                .input('user_id', sql.Int, newUser.id)
                .input('role_id', sql.Int, customerRoleId)
                .query('INSERT INTO user_roles (user_id, role_id) VALUES (@user_id, @role_id)');
        }

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: 'Customer' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email,
                phone: newUser.phone,
                role: 'Customer'
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        const pool = await poolPromise;

        // Find user and their role
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                SELECT u.*, r.role_name 
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = result.recordset[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Admin.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const role = user.role_name || 'Customer';

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { full_name, phone } = req.body;
        const user_id = req.user.id;
        const pool = await poolPromise;

        await pool.request()
            .input('full_name', sql.NVarChar, full_name)
            .input('phone', sql.VarChar, phone)
            .input('user_id', sql.Int, user_id)
            .query('UPDATE users SET full_name = @full_name, phone = @phone WHERE id = @user_id');

        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT u.id, u.full_name, u.email, u.phone, r.role_name 
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = @user_id
            `);

        res.json({ success: true, message: 'Cập nhật hồ sơ thành công', user: {
            id: result.recordset[0].id,
            full_name: result.recordset[0].full_name,
            email: result.recordset[0].email,
            phone: result.recordset[0].phone,
            role: result.recordset[0].role_name || 'Customer'
        }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT u.id, u.full_name, u.email, u.phone, r.role_name 
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = @user_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const user = result.recordset[0];
        res.json({ success: true, user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role_name || 'Customer'
        } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await pool.request()
            .input('email', sql.VarChar, email)
            .input('code', sql.VarChar, code)
            .input('expires', sql.DateTime, expires)
            .query('UPDATE users SET reset_code = @code, reset_expires = @expires WHERE email = @email');

        // Returning the code in the response body so that the user can test the Reset Password flow offline!
        res.json({ 
            success: true, 
            message: 'Yêu cầu đặt lại mật khẩu thành công. Vui lòng sử dụng mã OTP để khôi phục.',
            code // Trả về mã OTP ở đây để test trực tiếp
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, new_password } = req.body;
        if (!email || !code || !new_password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, reset_code, reset_expires FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const user = result.recordset[0];
        
        if (user.reset_code !== code) {
            return res.status(400).json({ message: 'Mã OTP không chính xác' });
        }

        if (new Date() > new Date(user.reset_expires)) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);

        await pool.request()
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.VarChar, password_hash)
            .query('UPDATE users SET password_hash = @password_hash, reset_code = NULL, reset_expires = NULL WHERE email = @email');

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const user_id = req.user.id;

        if (!old_password || !new_password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT password_hash FROM users WHERE id = @user_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const user = result.recordset[0];

        // Verify old password
        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);

        // Update password
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('password_hash', sql.VarChar, password_hash)
            .query('UPDATE users SET password_hash = @password_hash WHERE id = @user_id');

        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
    }
};

module.exports = {
    register,
    login,
    updateProfile,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword
};

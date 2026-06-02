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
                INSERT INTO users (full_name, email, password_hash, phone) 
                OUTPUT inserted.id, inserted.full_name, inserted.email 
                VALUES (@full_name, @email, @password_hash, @phone)
            `);

        const newUser = result.recordset[0];

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: newUser
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

        // Find user
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = result.recordset[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    register,
    login
};

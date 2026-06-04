const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Không tìm thấy token. Từ chối truy cập.' });

    const token = authHeader.replace('Bearer ', '');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token không hợp lệ.' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin xác thực' });
        }
        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };

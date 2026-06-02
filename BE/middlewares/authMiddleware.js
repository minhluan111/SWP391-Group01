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

module.exports = { verifyToken };

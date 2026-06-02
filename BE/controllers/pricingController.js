const { poolPromise } = require('../config/db');

const getPricingRules = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request().query(`
            SELECT * FROM pricing_rules
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy bảng giá' });
    }
};

module.exports = {
    getPricingRules
};

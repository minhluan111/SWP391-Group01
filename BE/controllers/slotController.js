const { poolPromise } = require('../config/db');

const getSlots = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request().query(`
            SELECT s.id, s.slot_code, s.vehicle_type, s.status, f.floor_name
            FROM parking_slots s
            JOIN floors f ON s.floor_id = f.id
        `);

        // Format to match the frontend expectations if needed
        const formattedSlots = result.recordset.map(slot => ({
            id: slot.slot_code, // Use slot_code as ID for the frontend grid
            db_id: slot.id,
            type: slot.vehicle_type,
            status: slot.status,
            floor: slot.floor_name
        }));

        res.json({
            success: true,
            data: formattedSlots
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách chỗ đậu' });
    }
};

module.exports = {
    getSlots
};

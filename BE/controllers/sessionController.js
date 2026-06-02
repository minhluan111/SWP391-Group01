const { sql, poolPromise } = require('../config/db');

const checkIn = async (req, res) => {
    try {
        const { vehicle_id, slot_id, reservation_id } = req.body;
        const staff_id = req.user.id;
        const pool = await poolPromise;

        const ticket_code = 'TICKET-' + Date.now();
        const check_in_time = new Date();

        await pool.request()
            .input('ticket_code', sql.VarChar, ticket_code)
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('slot_id', sql.Int, slot_id)
            .input('reservation_id', sql.Int, reservation_id || null)
            .input('check_in_time', sql.DateTime, check_in_time)
            .input('staff_in_id', sql.Int, staff_id)
            .query(`
                INSERT INTO parking_sessions (ticket_code, vehicle_id, slot_id, reservation_id, check_in_time, status, staff_in_id)
                VALUES (@ticket_code, @vehicle_id, @slot_id, @reservation_id, @check_in_time, 'active', @staff_in_id)
            `);

        await pool.request()
            .input('slot_id', sql.Int, slot_id)
            .query('UPDATE parking_slots SET status = \'occupied\' WHERE id = @slot_id');

        if (reservation_id) {
            await pool.request()
                .input('reservation_id', sql.Int, reservation_id)
                .query('UPDATE reservations SET status = \'checked_in\' WHERE id = @reservation_id');
        }

        res.json({ success: true, message: 'Check-in thành công', data: { ticket_code } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const checkOut = async (req, res) => {
    try {
        const { session_id } = req.body;
        const staff_id = req.user.id;
        const pool = await poolPromise;

        const session = await pool.request()
            .input('session_id', sql.Int, session_id)
            .query('SELECT * FROM parking_sessions WHERE id = @session_id AND status = \'active\'');

        if (session.recordset.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy phiên đỗ xe đang hoạt động' });
        }

        const check_out_time = new Date();
        const check_in_time = new Date(session.recordset[0].check_in_time);
        const hours = Math.ceil((check_out_time - check_in_time) / (1000 * 60 * 60)) || 1;
        
        const total_amount = hours * 20000;

        await pool.request()
            .input('session_id', sql.Int, session_id)
            .input('check_out_time', sql.DateTime, check_out_time)
            .input('total_hours', sql.Decimal(5, 2), hours)
            .input('total_amount', sql.Decimal(10, 2), total_amount)
            .input('staff_out_id', sql.Int, staff_id)
            .query(`
                UPDATE parking_sessions 
                SET check_out_time = @check_out_time, total_hours = @total_hours, 
                    total_amount = @total_amount, status = 'completed', staff_out_id = @staff_out_id
                WHERE id = @session_id
            `);

        await pool.request()
            .input('slot_id', sql.Int, session.recordset[0].slot_id)
            .query('UPDATE parking_slots SET status = \'available\' WHERE id = @slot_id');

        res.json({ success: true, message: 'Check-out thành công', data: { total_hours: hours, total_amount } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { checkIn, checkOut };

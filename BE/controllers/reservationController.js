const { sql, poolPromise } = require('../config/db');

const createReservation = async (req, res) => {
    try {
        const { vehicle_id, slot_id, reservation_time, expected_checkout_time } = req.body;
        const user_id = req.user.id;
        const pool = await poolPromise;

        const checkSlot = await pool.request()
            .input('slot_id', sql.Int, slot_id)
            .query('SELECT status FROM parking_slots WHERE id = @slot_id');
        
        if (checkSlot.recordset.length === 0 || checkSlot.recordset[0].status !== 'available') {
            return res.status(400).json({ message: 'Chỗ đỗ xe không trống' });
        }

        let res_time = reservation_time ? new Date(reservation_time) : new Date();
        let exp_time = expected_checkout_time ? new Date(expected_checkout_time) : new Date(res_time.getTime() + 2 * 60 * 60 * 1000);

        if (isNaN(res_time.getTime()) || isNaN(exp_time.getTime())) {
            return res.status(400).json({ message: 'Thời gian đặt chỗ hoặc thời gian dự kiến ra không hợp lệ' });
        }

        const now = new Date();
        // Allow a small 5 minute grace window for network lag
        if (res_time < new Date(now.getTime() - 5 * 60 * 1000)) {
            return res.status(400).json({ message: 'Thời gian bắt đầu đặt chỗ không được ở quá khứ' });
        }

        if (exp_time <= res_time) {
            return res.status(400).json({ message: 'Thời gian dự kiến ra phải lớn hơn thời gian bắt đầu đặt chỗ' });
        }

        const reservation_code = 'RES-' + Date.now();

        await pool.request()
            .input('reservation_code', sql.VarChar, reservation_code)
            .input('user_id', sql.Int, user_id)
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('slot_id', sql.Int, slot_id)
            .input('reservation_time', sql.DateTime, res_time)
            .input('expected_checkout_time', sql.DateTime, exp_time)
            .query(`
                INSERT INTO reservations (reservation_code, user_id, vehicle_id, slot_id, reservation_time, expected_checkout_time)
                VALUES (@reservation_code, @user_id, @vehicle_id, @slot_id, @reservation_time, @expected_checkout_time)
            `);

        await pool.request()
            .input('slot_id', sql.Int, slot_id)
            .query('UPDATE parking_slots SET status = \'reserved\' WHERE id = @slot_id');

        res.json({ success: true, message: 'Đặt chỗ thành công', data: { reservation_code } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const getMyReservations = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, req.user.id)
            .query(`
                SELECT r.id, r.reservation_code, r.reservation_time, r.expected_checkout_time, r.status, 
                       v.license_plate, v.vehicle_type, s.slot_code,
                       ps.check_in_time, ps.check_out_time, ps.total_amount,
                       p.payment_status, p.payment_method
                FROM reservations r
                JOIN vehicles v ON r.vehicle_id = v.id
                JOIN parking_slots s ON r.slot_id = s.id
                LEFT JOIN parking_sessions ps ON ps.reservation_id = r.id
                LEFT JOIN payments p ON p.parking_session_id = ps.id
                WHERE r.user_id = @user_id
                ORDER BY r.reservation_time DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { createReservation, getMyReservations };

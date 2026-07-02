const { sql, poolPromise } = require('../config/db');
const {
    expireStaleReservations,
    assertVehicleCanBook,
    validateReservationTimes,
    assertCanCancelReservation,
} = require('../utils/reservationRules');

const createReservation = async (req, res) => {
    try {
        const { vehicle_id, slot_id, reservation_time, expected_checkout_time } = req.body;
        const user_id = req.user.id;
        const pool = await poolPromise;

        await expireStaleReservations(pool);

        const checkSlot = await pool.request()
            .input('slot_id', sql.Int, slot_id)
            .query('SELECT status FROM parking_slots WHERE id = @slot_id');
        
        if (checkSlot.recordset.length === 0 || checkSlot.recordset[0].status !== 'available') {
            return res.status(400).json({ message: 'Chỗ đỗ xe không trống' });
        }

        const vehicleOwner = await pool.request()
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('user_id', sql.Int, user_id)
            .query('SELECT id FROM vehicles WHERE id = @vehicle_id AND user_id = @user_id');

        if (vehicleOwner.recordset.length === 0) {
            return res.status(403).json({ message: 'Phương tiện không thuộc tài khoản của bạn' });
        }

        try {
            await assertVehicleCanBook(pool, vehicle_id);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        let res_time = reservation_time ? new Date(reservation_time) : new Date();
        let exp_time = expected_checkout_time ? new Date(expected_checkout_time) : new Date(res_time.getTime() + 2 * 60 * 60 * 1000);

        if (isNaN(res_time.getTime()) || isNaN(exp_time.getTime())) {
            return res.status(400).json({ message: 'Thời gian đặt chỗ hoặc thời gian dự kiến ra không hợp lệ' });
        }

        try {
            validateReservationTimes(res_time, exp_time);
        } catch (err) {
            return res.status(400).json({ message: err.message });
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
        await expireStaleReservations(pool);

        const userRes = await pool.request()
            .input('user_id', sql.Int, req.user.id)
            .query('SELECT phone FROM users WHERE id = @user_id');
        const userPhone = (userRes.recordset[0]?.phone || '').trim();

        const result = await pool.request()
            .input('user_id', sql.Int, req.user.id)
            .query(`
                SELECT r.id, r.reservation_code, r.reservation_time, r.expected_checkout_time, r.status, 
                       r.vehicle_id,
                       v.license_plate, v.vehicle_type, s.slot_code,
                       ps.ticket_code, ps.check_in_time, ps.check_out_time, ps.total_amount,
                       p.payment_status, p.payment_method,
                       0 as is_walkin_history
                FROM reservations r
                JOIN vehicles v ON r.vehicle_id = v.id
                JOIN parking_slots s ON r.slot_id = s.id
                LEFT JOIN parking_sessions ps ON ps.reservation_id = r.id
                LEFT JOIN payments p ON p.parking_session_id = ps.id
                WHERE r.user_id = @user_id
            `);

        let walkInRows = [];
        if (userPhone) {
            const walkInRes = await pool.request()
                .input('phone', sql.VarChar, userPhone)
                .query(`
                    SELECT ps.id, ps.ticket_code as reservation_code, ps.check_in_time as reservation_time,
                           ps.check_out_time as expected_checkout_time,
                           CASE WHEN ps.status = 'active' THEN 'checked_in' ELSE 'completed' END as status,
                           v.id as vehicle_id,
                           v.license_plate, v.vehicle_type, s.slot_code,
                           ps.ticket_code, ps.check_in_time, ps.check_out_time, ps.total_amount,
                           p.payment_status, p.payment_method,
                           1 as is_walkin_history
                    FROM parking_sessions ps
                    JOIN vehicles v ON ps.vehicle_id = v.id
                    JOIN parking_slots s ON ps.slot_id = s.id
                    LEFT JOIN payments p ON p.parking_session_id = ps.id
                    WHERE ps.guest_phone = @phone
                      AND ps.reservation_id IS NULL
                `);
            walkInRows = walkInRes.recordset;
        }

        const combined = [...result.recordset, ...walkInRows].sort((a, b) => {
            const ta = new Date(a.check_in_time || a.reservation_time).getTime();
            const tb = new Date(b.check_in_time || b.reservation_time).getTime();
            return tb - ta;
        });

        res.json({ success: true, data: combined });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const cancelReservation = async (req, res) => {
    try {
        const reservation_id = parseInt(req.params.id, 10);
        const user_id = req.user.id;

        if (!reservation_id || Number.isNaN(reservation_id)) {
            return res.status(400).json({ message: 'Mã đặt chỗ không hợp lệ' });
        }

        const pool = await poolPromise;
        await expireStaleReservations(pool);

        const found = await pool.request()
            .input('reservation_id', sql.Int, reservation_id)
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT id, reservation_code, status, slot_id, reservation_time
                FROM reservations
                WHERE id = @reservation_id AND user_id = @user_id
            `);

        if (found.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đặt chỗ hoặc bạn không có quyền hủy.' });
        }

        const reservation = found.recordset[0];

        try {
            assertCanCancelReservation(reservation);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        await pool.request()
            .input('reservation_id', sql.Int, reservation_id)
            .query(`
                UPDATE reservations SET status = 'cancelled' WHERE id = @reservation_id
            `);

        await pool.request()
            .input('slot_id', sql.Int, reservation.slot_id)
            .query(`
                UPDATE parking_slots SET status = 'available'
                WHERE id = @slot_id
                  AND id NOT IN (
                    SELECT slot_id FROM reservations WHERE status = 'pending'
                  )
            `);

        res.json({
            success: true,
            message: `Đã hủy đặt chỗ ${reservation.reservation_code} thành công.`,
            data: { reservation_code: reservation.reservation_code },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { createReservation, getMyReservations, cancelReservation };

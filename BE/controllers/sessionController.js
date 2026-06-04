const { sql, poolPromise } = require('../config/db');

// Helper to calculate fee based on vehicle type and check-in time
const calculateFee = async (pool, vehicle_type, check_in_time, check_out_time) => {
    // calculate total hours (rounded up)
    const diffMs = check_out_time - check_in_time;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60)) || 1;
    
    // Determine pricing period
    const dayOfWeek = check_in_time.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const hour = check_in_time.getHours();
    const isDay = (hour >= 6 && hour < 22); // 6 AM to 10 PM is Day
    
    let pricing_period = '';
    if (isWeekend) {
        pricing_period = isDay ? 'weekend_day' : 'weekend_night';
    } else {
        pricing_period = isDay ? 'weekday_day' : 'weekday_night';
    }
    
    // Query rate
    let result = await pool.request()
        .input('vehicle_type', sql.VarChar, vehicle_type)
        .input('pricing_period', sql.VarChar, pricing_period)
        .query('SELECT hourly_rate FROM pricing_rules WHERE vehicle_type = @vehicle_type AND pricing_period = @pricing_period');
        
    let rate = 0;
    if (result.recordset.length > 0) {
        rate = result.recordset[0].hourly_rate;
    } else {
        // Fallback: query any rate for this vehicle type
        result = await pool.request()
            .input('vehicle_type', sql.VarChar, vehicle_type)
            .query('SELECT TOP 1 hourly_rate FROM pricing_rules WHERE vehicle_type = @vehicle_type');
        if (result.recordset.length > 0) {
            rate = result.recordset[0].hourly_rate;
        } else {
            rate = vehicle_type === 'car' ? 20000.00 : 5000.00; // default hardcoded
        }
    }
    
    return {
        hours,
        rate,
        total_amount: hours * rate
    };
};

const checkIn = async (req, res) => {
    try {
        const { vehicle_id, slot_id, reservation_id } = req.body;
        const staff_id = req.user.id;
        const pool = await poolPromise;

        // Verify if slot is available or reserved
        const checkSlot = await pool.request()
            .input('slot_id', sql.Int, slot_id)
            .query('SELECT status FROM parking_slots WHERE id = @slot_id');

        if (checkSlot.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy vị trí đỗ xe này' });
        }

        const slotStatus = checkSlot.recordset[0].status;
        if (slotStatus !== 'available' && slotStatus !== 'reserved') {
            return res.status(400).json({ message: 'Ô đỗ không khả dụng để check-in' });
        }

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
        res.status(500).json({ success: false, message: 'Lỗi server khi check-in' });
    }
};

const checkOut = async (req, res) => {
    try {
        const { session_id } = req.body;
        const staff_id = req.user.id;
        const pool = await poolPromise;

        const sessionRes = await pool.request()
            .input('session_id', sql.Int, session_id)
            .query(`
                SELECT ps.*, v.vehicle_type, v.license_plate 
                FROM parking_sessions ps
                JOIN vehicles v ON ps.vehicle_id = v.id
                WHERE ps.id = @session_id AND ps.status = 'active'
            `);

        if (sessionRes.recordset.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy phiên đỗ xe đang hoạt động' });
        }

        const session = sessionRes.recordset[0];
        const check_out_time = new Date();
        const check_in_time = new Date(session.check_in_time);

        // Calculate dynamic fee
        const feeDetail = await calculateFee(pool, session.vehicle_type, check_in_time, check_out_time);

        // Complete the parking session
        await pool.request()
            .input('session_id', sql.Int, session_id)
            .input('check_out_time', sql.DateTime, check_out_time)
            .input('total_hours', sql.Decimal(5, 2), feeDetail.hours)
            .input('total_amount', sql.Decimal(10, 2), feeDetail.total_amount)
            .input('staff_out_id', sql.Int, staff_id)
            .query(`
                UPDATE parking_sessions 
                SET check_out_time = @check_out_time, total_hours = @total_hours, 
                    total_amount = @total_amount, status = 'completed', staff_out_id = @staff_out_id
                WHERE id = @session_id
            `);

        // Set slot back to available
        await pool.request()
            .input('slot_id', sql.Int, session.slot_id)
            .query('UPDATE parking_slots SET status = \'available\' WHERE id = @slot_id');

        // Create transaction details in Payments table
        await pool.request()
            .input('sessionId', sql.Int, session_id)
            .input('amount', sql.Decimal(10, 2), feeDetail.total_amount)
            .query(`
                INSERT INTO payments (parking_session_id, payment_method, payment_status, amount, paid_at)
                VALUES (@sessionId, 'cash', 'paid', @amount, GETDATE())
            `);

        res.json({ 
            success: true, 
            message: 'Check-out thành công', 
            data: { 
                total_hours: feeDetail.hours, 
                hourly_rate: feeDetail.rate,
                total_amount: feeDetail.total_amount 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi check-out' });
    }
};

// Search reservations or active parking sessions for Staff
const searchBookingOrSession = async (req, res) => {
    try {
        const { query } = req.query; // search query (reservation code, license plate or slot code)
        if (!query) {
            return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm' });
        }

        const pool = await poolPromise;

        // 1. Search in active reservations (pending status)
        const reservationRes = await pool.request()
            .input('query', sql.VarChar, `%${query}%`)
            .query(`
                SELECT r.id as reservation_id, r.reservation_code, r.reservation_time, r.expected_checkout_time, r.status,
                       v.id as vehicle_id, v.license_plate, v.vehicle_type,
                       s.id as slot_id, s.slot_code,
                       u.full_name as customer_name, u.phone as customer_phone
                FROM reservations r
                JOIN vehicles v ON r.vehicle_id = v.id
                JOIN parking_slots s ON r.slot_id = s.id
                JOIN users u ON r.user_id = u.id
                WHERE r.status = 'pending' AND (r.reservation_code LIKE @query OR v.license_plate LIKE @query OR s.slot_code LIKE @query)
            `);

        // 2. Search in active parking sessions
        const sessionRes = await pool.request()
            .input('query', sql.VarChar, `%${query}%`)
            .query(`
                SELECT ps.id as session_id, ps.ticket_code, ps.check_in_time, ps.status,
                       v.id as vehicle_id, v.license_plate, v.vehicle_type,
                       s.id as slot_id, s.slot_code,
                       u.full_name as customer_name, u.phone as customer_phone
                FROM parking_sessions ps
                JOIN vehicles v ON ps.vehicle_id = v.id
                JOIN parking_slots s ON ps.slot_id = s.id
                LEFT JOIN users u ON v.user_id = u.id
                WHERE ps.status = 'active' AND (ps.ticket_code LIKE @query OR v.license_plate LIKE @query OR s.slot_code LIKE @query)
            `);

        res.json({
            success: true,
            data: {
                reservations: reservationRes.recordset,
                activeSessions: sessionRes.recordset
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm thông tin' });
    }
};

// GET Daily log of check-ins and check-outs
const getDailyLog = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Find sessions check-in or check-out today
        const result = await pool.request().query(`
            SELECT ps.id, ps.ticket_code, ps.check_in_time, ps.check_out_time, ps.total_hours, ps.total_amount, ps.status,
                   v.license_plate, v.vehicle_type, s.slot_code,
                   u_in.full_name as staff_in_name, u_out.full_name as staff_out_name
            FROM parking_sessions ps
            JOIN vehicles v ON ps.vehicle_id = v.id
            JOIN parking_slots s ON ps.slot_id = s.id
            LEFT JOIN users u_in ON ps.staff_in_id = u_in.id
            LEFT JOIN users u_out ON ps.staff_out_id = u_out.id
            WHERE CAST(ps.check_in_time AS DATE) = CAST(GETDATE() AS DATE)
               OR CAST(ps.check_out_time AS DATE) = CAST(GETDATE() AS DATE)
            ORDER BY ps.check_in_time DESC
        `);

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy nhật ký ngày' });
    }
};

module.exports = {
    checkIn,
    checkOut,
    searchBookingOrSession,
    getDailyLog
};

const { sql, poolPromise } = require('../config/db');
const {
    expireStaleReservations,
    validateCheckInTime,
} = require('../utils/reservationRules');
const { resolveVehicleForWalkIn, GUEST_EMAIL } = require('../utils/guestUser');
const { validateOptionalPhone, validateWalkInCheckInTime } = require('../utils/validation');
const { buildCustomerDisplayFields, getCustomerTypeSqlFilter } = require('../utils/customerDisplay');
const { buildTodayFilter, applyTodayRangeInput } = require('../utils/dateFilters');

// Helper to calculate fee based on vehicle type and check-in time
const calculateFee = async (pool, vehicle_type, check_in_time, check_out_time) => {
    const diffMs = check_out_time - check_in_time;
    if (diffMs < 0) {
        throw new Error('Giờ ra bãi phải sau giờ vào bãi.');
    }

    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    
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
        const { vehicle_id, slot_id, reservation_id, check_in_time: checkInTimeInput } = req.body;
        const staff_id = req.user.id;
        const pool = await poolPromise;

        await expireStaleReservations(pool);

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

        const activeSession = await pool.request()
            .input('vehicle_id', sql.Int, vehicle_id)
            .query(`
                SELECT TOP 1 id FROM parking_sessions
                WHERE vehicle_id = @vehicle_id AND status = 'active'
            `);

        if (activeSession.recordset.length > 0) {
            return res.status(400).json({ message: 'Xe đang có phiên đỗ hoạt động trong bãi.' });
        }

        let check_in_time = checkInTimeInput ? new Date(checkInTimeInput) : new Date();
        if (isNaN(check_in_time.getTime())) {
            return res.status(400).json({ message: 'Thời gian check-in không hợp lệ.' });
        }

        if (reservation_id) {
            const reservationRes = await pool.request()
                .input('reservation_id', sql.Int, reservation_id)
                .query(`
                    SELECT r.id, r.status, r.reservation_time, r.vehicle_id, r.slot_id, r.reservation_code
                    FROM reservations r
                    WHERE r.id = @reservation_id
                `);

            if (reservationRes.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy đặt chỗ.' });
            }

            const reservation = reservationRes.recordset[0];

            if (reservation.status === 'expired') {
                return res.status(400).json({
                    message: `Đặt chỗ ${reservation.reservation_code} đã tự động hết hạn vì không check-in trong vòng 15 phút sau giờ vào dự kiến.`,
                });
            }

            if (reservation.status !== 'pending') {
                return res.status(400).json({ message: 'Mã đặt chỗ không còn hiệu lực (đã hết hạn hoặc đã hủy).' });
            }

            if (reservation.vehicle_id !== vehicle_id || reservation.slot_id !== slot_id) {
                return res.status(400).json({ message: 'Thông tin xe hoặc ô đỗ không khớp với đặt chỗ.' });
            }

            try {
                validateCheckInTime(check_in_time, reservation.reservation_time);
            } catch (err) {
                return res.status(400).json({ message: err.message });
            }
        }

        const ticket_code = 'TICKET-' + Date.now();
        const vehicle_photo_url = req.body.vehicle_photo_url || null;

        await pool.request()
            .input('ticket_code', sql.VarChar, ticket_code)
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('slot_id', sql.Int, slot_id)
            .input('reservation_id', sql.Int, reservation_id || null)
            .input('check_in_time', sql.DateTime, check_in_time)
            .input('staff_in_id', sql.Int, staff_id)
            .input('vehicle_photo_url', sql.VarChar, vehicle_photo_url)
            .query(`
                INSERT INTO parking_sessions (ticket_code, vehicle_id, slot_id, reservation_id, check_in_time, status, staff_in_id, vehicle_photo_url)
                VALUES (@ticket_code, @vehicle_id, @slot_id, @reservation_id, @check_in_time, 'active', @staff_in_id, @vehicle_photo_url)
            `);

        await pool.request()
            .input('slot_id', sql.Int, slot_id)
            .query('UPDATE parking_slots SET status = \'occupied\' WHERE id = @slot_id');

        if (reservation_id) {
            await pool.request()
                .input('reservation_id', sql.Int, reservation_id)
                .query('UPDATE reservations SET status = \'checked_in\' WHERE id = @reservation_id');
        }

        res.json({
            success: true,
            message: `Check-in thành công! Mã vé vào bãi: ${ticket_code}`,
            data: { ticket_code, check_in_time, vehicle_photo_url },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi check-in' });
    }
};

const walkInCheckIn = async (req, res) => {
    try {
        const { license_plate, vehicle_type, slot_id, check_in_time: checkInTimeInput, guest_phone } = req.body;
        const staff_id = req.user.id;
        const pool = await poolPromise;

        if (!license_plate || !vehicle_type || !slot_id) {
            return res.status(400).json({ message: 'Vui lòng nhập biển số, loại xe và chọn ô đỗ.' });
        }

        const phoneError = validateOptionalPhone(guest_phone);
        if (phoneError) {
            return res.status(400).json({ message: phoneError });
        }
        const normalizedGuestPhone = guest_phone ? String(guest_phone).trim() : null;

        if (!['car', 'motorbike'].includes(vehicle_type)) {
            return res.status(400).json({ message: 'Loại xe không hợp lệ.' });
        }

        await expireStaleReservations(pool);

        const slotId = parseInt(slot_id, 10);
        const checkSlot = await pool.request()
            .input('slot_id', sql.Int, slotId)
            .query('SELECT status, vehicle_type FROM parking_slots WHERE id = @slot_id');

        if (checkSlot.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy vị trí đỗ xe này' });
        }

        const slot = checkSlot.recordset[0];
        if (slot.vehicle_type !== vehicle_type) {
            return res.status(400).json({ message: 'Loại xe không phù hợp với tầng/ô đỗ đã chọn.' });
        }

        if (slot.status !== 'available') {
            return res.status(400).json({ message: 'Ô đỗ không còn trống.' });
        }

        let vehicle_id;
        try {
            vehicle_id = await resolveVehicleForWalkIn(pool, license_plate, vehicle_type);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const activeSession = await pool.request()
            .input('vehicle_id', sql.Int, vehicle_id)
            .query(`
                SELECT TOP 1 ticket_code FROM parking_sessions
                WHERE vehicle_id = @vehicle_id AND status = 'active'
            `);

        if (activeSession.recordset.length > 0) {
            return res.status(400).json({
                message: `Xe đang có phiên đỗ hoạt động (${activeSession.recordset[0].ticket_code}). Vui lòng checkout trước.`,
            });
        }

        let check_in_time = checkInTimeInput ? new Date(checkInTimeInput) : new Date();
        const timeError = validateWalkInCheckInTime(check_in_time);
        if (timeError) {
            return res.status(400).json({ message: timeError });
        }

        const ticket_code = 'TICKET-' + Date.now();
        const vehicle_photo_url = req.file ? `/uploads/vehicle-photos/${req.file.filename}` : null;

        await pool.request()
            .input('ticket_code', sql.VarChar, ticket_code)
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('slot_id', sql.Int, slotId)
            .input('check_in_time', sql.DateTime, check_in_time)
            .input('staff_in_id', sql.Int, staff_id)
            .input('vehicle_photo_url', sql.VarChar, vehicle_photo_url)
            .input('guest_phone', sql.VarChar, normalizedGuestPhone)
            .query(`
                INSERT INTO parking_sessions (ticket_code, vehicle_id, slot_id, reservation_id, check_in_time, status, staff_in_id, vehicle_photo_url, guest_phone)
                VALUES (@ticket_code, @vehicle_id, @slot_id, NULL, @check_in_time, 'active', @staff_in_id, @vehicle_photo_url, @guest_phone)
            `);

        await pool.request()
            .input('slot_id', sql.Int, slotId)
            .query("UPDATE parking_slots SET status = 'occupied' WHERE id = @slot_id");

        const vehicleInfo = await pool.request()
            .input('vehicle_id', sql.Int, vehicle_id)
            .query('SELECT license_plate, vehicle_type FROM vehicles WHERE id = @vehicle_id');

        const slotInfo = await pool.request()
            .input('slot_id', sql.Int, slotId)
            .query(`
                SELECT s.slot_code, f.floor_name
                FROM parking_slots s
                JOIN floors f ON s.floor_id = f.id
                WHERE s.id = @slot_id
            `);

        res.json({
            success: true,
            message: `Tạo vé thành công! Mã vé: ${ticket_code}`,
            data: {
                ticket_code,
                check_in_time,
                vehicle_photo_url,
                license_plate: vehicleInfo.recordset[0]?.license_plate,
                vehicle_type: vehicleInfo.recordset[0]?.vehicle_type,
                slot_code: slotInfo.recordset[0]?.slot_code,
                floor_name: slotInfo.recordset[0]?.floor_name,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi check-in trực tiếp' });
    }
};

const previewCheckOut = async (req, res) => {
    try {
        const { session_id, check_out_time: checkOutTimeInput } = req.body;
        const pool = await poolPromise;

        const sessionRes = await pool.request()
            .input('session_id', sql.Int, session_id)
            .query(`
                SELECT ps.id, ps.ticket_code, ps.check_in_time, ps.status,
                       ps.vehicle_photo_url,
                       v.vehicle_type, v.license_plate, s.slot_code
                FROM parking_sessions ps
                JOIN vehicles v ON ps.vehicle_id = v.id
                JOIN parking_slots s ON ps.slot_id = s.id
                WHERE ps.id = @session_id AND ps.status = 'active'
            `);

        if (sessionRes.recordset.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy phiên đỗ xe đang hoạt động' });
        }

        const session = sessionRes.recordset[0];
        const check_in_time = new Date(session.check_in_time);
        let check_out_time = checkOutTimeInput ? new Date(checkOutTimeInput) : new Date();

        if (isNaN(check_out_time.getTime())) {
            return res.status(400).json({ message: 'Thời gian check-out không hợp lệ.' });
        }

        if (check_out_time < check_in_time) {
            return res.status(400).json({
                message: 'Giờ ra bãi phải sau giờ vào bãi. Vui lòng kiểm tra lại thời gian check-out.',
            });
        }

        let feeDetail;
        try {
            feeDetail = await calculateFee(pool, session.vehicle_type, check_in_time, check_out_time);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        res.json({
            success: true,
            data: {
                session_id: session.id,
                ticket_code: session.ticket_code,
                license_plate: session.license_plate,
                vehicle_type: session.vehicle_type,
                slot_code: session.slot_code,
                check_in_time: session.check_in_time,
                check_out_time: check_out_time.toISOString(),
                vehicle_photo_url: session.vehicle_photo_url
                    ? String(session.vehicle_photo_url)
                    : null,
                total_hours: feeDetail.hours,
                hourly_rate: feeDetail.rate,
                total_amount: feeDetail.total_amount,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi tính phí' });
    }
};

const checkOut = async (req, res) => {
    try {
        const { session_id, check_out_time: checkOutTimeInput } = req.body;
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
        const check_in_time = new Date(session.check_in_time);
        let check_out_time = checkOutTimeInput ? new Date(checkOutTimeInput) : new Date();

        if (isNaN(check_out_time.getTime())) {
            return res.status(400).json({ message: 'Thời gian check-out không hợp lệ.' });
        }

        if (check_out_time < check_in_time) {
            return res.status(400).json({
                message: 'Giờ ra bãi phải sau giờ vào bãi. Vui lòng kiểm tra lại thời gian check-out.',
            });
        }

        let feeDetail;
        try {
            feeDetail = await calculateFee(pool, session.vehicle_type, check_in_time, check_out_time);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

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
                total_amount: feeDetail.total_amount,
                check_out_time,
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
        await expireStaleReservations(pool);

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
                SELECT ps.id as session_id, ps.ticket_code, ps.check_in_time, ps.status, ps.vehicle_photo_url,
                       ps.guest_phone, ps.reservation_id,
                       v.id as vehicle_id, v.license_plate, v.vehicle_type,
                       s.id as slot_id, s.slot_code,
                       u.full_name as customer_name, u.phone as customer_phone, u.email as customer_email
                FROM parking_sessions ps
                JOIN vehicles v ON ps.vehicle_id = v.id
                JOIN parking_slots s ON ps.slot_id = s.id
                LEFT JOIN users u ON v.user_id = u.id
                WHERE ps.status = 'active' AND (ps.ticket_code LIKE @query OR v.license_plate LIKE @query OR s.slot_code LIKE @query)
            `);

        const activeSessions = sessionRes.recordset.map((row) => ({
            ...row,
            ...buildCustomerDisplayFields({
                customer_name: row.customer_name,
                customer_phone: row.customer_phone,
                owner_email: row.customer_email,
                guest_phone: row.guest_phone,
                reservation_id: row.reservation_id,
            }),
        }));

        res.json({
            success: true,
            data: {
                reservations: reservationRes.recordset,
                activeSessions,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm thông tin' });
    }
};

// GET activity log with filters
const getDailyLog = async (req, res) => {
    try {
        const pool = await poolPromise;
        const preset = req.query.preset || 'today';
        const status = req.query.status || 'all';
        const customerType = req.query.customer_type || 'all';
        const query = (req.query.query || '').trim();

        let dateFilter = '';
        let todayLocalDate = null;
        if (preset === 'today') {
            const todayFilter = buildTodayFilter(req.query.local_date);
            dateFilter = todayFilter.sql;
            todayLocalDate = todayFilter.localDate;
        } else if (preset === '7d') {
            dateFilter = 'AND ps.check_in_time >= DATEADD(day, -7, GETDATE())';
        }

        let statusFilter = '';
        if (status === 'active') {
            statusFilter = "AND ps.status = 'active'";
        } else if (status === 'completed') {
            statusFilter = "AND ps.status = 'completed'";
        }

        const customerTypeFilter = getCustomerTypeSqlFilter(customerType);

        const baseFrom = `
            FROM parking_sessions ps
            JOIN vehicles v ON ps.vehicle_id = v.id
            JOIN parking_slots s ON ps.slot_id = s.id
            LEFT JOIN users u_owner ON v.user_id = u_owner.id
            LEFT JOIN users u_in ON ps.staff_in_id = u_in.id
            LEFT JOIN users u_out ON ps.staff_out_id = u_out.id
            WHERE 1=1 ${dateFilter} ${customerTypeFilter}
        `;

        const countRequest = pool.request().input('guest_email', sql.VarChar, GUEST_EMAIL);
        applyTodayRangeInput(countRequest, sql, todayLocalDate);
        const countResult = await countRequest.query(`
            SELECT COUNT(*) as total
            FROM parking_sessions ps
            JOIN vehicles v ON ps.vehicle_id = v.id
            LEFT JOIN users u_owner ON v.user_id = u_owner.id
            WHERE 1=1 ${dateFilter} ${customerTypeFilter}
        `);
        const totalInPreset = countResult.recordset[0].total;

        let dataQuery = `
            SELECT TOP 200 ps.id, ps.ticket_code, ps.check_in_time, ps.check_out_time, ps.total_hours, ps.total_amount, ps.status,
                   ps.guest_phone, ps.reservation_id,
                   v.license_plate, v.vehicle_type, s.slot_code,
                   u_owner.email as owner_email, u_owner.full_name as customer_name, u_owner.phone as customer_phone,
                   u_in.full_name as staff_in_name, u_out.full_name as staff_out_name
            ${baseFrom}
            ${statusFilter}
        `;

        const request = pool.request().input('guest_email', sql.VarChar, GUEST_EMAIL);
        applyTodayRangeInput(request, sql, todayLocalDate);
        if (query) {
            dataQuery += ` AND (
                ps.ticket_code LIKE @query
                OR v.license_plate LIKE @query
                OR s.slot_code LIKE @query
                OR v.vehicle_type LIKE @query
            )`;
            request.input('query', sql.VarChar, `%${query}%`);
        }

        dataQuery += ' ORDER BY ps.check_in_time DESC';

        const result = await request.query(dataQuery);

        const data = result.recordset.map((row) => ({
            ...row,
            ...buildCustomerDisplayFields({
                customer_name: row.customer_name,
                customer_phone: row.customer_phone,
                owner_email: row.owner_email,
                guest_phone: row.guest_phone,
                reservation_id: row.reservation_id,
            }),
        }));

        res.json({
            success: true,
            data,
            meta: {
                totalInPreset,
                filteredCount: data.length,
                preset,
                status,
                customer_type: customerType,
                query,
                local_date: todayLocalDate ?? req.query.local_date ?? null,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy nhật ký ngày' });
    }
};

module.exports = {
    checkIn,
    walkInCheckIn,
    previewCheckOut,
    checkOut,
    searchBookingOrSession,
    getDailyLog,
};

const { sql } = require('../config/db');

const GRACE_PERIOD_MINUTES = 15;
const MIN_LEAD_HOURS = 2;
const MAX_ADVANCE_DAYS = 3;

function formatDateTimeVi(date) {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

async function expireStaleReservations(pool) {
    await pool.request()
        .input('grace', sql.Int, GRACE_PERIOD_MINUTES)
        .query(`
            UPDATE parking_slots SET status = 'available'
            WHERE status = 'reserved'
              AND id IN (
                SELECT r.slot_id FROM reservations r
                WHERE r.status = 'pending'
                  AND DATEADD(minute, @grace, r.reservation_time) < GETDATE()
              );

            UPDATE reservations SET status = 'expired'
            WHERE status = 'pending'
              AND DATEADD(minute, @grace, reservation_time) < GETDATE();
        `);
}

async function assertVehicleCanBook(pool, vehicle_id) {
    const pending = await pool.request()
        .input('vehicle_id', sql.Int, vehicle_id)
        .query(`
            SELECT TOP 1 reservation_code FROM reservations
            WHERE vehicle_id = @vehicle_id AND status = 'pending'
        `);

    if (pending.recordset.length > 0) {
        const code = pending.recordset[0].reservation_code;
        throw new Error(
            `Xe đã có đặt chỗ đang chờ (${code}). Vui lòng sử dụng hoặc chờ hết hạn trước khi đặt thêm.`,
        );
    }

    const active = await pool.request()
        .input('vehicle_id', sql.Int, vehicle_id)
        .query(`
            SELECT TOP 1 ticket_code FROM parking_sessions
            WHERE vehicle_id = @vehicle_id AND status = 'active'
        `);

    if (active.recordset.length > 0) {
        throw new Error(
            'Xe đang đỗ trong bãi. Vui lòng checkout và thanh toán trước khi đặt chỗ mới.',
        );
    }
}

function validateReservationTimes(res_time, exp_time, now = new Date()) {
    const minStart = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);
    const maxStart = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

    if (res_time < new Date(now.getTime() - 5 * 60 * 1000)) {
        throw new Error('Thời gian bắt đầu đặt chỗ không được ở quá khứ.');
    }

    if (res_time < minStart) {
        throw new Error(
            'Giờ vào dự kiến phải cách thời điểm hiện tại ít nhất 2 giờ (theo quy định đặt chỗ trước).',
        );
    }

    if (res_time > maxStart) {
        throw new Error('Chỉ được đặt trước tối đa 3 ngày.');
    }

    if (exp_time <= res_time) {
        throw new Error('Thời gian ra dự kiến phải sau thời gian vào dự kiến.');
    }
}

function getCheckInWindow(reservation_time) {
    const start = new Date(reservation_time);
    const end = new Date(reservation_time);
    start.setMinutes(start.getMinutes() - GRACE_PERIOD_MINUTES);
    end.setMinutes(end.getMinutes() + GRACE_PERIOD_MINUTES);
    return { start, end };
}

function validateCheckInTime(check_in_time, reservation_time) {
    const checkIn = new Date(check_in_time);
    const { start, end } = getCheckInWindow(reservation_time);
    const expected = new Date(reservation_time);

    if (checkIn < start) {
        throw new Error(
            `Chưa đến khung giờ check-in. Giờ vào dự kiến: ${formatDateTimeVi(expected)}. ` +
            `Chỉ được check-in từ ${formatDateTimeVi(start)} (sớm tối đa ${GRACE_PERIOD_MINUTES} phút).`,
        );
    }

    if (checkIn > end) {
        throw new Error(
            `Đặt chỗ đã hết hạn. Quá ${GRACE_PERIOD_MINUTES} phút so với giờ vào dự kiến (${formatDateTimeVi(expected)}). ` +
            'Vui lòng yêu cầu khách đặt chỗ mới hoặc check-in không qua đặt chỗ nếu còn chỗ trống.',
        );
    }
}

module.exports = {
    GRACE_PERIOD_MINUTES,
    MIN_LEAD_HOURS,
    MAX_ADVANCE_DAYS,
    formatDateTimeVi,
    expireStaleReservations,
    assertVehicleCanBook,
    validateReservationTimes,
    validateCheckInTime,
    getCheckInWindow,
};

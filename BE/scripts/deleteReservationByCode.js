/**
 * Xóa đặt chỗ kẹt và phiên liên quan theo mã RES-...
 * Chạy: node scripts/deleteReservationByCode.js RES-1782443014506
 */
const { sql, poolPromise } = require('../config/db');

const code = process.argv[2];
if (!code) {
    console.error('Usage: node scripts/deleteReservationByCode.js <RES-...>');
    process.exit(1);
}

async function run() {
    const pool = await poolPromise;

    const found = await pool.request()
        .input('code', sql.VarChar, code)
        .query(`
            SELECT r.id AS reservation_id, r.status, r.slot_id, r.vehicle_id,
                   v.license_plate, ps.id AS session_id, ps.status AS session_status
            FROM reservations r
            JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN parking_sessions ps ON ps.reservation_id = r.id
            WHERE r.reservation_code = @code
        `);

    if (found.recordset.length === 0) {
        console.log(`Không tìm thấy đặt chỗ: ${code}`);
        process.exit(0);
    }

    const row = found.recordset[0];
    console.log('Tìm thấy:', row);

    if (row.session_id) {
        await pool.request()
            .input('session_id', sql.Int, row.session_id)
            .query(`
                DELETE FROM payments WHERE parking_session_id = @session_id;
                DELETE FROM parking_sessions WHERE id = @session_id;
            `);
        console.log(`Đã xóa session #${row.session_id}`);
    }

    await pool.request()
        .input('reservation_id', sql.Int, row.reservation_id)
        .query('DELETE FROM reservations WHERE id = @reservation_id');
    console.log(`Đã xóa reservation #${row.reservation_id}`);

    await pool.request()
        .input('slot_id', sql.Int, row.slot_id)
        .query(`
            UPDATE parking_slots SET status = 'available'
            WHERE id = @slot_id
              AND id NOT IN (SELECT slot_id FROM parking_sessions WHERE status = 'active')
              AND id NOT IN (SELECT slot_id FROM reservations WHERE status = 'pending');
        `);

    console.log(`Đã giải phóng slot #${row.slot_id} (nếu không còn ai dùng).`);
    console.log(`Xe ${row.license_plate} có thể đặt chỗ lại.`);
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

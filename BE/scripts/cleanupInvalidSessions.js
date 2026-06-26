/**
 * Xóa phiên đỗ và thanh toán không hợp lệ (phí âm hoặc giờ ra < giờ vào).
 * Chạy: node scripts/cleanupInvalidSessions.js
 */
const { sql, poolPromise } = require('../config/db');

async function cleanup() {
    const pool = await poolPromise;

    const invalid = await pool.request().query(`
        SELECT id, ticket_code, total_amount, check_in_time, check_out_time
        FROM parking_sessions
        WHERE total_amount < 0
           OR (check_out_time IS NOT NULL AND check_out_time < check_in_time)
    `);

    if (invalid.recordset.length === 0) {
        console.log('Không có phiên đỗ không hợp lệ.');
    } else {
        console.log(`Tìm thấy ${invalid.recordset.length} phiên cần xóa:`);
        invalid.recordset.forEach((r) => console.log(`  - ${r.ticket_code}`));

        await pool.request().query(`
            DELETE p FROM payments p
            INNER JOIN parking_sessions ps ON p.parking_session_id = ps.id
            WHERE ps.total_amount < 0
               OR (ps.check_out_time IS NOT NULL AND ps.check_out_time < ps.check_in_time);
        `);

        await pool.request().query(`
            DELETE FROM parking_sessions
            WHERE total_amount < 0
               OR (check_out_time IS NOT NULL AND check_out_time < check_in_time);
        `);

        console.log('Đã xóa phiên và thanh toán không hợp lệ.');
    }

    await pool.request().query(`
        UPDATE parking_slots SET status = 'available'
        WHERE status = 'occupied'
          AND id NOT IN (SELECT slot_id FROM parking_sessions WHERE status = 'active');

        UPDATE parking_slots SET status = 'available'
        WHERE status = 'reserved'
          AND id NOT IN (SELECT slot_id FROM reservations WHERE status = 'pending');
    `);

    console.log('Đã đồng bộ lại trạng thái ô đỗ.');
    process.exit(0);
}

cleanup().catch((err) => {
    console.error(err);
    process.exit(1);
});

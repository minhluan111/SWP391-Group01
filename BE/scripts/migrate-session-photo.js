/**
 * Thêm cột ảnh xe cho phiên đỗ. Chạy: node scripts/migrate-session-photo.js
 */
const { poolPromise } = require('../config/db');

async function run() {
    const pool = await poolPromise;
    await pool.request().query(`
        IF COL_LENGTH('parking_sessions', 'vehicle_photo_url') IS NULL
        BEGIN
            ALTER TABLE parking_sessions ADD vehicle_photo_url VARCHAR(500) NULL;
        END
    `);
    console.log('OK: parking_sessions.vehicle_photo_url');
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

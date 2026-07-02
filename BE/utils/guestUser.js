const bcrypt = require('bcryptjs');
const { sql } = require('../config/db');
const { normalizeLicensePlate, validateLicensePlate } = require('./validation');

const GUEST_EMAIL = 'walkin.guest@parking.local';
const GUEST_NAME = 'Khách vãng lai';

async function ensureGuestUser(pool) {
    const existing = await pool.request()
        .input('email', sql.VarChar, GUEST_EMAIL)
        .query('SELECT id FROM users WHERE email = @email');

    if (existing.recordset.length > 0) {
        return existing.recordset[0].id;
    }

    const passwordHash = await bcrypt.hash('guest-no-login', 10);
    const inserted = await pool.request()
        .input('full_name', sql.NVarChar, GUEST_NAME)
        .input('email', sql.VarChar, GUEST_EMAIL)
        .input('password_hash', sql.VarChar, passwordHash)
        .input('phone', sql.VarChar, '0000000000')
        .query(`
            INSERT INTO users (full_name, email, password_hash, phone)
            OUTPUT inserted.id
            VALUES (@full_name, @email, @password_hash, @phone)
        `);

    const guestId = inserted.recordset[0].id;

    const roles = await pool.request().query("SELECT id FROM roles WHERE role_name = 'Customer'");
    if (roles.recordset.length > 0) {
        await pool.request()
            .input('user_id', sql.Int, guestId)
            .input('role_id', sql.Int, roles.recordset[0].id)
            .query(`
                INSERT INTO user_roles (user_id, role_id)
                SELECT @user_id, @role_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_roles WHERE user_id = @user_id AND role_id = @role_id
                )
            `);
    }

    return guestId;
}

async function resolveVehicleForWalkIn(pool, license_plate, vehicle_type) {
    const plateError = validateLicensePlate(license_plate);
    if (plateError) {
        throw new Error(plateError);
    }
    const normalized = normalizeLicensePlate(license_plate);

    const existing = await pool.request()
        .input('license_plate', sql.VarChar, normalized)
        .query('SELECT id, vehicle_type FROM vehicles WHERE license_plate = @license_plate');

    if (existing.recordset.length > 0) {
        const vehicle = existing.recordset[0];
        if (vehicle.vehicle_type !== vehicle_type) {
            throw new Error(
                `Biển số ${normalized} đã đăng ký là ${vehicle.vehicle_type === 'car' ? 'ô tô' : 'xe máy'}. Vui lòng chọn đúng loại xe.`,
            );
        }
        return vehicle.id;
    }

    const guestId = await ensureGuestUser(pool);
    const inserted = await pool.request()
        .input('user_id', sql.Int, guestId)
        .input('license_plate', sql.VarChar, normalized)
        .input('vehicle_type', sql.VarChar, vehicle_type)
        .query(`
            INSERT INTO vehicles (user_id, license_plate, vehicle_type)
            OUTPUT inserted.id
            VALUES (@user_id, @license_plate, @vehicle_type)
        `);

    return inserted.recordset[0].id;
}

module.exports = {
    GUEST_EMAIL,
    GUEST_NAME,
    ensureGuestUser,
    normalizeLicensePlate,
    resolveVehicleForWalkIn,
};

const { sql, poolPromise } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        const pool = await poolPromise;
        const passwordHash = await bcrypt.hash('123456', 10);

        // Seed Users
        const users = [
            { full_name: 'Admin User', email: 'admin@gmail.com', phone: '0123456789' },
            { full_name: 'Staff User', email: 'staff@gmail.com', phone: '0987654321' },
            { full_name: 'Customer User', email: 'customer@gmail.com', phone: '0111222333' }
        ];

        let customerId = null;

        for (const user of users) {
            const check = await pool.request().input('email', sql.VarChar, user.email).query('SELECT id FROM users WHERE email = @email');
            if (check.recordset.length === 0) {
                const res = await pool.request()
                    .input('full_name', sql.NVarChar, user.full_name)
                    .input('email', sql.VarChar, user.email)
                    .input('password_hash', sql.VarChar, passwordHash)
                    .input('phone', sql.VarChar, user.phone)
                    .query('INSERT INTO users (full_name, email, password_hash, phone) OUTPUT inserted.id VALUES (@full_name, @email, @password_hash, @phone)');
                
                if (user.email === 'customer@gmail.com') {
                    customerId = res.recordset[0].id;
                }
            } else {
                if (user.email === 'customer@gmail.com') {
                    customerId = check.recordset[0].id;
                }
            }
        }

        // Assign Roles
        const roles = await pool.request().query('SELECT * FROM roles');
        const adminRole = roles.recordset.find(r => r.role_name === 'Admin')?.id;
        const staffRole = roles.recordset.find(r => r.role_name === 'Staff')?.id;
        const customerRole = roles.recordset.find(r => r.role_name === 'Customer')?.id;

        const allUsers = await pool.request().query('SELECT id, email FROM users');
        for (const user of allUsers.recordset) {
            let roleId = customerRole;
            if (user.email === 'admin@gmail.com') roleId = adminRole;
            if (user.email === 'staff@gmail.com') roleId = staffRole;

            const checkRole = await pool.request()
                .input('user_id', sql.Int, user.id)
                .input('role_id', sql.Int, roleId)
                .query('SELECT * FROM user_roles WHERE user_id = @user_id AND role_id = @role_id');
            
            if (checkRole.recordset.length === 0 && roleId) {
                await pool.request()
                    .input('user_id', sql.Int, user.id)
                    .input('role_id', sql.Int, roleId)
                    .query('INSERT INTO user_roles (user_id, role_id) VALUES (@user_id, @role_id)');
            }
        }

        // Seed Vehicles for Customer
        if (customerId) {
            const vehicles = [
                { license_plate: '29A-12345', vehicle_type: 'car' },
                { license_plate: '29B-98765', vehicle_type: 'motorbike' }
            ];
            for (const v of vehicles) {
                const check = await pool.request().input('license_plate', sql.VarChar, v.license_plate).query('SELECT id FROM vehicles WHERE license_plate = @license_plate');
                if (check.recordset.length === 0) {
                    await pool.request()
                        .input('user_id', sql.Int, customerId)
                        .input('license_plate', sql.VarChar, v.license_plate)
                        .input('vehicle_type', sql.VarChar, v.vehicle_type)
                        .query('INSERT INTO vehicles (user_id, license_plate, vehicle_type) VALUES (@user_id, @license_plate, @vehicle_type)');
                }
            }
        }

        // Seed Slots
        const floors = await pool.request().query('SELECT * FROM floors');
        const carFloor = floors.recordset.find(f => f.vehicle_type === 'car')?.id;
        const motoFloor = floors.recordset.find(f => f.vehicle_type === 'motorbike')?.id;

        if (carFloor && motoFloor) {
            for (let i = 1; i <= 20; i++) {
                const codeCar = `A-${i.toString().padStart(2, '0')}`;
                const checkCar = await pool.request().input('slot_code', sql.VarChar, codeCar).query('SELECT id FROM parking_slots WHERE slot_code = @slot_code');
                if (checkCar.recordset.length === 0) {
                    await pool.request()
                        .input('floor_id', sql.Int, carFloor)
                        .input('slot_code', sql.VarChar, codeCar)
                        .input('vehicle_type', sql.VarChar, 'car')
                        .query('INSERT INTO parking_slots (floor_id, slot_code, vehicle_type, status) VALUES (@floor_id, @slot_code, @vehicle_type, \'available\')');
                }

                const codeMoto = `B-${i.toString().padStart(2, '0')}`;
                const checkMoto = await pool.request().input('slot_code', sql.VarChar, codeMoto).query('SELECT id FROM parking_slots WHERE slot_code = @slot_code');
                if (checkMoto.recordset.length === 0) {
                    await pool.request()
                        .input('floor_id', sql.Int, motoFloor)
                        .input('slot_code', sql.VarChar, codeMoto)
                        .input('vehicle_type', sql.VarChar, 'motorbike')
                        .query('INSERT INTO parking_slots (floor_id, slot_code, vehicle_type, status) VALUES (@floor_id, @slot_code, @vehicle_type, \'available\')');
                }
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();

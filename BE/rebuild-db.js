const { sql, poolPromise } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function rebuild() {
    console.log('Starting database rebuild...');
    let pool;
    try {
        pool = await poolPromise;
    } catch (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }

    const dropTables = [
        'payments',
        'parking_sessions',
        'reservations',
        'pricing_rules',
        'parking_slots',
        'floors',
        'vehicles',
        'user_roles',
        'users',
        'roles'
    ];

    console.log('Dropping existing tables (if they exist)...');
    for (const table of dropTables) {
        try {
            await pool.request().query(`DROP TABLE IF EXISTS ${table}`);
            console.log(`Dropped table ${table}`);
        } catch (err) {
            console.warn(`Could not drop table ${table}:`, err.message);
        }
    }

    console.log('Reading ParkingManagementDB_v2.sql schema...');
    const schemaPath = path.join(__dirname, 'ParkingManagementDB_v2.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Replace exact database creation statements
    schemaSql = schemaSql.replace(/CREATE DATABASE ParkingManagementDB;\r?\nGO/i, '');
    schemaSql = schemaSql.replace(/USE ParkingManagementDB;\r?\nGO/i, '');

    // Programmatically add GO separators before key SQL commands
    schemaSql = schemaSql.replace(/CREATE TABLE/gi, 'GO\nCREATE TABLE');
    schemaSql = schemaSql.replace(/INSERT INTO/gi, 'GO\nINSERT INTO');
    schemaSql = schemaSql.replace(/CREATE INDEX/gi, 'GO\nCREATE INDEX');
    schemaSql = schemaSql.replace(/CREATE UNIQUE INDEX/gi, 'GO\nCREATE UNIQUE INDEX');

    // Split SQL by GO statement
    const commands = schemaSql.split(/\bGO\b/i);

    console.log('Executing schema commands in batches...');
    for (let cmd of commands) {
        cmd = cmd.trim();
        if (!cmd) continue;

        try {
            console.log(`Executing batch: ${cmd.substring(0, 50).replace(/\r?\n/g, ' ')}...`);
            await pool.request().query(cmd);
        } catch (err) {
            console.error('Error executing SQL batch:', cmd, '\nError:', err.message);
            process.exit(1);
        }
    }

    console.log('Schema successfully recreated!');
    process.exit(0);
}

rebuild();

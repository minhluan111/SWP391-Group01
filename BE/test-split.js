const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'ParkingManagementDB_v2.sql');
let originalSql = fs.readFileSync(schemaPath, 'utf8');
console.log('Original length:', originalSql.length);

let schemaSql = originalSql;
// Replace exact database creation statements
schemaSql = schemaSql.replace(/CREATE DATABASE ParkingManagementDB;\r?\nGO/i, '');
console.log('After CREATE DATABASE replace:', schemaSql.length);

schemaSql = schemaSql.replace(/USE ParkingManagementDB;\r?\nGO/i, '');
console.log('After USE replace:', schemaSql.length);

schemaSql = schemaSql.replace(/CREATE TABLE/gi, 'GO\nCREATE TABLE');
schemaSql = schemaSql.replace(/INSERT INTO/gi, 'GO\nINSERT INTO');
schemaSql = schemaSql.replace(/CREATE INDEX/gi, 'GO\nCREATE INDEX');
schemaSql = schemaSql.replace(/CREATE UNIQUE INDEX/gi, 'GO\nCREATE UNIQUE INDEX');

const commands = schemaSql.split(/\bGO\b/i);
console.log('Total commands:', commands.length);
for (let i = 0; i < commands.length; i++) {
    console.log(`Command ${i} (len=${commands[i].length}):`, commands[i].substring(0, 100).replace(/\r?\n/g, ' '));
}

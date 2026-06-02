const { sql, poolPromise } = require('../config/db');

const getUserVehicles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, req.user.id)
            .query('SELECT * FROM vehicles WHERE user_id = @user_id AND is_active = 1');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const addVehicle = async (req, res) => {
    try {
        const { license_plate, vehicle_type } = req.body;
        if (!license_plate || !vehicle_type) return res.status(400).json({ message: 'Thiếu thông tin xe' });

        const pool = await poolPromise;
        const check = await pool.request().input('license_plate', sql.VarChar, license_plate).query('SELECT * FROM vehicles WHERE license_plate = @license_plate AND is_active = 1');
        if (check.recordset.length > 0) return res.status(400).json({ message: 'Biển số xe đã tồn tại' });

        await pool.request()
            .input('user_id', sql.Int, req.user.id)
            .input('license_plate', sql.VarChar, license_plate)
            .input('vehicle_type', sql.VarChar, vehicle_type)
            .query('INSERT INTO vehicles (user_id, license_plate, vehicle_type) VALUES (@user_id, @license_plate, @vehicle_type)');
        
        res.json({ success: true, message: 'Thêm phương tiện thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const vehicle_id = req.params.id;
        const pool = await poolPromise;
        
        await pool.request()
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('user_id', sql.Int, req.user.id)
            .query('UPDATE vehicles SET is_active = 0 WHERE id = @vehicle_id AND user_id = @user_id');

        res.json({ success: true, message: 'Đã xóa phương tiện' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const vehicle_id = req.params.id;
        const { license_plate, vehicle_type } = req.body;
        if (!license_plate || !vehicle_type) return res.status(400).json({ message: 'Thiếu thông tin xe' });

        const pool = await poolPromise;
        
        // Check if new license plate exists for another active vehicle
        const check = await pool.request()
            .input('license_plate', sql.VarChar, license_plate)
            .input('vehicle_id', sql.Int, vehicle_id)
            .query('SELECT * FROM vehicles WHERE license_plate = @license_plate AND id != @vehicle_id AND is_active = 1');
        
        if (check.recordset.length > 0) return res.status(400).json({ message: 'Biển số xe đã tồn tại' });

        await pool.request()
            .input('vehicle_id', sql.Int, vehicle_id)
            .input('user_id', sql.Int, req.user.id)
            .input('license_plate', sql.VarChar, license_plate)
            .input('vehicle_type', sql.VarChar, vehicle_type)
            .query('UPDATE vehicles SET license_plate = @license_plate, vehicle_type = @vehicle_type WHERE id = @vehicle_id AND user_id = @user_id');

        res.json({ success: true, message: 'Cập nhật phương tiện thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { getUserVehicles, addVehicle, deleteVehicle, updateVehicle };

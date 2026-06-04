const { sql, poolPromise } = require('../config/db');

// Get floor slot capacity and list of slots
const getFloorCapacity = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT f.id, f.floor_name, f.vehicle_type, COUNT(s.id) as slot_count
            FROM floors f
            LEFT JOIN parking_slots s ON f.id = s.floor_id
            GROUP BY f.id, f.floor_name, f.vehicle_type
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Set capacity of floor (number of slots)
const setFloorCapacity = async (req, res) => {
    try {
        const floorId = req.params.id;
        const { capacity } = req.body; // e.g., 25

        if (!capacity || capacity <= 0) {
            return res.status(400).json({ message: 'Dung lượng phải lớn hơn 0' });
        }

        const pool = await poolPromise;

        // Get floor info
        const floorRes = await pool.request()
            .input('floorId', sql.Int, floorId)
            .query('SELECT * FROM floors WHERE id = @floorId');

        if (floorRes.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tầng đỗ xe' });
        }

        const floor = floorRes.recordset[0];
        const prefix = floor.vehicle_type === 'car' ? 'A' : 'B';

        // Get current slots
        const slotsRes = await pool.request()
            .input('floorId', sql.Int, floorId)
            .query('SELECT * FROM parking_slots WHERE floor_id = @floorId ORDER BY slot_code DESC');

        const currentSlots = slotsRes.recordset;
        const currentCount = currentSlots.length;

        if (capacity > currentCount) {
            // Need to ADD slots
            const diff = capacity - currentCount;
            console.log(`Adding ${diff} slots to Floor ${floorId}`);

            // Find highest number of current slot code
            let startNum = 1;
            if (currentCount > 0) {
                // Extract number from prefix-XX
                const match = currentSlots[0].slot_code.match(/-(\d+)/);
                if (match) {
                    startNum = parseInt(match[1]) + 1;
                }
            }

            for (let i = 0; i < diff; i++) {
                const num = startNum + i;
                const slotCode = `${prefix}-${num.toString().padStart(2, '0')}`;
                
                await pool.request()
                    .input('floorId', sql.Int, floorId)
                    .input('slotCode', sql.VarChar, slotCode)
                    .input('vehicleType', sql.VarChar, floor.vehicle_type)
                    .query(`
                        INSERT INTO parking_slots (floor_id, slot_code, vehicle_type, status)
                        VALUES (@floorId, @slotCode, @vehicleType, 'available')
                    `);
            }
        } else if (capacity < currentCount) {
            // Need to REMOVE slots
            const diff = currentCount - capacity;
            console.log(`Attempting to remove ${diff} slots from Floor ${floorId}`);

            // Get available slots to delete
            const deletableSlotsRes = await pool.request()
                .input('floorId', sql.Int, floorId)
                .query(`
                    SELECT * FROM parking_slots 
                    WHERE floor_id = @floorId AND status = 'available' 
                    ORDER BY slot_code DESC
                `);

            const deletableSlots = deletableSlotsRes.recordset;
            if (deletableSlots.length < diff) {
                return res.status(400).json({ 
                    message: `Không thể giảm dung lượng xuống ${capacity}. Hiện tại chỉ có ${deletableSlots.length} ô đỗ trống có thể xóa, trong khi cần xóa ${diff} ô đỗ.` 
                });
            }

            // Delete the highest numbered available slots
            for (let i = 0; i < diff; i++) {
                const targetSlot = deletableSlots[i];
                await pool.request()
                    .input('slotId', sql.Int, targetSlot.id)
                    .query('DELETE FROM parking_slots WHERE id = @slotId');
            }
        }

        res.json({ success: true, message: `Thay đổi dung lượng tầng thành ${capacity} slot thành công` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật dung lượng' });
    }
};

// GET Pricing Rules
const getPricingRules = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM pricing_rules ORDER BY vehicle_type, pricing_period');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// UPDATE Pricing Rule
const updatePricingRule = async (req, res) => {
    try {
        const ruleId = req.params.id;
        const { hourly_rate } = req.body;

        if (hourly_rate === undefined || hourly_rate < 0) {
            return res.status(400).json({ message: 'Giá trị tiền không hợp lệ' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('ruleId', sql.Int, ruleId)
            .input('rate', sql.Decimal(10, 2), hourly_rate)
            .query('UPDATE pricing_rules SET hourly_rate = @rate WHERE id = @ruleId');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cấu hình tính giá' });
        }

        res.json({ success: true, message: 'Cập nhật giá thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// GET statistics (revenue and usage)
const getStatistics = async (req, res) => {
    try {
        const pool = await poolPromise;

        // 1. Total revenue
        const totalRevenueRes = await pool.request().query(`
            SELECT SUM(total_amount) as total 
            FROM parking_sessions 
            WHERE status = 'completed'
        `);
        const totalRevenue = totalRevenueRes.recordset[0]?.total || 0;

        // 2. Revenue by vehicle type
        const revenueByVehicleRes = await pool.request().query(`
            SELECT v.vehicle_type, SUM(ps.total_amount) as total
            FROM parking_sessions ps
            JOIN vehicles v ON ps.vehicle_id = v.id
            WHERE ps.status = 'completed'
            GROUP BY v.vehicle_type
        `);
        const revenueByVehicle = revenueByVehicleRes.recordset;

        // 3. Occupancy rates
        const slotsRes = await pool.request().query(`
            SELECT status, COUNT(*) as count 
            FROM parking_slots 
            GROUP BY status
        `);
        const slotStats = slotsRes.recordset;

        // 4. Monthly revenue (grouped by month of checkout)
        const monthlyRevenueRes = await pool.request().query(`
            SELECT FORMAT(check_out_time, 'yyyy-MM') as month, SUM(total_amount) as total
            FROM parking_sessions
            WHERE status = 'completed' AND check_out_time IS NOT NULL
            GROUP BY FORMAT(check_out_time, 'yyyy-MM')
            ORDER BY month ASC
        `);
        const monthlyRevenue = monthlyRevenueRes.recordset;

        // 5. Total counts of check-ins/check-outs and reservations
        const checkinsCountRes = await pool.request().query(`
            SELECT COUNT(*) as count FROM parking_sessions
        `);
        const checkinsCount = checkinsCountRes.recordset[0]?.count || 0;

        const reservationsCountRes = await pool.request().query(`
            SELECT COUNT(*) as count FROM reservations
        `);
        const reservationsCount = reservationsCountRes.recordset[0]?.count || 0;

        res.json({
            success: true,
            data: {
                totalRevenue,
                revenueByVehicle,
                slotStats,
                monthlyRevenue,
                checkinsCount,
                reservationsCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server khi tải thống kê' });
    }
};

module.exports = {
    getFloorCapacity,
    setFloorCapacity,
    getPricingRules,
    updatePricingRule,
    getStatistics
};

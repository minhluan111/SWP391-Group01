-- 1. Tạo Database mới
CREATE DATABASE ParkingManagementDB;
GO

USE ParkingManagementDB;
GO

-- 2. Tạo bảng Roles (Vai trò)
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- 3. Tạo bảng Users (Người dùng / Nhân viên)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BIT DEFAULT 1, 
    reset_code VARCHAR(10) NULL,
    reset_expires DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- 4. Tạo bảng User_Roles
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_user_roles_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_roles_roles FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 5. Tạo bảng Vehicles (Xe)
CREATE TABLE vehicles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL, 
    vehicle_type VARCHAR(20) NOT NULL,
    is_active BIT DEFAULT 1, -- Thêm xóa logic để tránh mất dữ liệu lịch sử đỗ xe
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_vehicle_type CHECK (vehicle_type IN ('car', 'motorbike')),
    CONSTRAINT FK_vehicles_users FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Tạo bảng Floors (Tầng đỗ xe)
CREATE TABLE floors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    floor_name NVARCHAR(50) UNIQUE NOT NULL, 
    vehicle_type VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_floors_vehicle_type CHECK (vehicle_type IN ('car', 'motorbike'))
);

-- 7. Tạo bảng Parking_Slots (Vị trí đỗ xe)
CREATE TABLE parking_slots (
    id INT IDENTITY(1,1) PRIMARY KEY,
    floor_id INT NOT NULL,
    slot_code VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_slots_vehicle_type CHECK (vehicle_type IN ('car', 'motorbike')),
    CONSTRAINT CHK_slots_status CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
    CONSTRAINT FK_parking_slots_floors FOREIGN KEY (floor_id) REFERENCES floors(id)
);

-- 8. Tạo bảng Reservations (Đặt chỗ trước)
CREATE TABLE reservations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reservation_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    slot_id INT NOT NULL,
    reservation_time DATETIME NOT NULL,         -- Giờ bắt đầu đặt
    expected_checkout_time DATETIME NOT NULL,   -- [VÁ LỖI] Giờ dự kiến rời đi để tính khoảng lấp chỗ
    grace_period_minutes INT DEFAULT 15,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_reservations_status CHECK (status IN ('pending', 'checked_in', 'expired', 'cancelled')),
    CONSTRAINT FK_reservations_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_reservations_vehicles FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT FK_reservations_slots FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
);

-- 9. Tạo bảng Parking_Sessions (Lượt đỗ xe thực tế)
CREATE TABLE parking_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id INT NOT NULL,
    slot_id INT NOT NULL,
    reservation_id INT NULL, 
    check_in_time DATETIME NOT NULL,
    check_out_time DATETIME,
    total_hours DECIMAL(5,2),
    total_amount DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    staff_in_id INT NULL,  -- [BỔ SUNG] Bảo vệ/Nhân viên cho vào
    staff_out_id INT NULL, -- [BỔ SUNG] Bảo vệ/Nhân viên cho ra
    vehicle_photo_url VARCHAR(500) NULL,
    guest_phone VARCHAR(15) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_sessions_status CHECK (status IN ('active', 'completed')),
    CONSTRAINT FK_parking_sessions_vehicles FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT FK_parking_sessions_slots FOREIGN KEY (slot_id) REFERENCES parking_slots(id),
    CONSTRAINT FK_parking_sessions_reservations FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    CONSTRAINT FK_sessions_staff_in FOREIGN KEY (staff_in_id) REFERENCES users(id),
    CONSTRAINT FK_sessions_staff_out FOREIGN KEY (staff_out_id) REFERENCES users(id)
);

-- 10. Tạo bảng Payments (Thanh toán)
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    parking_session_id INT NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_code VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    paid_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_payments_method CHECK (payment_method IN ('cash', 'online')),
    CONSTRAINT CHK_payments_status CHECK (payment_status IN ('pending', 'paid', 'failed')),
    CONSTRAINT FK_payments_sessions FOREIGN KEY (parking_session_id) REFERENCES parking_sessions(id)
);

-- 11. Tạo bảng Pricing_Rules (Bảng giá)
CREATE TABLE pricing_rules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    vehicle_type VARCHAR(20) NOT NULL,
    pricing_period VARCHAR(20) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_pricing_vehicle_type CHECK (vehicle_type IN ('car', 'motorbike')),
    CONSTRAINT CHK_pricing_period CHECK (pricing_period IN ('weekday_day', 'weekday_night', 'weekend_day', 'weekend_night'))
);
GO

----------------------------------------------------
-- DỮ LIỆU MẪU CHUẨN ĐỂ ĐỒNG BỘ KHI CODE
----------------------------------------------------
INSERT INTO roles (role_name) VALUES ('Admin'), ('Customer'), ('Staff'), ('Manager');

INSERT INTO floors (floor_name, vehicle_type) VALUES (N'Tầng 1 - Xe máy', 'motorbike'), (N'Tầng 2 - Ô tô', 'car');

-- Thêm sẵn vài Slots mẫu để test API lấy danh sách vị trí
INSERT INTO parking_slots (floor_id, slot_code, vehicle_type, status) VALUES 
(1, 'B-01', 'motorbike', 'available'),
(1, 'B-02', 'motorbike', 'available'),
(2, 'A-01', 'car', 'available'),
(2, 'A-02', 'car', 'available');

INSERT INTO pricing_rules (vehicle_type, pricing_period, hourly_rate) VALUES 
('car', 'weekday_day', 20000.00),
('car', 'weekday_night', 30000.00),
('motorbike', 'weekday_day', 5000.00),
('motorbike', 'weekday_night', 10000.00);
GO

----------------------------------------------------
-- INDEXES
----------------------------------------------------

CREATE INDEX IX_reservations_status
ON reservations(status);

CREATE INDEX IX_sessions_status
ON parking_sessions(status);

CREATE INDEX IX_slots_status
ON parking_slots(status);
GO
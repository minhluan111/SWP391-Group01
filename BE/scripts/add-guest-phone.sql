-- Thêm cột guest_phone cho walk-in (lưu SĐT khách chưa đăng ký theo từng vé)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'parking_sessions') AND name = 'guest_phone'
)
BEGIN
    ALTER TABLE parking_sessions ADD guest_phone VARCHAR(15) NULL;
END
GO

-- Cập nhật tên hiển thị guest user hệ thống (nếu đã tồn tại)
UPDATE users
SET full_name = N'Khách vãng lai'
WHERE email = 'walkin.guest@parking.local'
  AND full_name = N'Khách vãng lai (hệ thống)';
GO

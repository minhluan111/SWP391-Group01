/**
 * DEMO — Test quy tắc hủy đặt chỗ (còn < 1 giờ trước giờ vào)
 *
 * Quy tắc app: chỉ hủy được khi còn >= 1 giờ trước reservation_time (giờ vào dự kiến).
 *
 * Cách dùng:
 *   1. Mở SSMS, kết nối ĐÚNG server (xem BE/.env):
 *        Server name: 127.0.0.1,1434   (KHÔNG dùng localhost mặc định — port 1433 là instance khác!)
 *        Database:    ParkingManagementDB
 *   2. Thay 'RES-XXXXXXXX' bằng mã vé pending thật của bạn
 *   3. Chạy MỘT trong các khối bên dưới
 *   4. F5 trang Profile → mở vé → kiểm tra nút "Hủy đặt chỗ" và dòng cảnh báo
 *
 * Kiểm tra nhanh trước khi sửa:
 */
-- SELECT reservation_code, status, reservation_time, created_at
-- FROM reservations
-- WHERE reservation_code = 'RES-XXXXXXXX';

/* =============================================================================
   KỊCH BẢN A — Giả lập "CÒN < 1 GIỜ" → KHÔNG hủy được
   Đặt giờ vào = 30 phút nữa (còn dưới 1 giờ)
   ============================================================================= */
/*
UPDATE reservations
SET reservation_time = DATEADD(MINUTE, 30, GETDATE())
WHERE reservation_code = 'RES-XXXXXXXX'
  AND status = 'pending';
*/

/* =============================================================================
   KỊCH BẢN B — Giả lập "CÒN >= 1 GIỜ" → Hủy được
   Đặt giờ vào = 2 giờ nữa
   ============================================================================= */
/*
UPDATE reservations
SET reservation_time = DATEADD(HOUR, 2, GETDATE())
WHERE reservation_code = 'RES-XXXXXXXX'
  AND status = 'pending';
*/

/* =============================================================================
   KỊCH BẢN C — Sát mốc 1 giờ (biên)
   Giờ vào = đúng 61 phút nữa → vẫn hủy được (còn 1h01p)
   ============================================================================= */
/*
UPDATE reservations
SET reservation_time = DATEADD(MINUTE, 61, GETDATE())
WHERE reservation_code = 'RES-XXXXXXXX'
  AND status = 'pending';
*/

/* =============================================================================
   KỊCH BẢN D — Sát mốc 1 giờ (biên) — KHÔNG hủy được
   Giờ vào = 59 phút nữa → còn dưới 1 giờ
   ============================================================================= */
/*
UPDATE reservations
SET reservation_time = DATEADD(MINUTE, 59, GETDATE())
WHERE reservation_code = 'RES-XXXXXXXX'
  AND status = 'pending';
*/

/* =============================================================================
   KHÔI PHỤC — Trả giờ vào về giá trị demo cũ (tuỳ chỉnh ngày/giờ)
   ============================================================================= */
/*
UPDATE reservations
SET reservation_time = '2026-06-30 02:00:00'
WHERE reservation_code = 'RES-XXXXXXXX'
  AND status = 'pending';
*/

/* =============================================================================
   XEM KẾT QUẢ SAU KHI SỬA
   ============================================================================= */
/*
SELECT
    reservation_code,
    status,
    reservation_time AS gio_vao_du_kien,
    DATEADD(HOUR, -1, reservation_time) AS het_han_huy_mien_phi,
    DATEDIFF(MINUTE, GETDATE(), reservation_time) AS con_phut_truoc_gio_vao,
    CASE
        WHEN status <> 'pending' THEN N'Không áp dụng (không còn pending)'
        WHEN DATEDIFF(MINUTE, GETDATE(), reservation_time) < 60 THEN N'KHÔNG hủy được (< 1 giờ)'
        ELSE N'Hủy được'
    END AS ket_qua_demo
FROM reservations
WHERE reservation_code = 'RES-XXXXXXXX';
*/

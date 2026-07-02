const LICENSE_PLATE_REGEX = /^[0-9]{2}[A-Z]{1,2}[0-9]?-(?:[0-9]{4,5}|[0-9]{3}\.[0-9]{2})$/;
const VIETNAMESE_PHONE_REGEX = /^(0)(3|5|7|8|9)[0-9]{8}$/;
const WALK_IN_TOLERANCE_MS = 5 * 60 * 1000;
const WALK_IN_MAX_FUTURE_MS = 24 * 60 * 60 * 1000;

function normalizeLicensePlate(plate) {
    return plate.trim().toUpperCase().replace(/\s+/g, '');
}

function validateLicensePlate(plate) {
    const normalized = normalizeLicensePlate(plate);
    if (!normalized) {
        return 'Vui lòng nhập biển số xe';
    }
    if (!LICENSE_PLATE_REGEX.test(normalized)) {
        return 'Biển số không đúng định dạng (VD: 59X-12345, 51F-1234 hoặc 29A-123.45)';
    }
    return null;
}

function validateOptionalPhone(phone) {
    const trimmed = (phone || '').trim();
    if (!trimmed) return null;
    if (!VIETNAMESE_PHONE_REGEX.test(trimmed)) {
        return 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }
    return null;
}

function validateWalkInCheckInTime(checkInTime) {
    const t = checkInTime.getTime();
    if (isNaN(t)) {
        return 'Thời gian check-in không hợp lệ.';
    }
    const now = Date.now();
    if (t < now - WALK_IN_TOLERANCE_MS) {
        return 'Giờ vào bãi không được quá 5 phút trong quá khứ. Vui lòng chọn thời điểm hiện tại hoặc gần hiện tại.';
    }
    if (t > now + WALK_IN_MAX_FUTURE_MS) {
        return 'Giờ vào bãi không được quá 24 giờ trong tương lai.';
    }
    return null;
}

module.exports = {
    LICENSE_PLATE_REGEX,
    VIETNAMESE_PHONE_REGEX,
    WALK_IN_TOLERANCE_MS,
    WALK_IN_MAX_FUTURE_MS,
    normalizeLicensePlate,
    validateLicensePlate,
    validateOptionalPhone,
    validateWalkInCheckInTime,
};

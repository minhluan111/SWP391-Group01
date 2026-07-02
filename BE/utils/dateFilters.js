const VN_IANA = 'Asia/Ho_Chi_Minh';

function parseLocalDateParam(value) {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    const [y, m, d] = trimmed.split('-').map(Number);
    const probe = new Date(y, m - 1, d);
    if (
        probe.getFullYear() !== y
        || probe.getMonth() !== m - 1
        || probe.getDate() !== d
    ) {
        return null;
    }
    return trimmed;
}

/** Ngày hiện tại theo múi giờ Việt Nam (YYYY-MM-DD) */
function getVnLocalDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: VN_IANA }).format(date);
}

/** Biên ngày theo giờ VN: 00:00:00.000 – 23:59:59.999 */
function getVnDayBounds(localDate) {
    const dayStart = new Date(`${localDate}T00:00:00+07:00`);
    const dayEnd = new Date(`${localDate}T23:59:59.999+07:00`);
    return { dayStart, dayEnd };
}

/**
 * Lọc "hôm nay": khoảng thời gian ngày VN (A) + local_date từ FE (B).
 * So sánh trực tiếp DATETIME, không dùng AT TIME ZONE.
 */
function buildTodayFilter(localDateInput) {
    const localDate = parseLocalDateParam(localDateInput) || getVnLocalDateString();

    return {
        sql: `AND (
            (ps.check_in_time >= @day_start AND ps.check_in_time <= @day_end)
            OR (ps.check_out_time IS NOT NULL AND ps.check_out_time >= @day_start AND ps.check_out_time <= @day_end)
        )`,
        localDate,
    };
}

function applyTodayRangeInput(request, sql, localDate) {
    if (!localDate) return request;
    const { dayStart, dayEnd } = getVnDayBounds(localDate);
    return request
        .input('day_start', sql.DateTime, dayStart)
        .input('day_end', sql.DateTime, dayEnd)
        .input('local_date', sql.VarChar, localDate);
}

module.exports = {
    VN_IANA,
    parseLocalDateParam,
    getVnLocalDateString,
    getVnDayBounds,
    buildTodayFilter,
    applyTodayRangeInput,
};

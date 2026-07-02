const { GUEST_EMAIL } = require('./guestUser');

const GUEST_PHONE_PLACEHOLDER = 'xxxx.xxx.xxx';

function isGuestOwnerEmail(email) {
    return !email || email === GUEST_EMAIL;
}

function resolveCustomerType({ owner_email, guest_phone, reservation_id }) {
    if (!isGuestOwnerEmail(owner_email) || reservation_id) {
        return 'account';
    }
    if (guest_phone && String(guest_phone).trim()) {
        return 'unregistered';
    }
    return 'walkin';
}

function formatCustomerName({ owner_email, guest_phone, reservation_id, customer_name }) {
    const type = resolveCustomerType({ owner_email, guest_phone, reservation_id });
    if (type === 'account') {
        return customer_name || 'Khách có tài khoản';
    }
    if (type === 'unregistered') {
        return 'Khách chưa đăng ký';
    }
    return 'Khách vãng lai';
}

function formatCustomerPhone({ owner_email, guest_phone, reservation_id, customer_phone }) {
    const type = resolveCustomerType({ owner_email, guest_phone, reservation_id });
    if (type === 'unregistered') {
        return String(guest_phone).trim();
    }
    if (type === 'account') {
        const phone = (customer_phone || '').trim();
        if (!phone || phone === '0000000000') {
            return GUEST_PHONE_PLACEHOLDER;
        }
        return phone;
    }
    return GUEST_PHONE_PLACEHOLDER;
}

function buildCustomerDisplayFields(row) {
    const customer_type = resolveCustomerType({
        owner_email: row.owner_email ?? row.customer_email,
        guest_phone: row.guest_phone,
        reservation_id: row.reservation_id,
    });
    return {
        customer_type,
        customer_display_name: formatCustomerName({
            owner_email: row.owner_email ?? row.customer_email,
            guest_phone: row.guest_phone,
            reservation_id: row.reservation_id,
            customer_name: row.customer_name,
        }),
        customer_display_phone: formatCustomerPhone({
            owner_email: row.owner_email ?? row.customer_email,
            guest_phone: row.guest_phone,
            reservation_id: row.reservation_id,
            customer_phone: row.customer_phone,
        }),
    };
}

function getCustomerTypeSqlFilter(customerType, guestEmailParam = '@guest_email') {
    if (!customerType || customerType === 'all') return '';

    if (customerType === 'walkin') {
        return `AND u_owner.email = ${guestEmailParam}
            AND ps.reservation_id IS NULL
            AND (ps.guest_phone IS NULL OR LTRIM(RTRIM(ps.guest_phone)) = '')`;
    }
    if (customerType === 'unregistered') {
        return `AND u_owner.email = ${guestEmailParam}
            AND ps.reservation_id IS NULL
            AND ps.guest_phone IS NOT NULL
            AND LTRIM(RTRIM(ps.guest_phone)) <> ''`;
    }
    if (customerType === 'account') {
        return `AND (u_owner.email <> ${guestEmailParam} OR ps.reservation_id IS NOT NULL)`;
    }
    return '';
}

module.exports = {
    GUEST_PHONE_PLACEHOLDER,
    isGuestOwnerEmail,
    resolveCustomerType,
    formatCustomerName,
    formatCustomerPhone,
    buildCustomerDisplayFields,
    getCustomerTypeSqlFilter,
};

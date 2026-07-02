export const GUEST_EMAIL = 'walkin.guest@parking.local';
export const GUEST_PHONE_PLACEHOLDER = 'xxxx.xxx.xxx';

export type CustomerType = 'account' | 'walkin' | 'unregistered';

export interface CustomerSessionLike {
  customer_email?: string | null;
  owner_email?: string | null;
  guest_phone?: string | null;
  reservation_id?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_type?: CustomerType;
  customer_display_name?: string;
  customer_display_phone?: string;
}

function getOwnerEmail(session: CustomerSessionLike): string | undefined {
  return session.owner_email ?? session.customer_email ?? undefined;
}

export function resolveCustomerType(session: CustomerSessionLike): CustomerType {
  if (session.customer_type) return session.customer_type;
  const ownerEmail = getOwnerEmail(session);
  if (ownerEmail && ownerEmail !== GUEST_EMAIL) return 'account';
  if (session.reservation_id) return 'account';
  if (session.guest_phone?.trim()) return 'unregistered';
  return 'walkin';
}

export function formatCustomerName(session: CustomerSessionLike): string {
  if (session.customer_display_name) return session.customer_display_name;
  const type = resolveCustomerType(session);
  if (type === 'account') return session.customer_name || 'Khách có tài khoản';
  if (type === 'unregistered') return 'Khách chưa đăng ký';
  return 'Khách vãng lai';
}

export function formatCustomerPhone(session: CustomerSessionLike): string {
  if (session.customer_display_phone) return session.customer_display_phone;
  const type = resolveCustomerType(session);
  if (type === 'unregistered') return session.guest_phone!.trim();
  if (type === 'account') {
    const phone = (session.customer_phone || '').trim();
    if (!phone || phone === '0000000000') return GUEST_PHONE_PLACEHOLDER;
    return phone;
  }
  return GUEST_PHONE_PLACEHOLDER;
}

export function getCustomerTypeLabel(type: CustomerType): string {
  if (type === 'account') return 'Có tài khoản';
  if (type === 'unregistered') return 'Chưa đăng ký';
  return 'Vãng lai';
}

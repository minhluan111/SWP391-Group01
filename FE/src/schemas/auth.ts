import { z } from 'zod';
import { LICENSE_PLATE_REGEX, VIETNAMESE_PHONE_REGEX } from '../lib/validation';

const vietnamesePhoneRegex = VIETNAMESE_PHONE_REGEX;
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Vui lòng nhập họ và tên')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được quá 100 ký tự'),
    phone: z.string().optional(),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Email không đúng định dạng'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirm_password: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirm_password'],
  })
  .refine((data) => !data.phone || data.phone === '' || vietnamesePhoneRegex.test(data.phone), {
    message: 'Số điện thoại không hợp lệ (VD: 0912345678)',
    path: ['phone'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const profileSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Vui lòng nhập họ và tên')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được quá 100 ký tự'),
    phone: z.string().optional(),
  })
  .refine((data) => !data.phone || data.phone === '' || vietnamesePhoneRegex.test(data.phone), {
    message: 'Số điện thoại không hợp lệ (VD: 0912345678)',
    path: ['phone'],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    new_password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .min(6, 'Mật khẩu mới phải từ 6 ký tự trở lên'),
    confirm_new_password: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_new_password'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Biển số VN: VD 51F-12345 (4-5 số), 29A-123.45 (dạng có dấu chấm)
const licensePlateRegex = LICENSE_PLATE_REGEX;
export const vehicleSchema = z.object({
  license_plate: z
    .string()
    .min(1, 'Vui lòng nhập biển số xe')
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => licensePlateRegex.test(val), {
      message: 'Biển số không đúng định dạng (VD: 59X-12345, 51F-1234 hoặc 29A-123.45)',
    }),
  vehicle_type: z.enum(['car', 'motorbike']),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

export const forgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),
});

export type ForgotPasswordRequestData = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Vui lòng nhập mã OTP')
      .length(6, 'Mã OTP phải có đúng 6 ký tự'),
    new_password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirm_password: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirm_password'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

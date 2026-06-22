import { z } from 'zod';

const vietnamesePhoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;

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

export const vehicleSchema = z.object({
  license_plate: z
    .string()
    .min(1, 'Vui lòng nhập biển số xe')
    .min(4, 'Biển số xe không hợp lệ')
    .max(20, 'Biển số xe quá dài'),
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

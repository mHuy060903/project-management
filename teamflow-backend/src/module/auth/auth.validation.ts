import { z } from 'zod';

export const registerSchema = z.object({
  tenantName: z.string().min(3, 'Tên tổ chức phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có chữ hoa, chữ thường và số'),
});

export const loginSchema = z.object({
  tenantSlug: z.string().min(1, 'Thiếu tenant slug'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Thiếu mật khẩu'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Thiếu refresh token'),
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
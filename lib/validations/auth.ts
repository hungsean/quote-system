import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, '電子郵件為必填')
    .email('請輸入有效的電子郵件'),
  password: z
    .string()
    .min(8, '密碼至少需要 8 個字元')
    .regex(/[A-Z]/, '密碼必須包含至少一個大寫字母')
    .regex(/[a-z]/, '密碼必須包含至少一個小寫字母')
    .regex(/[0-9]/, '密碼必須包含至少一個數字'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '電子郵件為必填')
    .email('請輸入有效的電子郵件'),
  password: z.string().min(1, '密碼為必填'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

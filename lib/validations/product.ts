import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, '商品名稱為必填').max(255),
  description: z.string().min(1, '商品描述為必填').max(2000),
  category: z.string().min(1, '商品類別為必填').max(100),
  unit_price: z.number().positive('單價必須大於 0').finite(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

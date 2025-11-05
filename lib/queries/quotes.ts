import { pool } from '@/lib/db'
import type { Quote, QuoteWithProduct } from '@/lib/types'

export async function getByUser(userId: string): Promise<QuoteWithProduct[]> {
  const result = await pool.query<QuoteWithProduct>(
    `SELECT
      q.*,
      json_build_object(
        'id', p.id,
        'user_id', p.user_id,
        'name', p.name,
        'description', p.description,
        'category', p.category,
        'unit_price', p.unit_price,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      ) as product
     FROM quotes q
     JOIN products p ON p.id = q.product_id
     WHERE q.user_id = $1
     ORDER BY q.created_at DESC`,
    [userId]
  )
  return result.rows
}

export async function create(data: {
  userId: string
  productId: string
  quantity: number
  quoteValue: number
}): Promise<Quote> {
  const result = await pool.query<Quote>(
    `INSERT INTO quotes (user_id, product_id, quantity, quote_value)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.userId, data.productId, data.quantity, data.quoteValue]
  )
  return result.rows[0]
}

export async function getById(id: string, userId: string): Promise<QuoteWithProduct | null> {
  const result = await pool.query<QuoteWithProduct>(
    `SELECT
      q.*,
      json_build_object(
        'id', p.id,
        'user_id', p.user_id,
        'name', p.name,
        'description', p.description,
        'category', p.category,
        'unit_price', p.unit_price,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      ) as product
     FROM quotes q
     JOIN products p ON p.id = q.product_id
     WHERE q.id = $1 AND q.user_id = $2`,
    [id, userId]
  )
  return result.rows[0] || null
}

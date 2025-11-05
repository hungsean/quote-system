import { pool } from '@/lib/db'
import type { Product } from '@/lib/types'

export async function getByUser(userId: string): Promise<Product[]> {
  const result = await pool.query<Product>(
    'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows
}

export async function create(data: {
  userId: string
  name: string
  description: string
  category: string
  unitPrice: number
}): Promise<Product> {
  const result = await pool.query<Product>(
    `INSERT INTO products (user_id, name, description, category, unit_price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.userId, data.name, data.description, data.category, data.unitPrice]
  )
  return result.rows[0]
}

export async function getById(id: string, userId: string): Promise<Product | null> {
  const result = await pool.query<Product>(
    'SELECT * FROM products WHERE id = $1 AND user_id = $2',
    [id, userId]
  )
  return result.rows[0] || null
}

export async function deleteProduct(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  )
  return result.rowCount !== null && result.rowCount > 0
}

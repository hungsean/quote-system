import { pool } from '@/lib/db'
import type { User } from '@/lib/types'

export async function getByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0] || null
}

export async function create(email: string, passwordHash: string): Promise<User> {
  const result = await pool.query<User>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, passwordHash]
  )
  return result.rows[0]
}

export async function getById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

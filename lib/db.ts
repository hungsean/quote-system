import { Pool, PoolConfig } from 'pg'

// 使用單例模式確保全域只有一個連線池
declare global {
  var pgPool: Pool | undefined
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,                      // 最大連線數
  idleTimeoutMillis: 30000,     // 閒置連線超時時間
  connectionTimeoutMillis: 2000, // 連線超時時間
}

export const pool = global.pgPool || new Pool(poolConfig)

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool
}

// 優雅關閉
process.on('SIGTERM', async () => {
  await pool.end()
})

// 資料庫健康檢查
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

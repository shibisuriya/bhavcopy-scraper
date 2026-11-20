import { runMigrations } from 'bullmq'

import { pool } from '@/kysely/pool'

const client = await pool.connect()

try {
    await runMigrations(client)
} finally {
    client.release()
    await pool.end()
}

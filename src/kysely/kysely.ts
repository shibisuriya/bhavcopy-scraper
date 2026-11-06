import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

import type { DB } from './types'

const dialect = new PostgresDialect({
    pool: new Pool({
        database: 'bhavcopy',
        host: 'localhost',
        user: 'user',
        port: 5434,
        max: 10
    })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
const kysely = new Kysely<DB>({
    dialect
})

export { kysely }

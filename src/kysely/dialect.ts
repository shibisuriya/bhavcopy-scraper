import { Pool } from 'pg'
import { PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
    pool: new Pool({
        database: 'bhavcopy',
        host: 'localhost',
        user: 'user',
        password: 'password',
        port: 5434,
        max: 10
    })
})

export { dialect }

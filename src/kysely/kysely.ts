import { Kysely } from 'kysely'

import type { DB } from './types'
import { dialect } from './dialect'

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
const kysely = new Kysely<DB>({
    dialect
})

export { kysely }

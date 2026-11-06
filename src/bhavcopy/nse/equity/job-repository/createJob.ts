import { Effect } from 'effect'

import type { JobType } from '@/bhavcopy/types'
import { kysely } from '@/kysely'

const createJob = (date: Date, type: JobType) =>
    Effect.tryPromise({
        try: () => kysely.selectFrom('').execute(),
        catch: (err) => new UnknownException()
    })

export { createJob }

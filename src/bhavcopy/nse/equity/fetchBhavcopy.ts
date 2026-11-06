import { UnknownException } from 'effect/Cause'
import { Effect } from 'effect'
import axios from 'axios'
import { parse } from 'csv-parse/sync'

import { bhavcopySchema } from './schemas'

const fetchBhavcopy = (dateString: string) =>
    Effect.gen(function* () {
        const date = yield* Effect.trycatch({
            try: () => dateSchema.parse(dateString),
            error: (err) => new UnknownException(err)
        })

        const url = `https://archives.nseindia.com/products/content/sec_bhavdata_full_${dateString.replaceAll('-', '')}.csv`

        const { data } = yield* Effect.promise(() => axios.get(url))

        const bhavcopy = parse(data, {
            columns: true,
            skip_empty_lines: true,
            rtrim: true,
            ltrim: true
        })

        return bhavcopySchema.parse(bhavcopy, { reportInput: true })
    })

export { fetchBhavcopy }

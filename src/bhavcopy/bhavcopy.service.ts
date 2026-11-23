import { Effect } from 'effect'
import { eachDayOfInterval, format } from 'date-fns'

import { queue } from './queue'
import type { Exchange, MarketSegment } from '@/types'
import { UnsupportedExchange, UnsupportedMarketSegment } from '@/errors'

const enqueueScrapeJobs = (dates: Date[]) =>
    Effect.gen(function* () {
        return yield* Effect.tryPromise({
            try: () =>
                queue.addBulk(
                    dates.map((date) => {
                        return {
                            name: format(date, 'dd-MM-yyyy'),
                            data: { date: format(date, 'dd-MM-yyyy') },
                            opts: {
                                jobId: format(date, 'dd-MM-yyyy')
                            }
                        }
                    })
                ),
            catch: (err) => err
        })
    })

type CreateScrapeJobsParams = {
    marketSegment?: MarketSegment
    exchange?: Exchange
    date?: Date
}

const createScrapeJobs = (params: CreateScrapeJobsParams) =>
    Effect.gen(function* () {
        const { marketSegment, exchange, date } = params

        if (exchange !== 'NSE') return yield* new UnsupportedExchange()

        if (marketSegment !== 'EQUITIES')
            return yield* new UnsupportedMarketSegment()

        if (exchange === 'NSE' && marketSegment === 'EQUITIES') {
            if (date === undefined) {
                const dates = eachDayOfInterval({
                    start: new Date(2019, 1, 1),
                    end: new Date()
                })

                yield* enqueueScrapeJobs(dates)
            } else {
                yield* enqueueScrapeJobs([date])
            }
        }
    })

const bhavcopyService = { createScrapeJobs }

export { bhavcopyService }

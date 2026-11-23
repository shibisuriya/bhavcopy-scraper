import { Effect, Schema } from 'effect'
import express from 'express'

import { candleRouter } from './candle/candle.router'
import { exchangeSchema, marketSegmentSchema } from '@/schemas'
import { bhavcopyService } from './bhavcopy.service'

const bhavcopyRouter: express.Router = express.Router()

bhavcopyRouter.use('/candles', candleRouter)

bhavcopyRouter.post('/scrape', async (req, res) => {
    const program = Effect.gen(function* () {
        const parsedRequestBody = yield* Schema.decodeEffect(
            Schema.Struct({
                exchange: Schema.optionalKey(exchangeSchema),
                marketSegment: Schema.optionalKey(marketSegmentSchema),
                date: Schema.optionalKey(Schema.DateFromString)
            })
        )(req.body)

        yield* bhavcopyService.createScrapeJobs(parsedRequestBody)

        return {
            statusCode: 200,
            responseBody: { message: 'Added job to queue' }
        }
    }).pipe(
        Effect.catch((err) => {
            return Effect.succeed({
                statusCode: 500,
                responseBody: { error: err }
            })
        })
    )

    const { statusCode, responseBody } = await Effect.runPromise(program)

    return res.status(statusCode).json(responseBody)
})

export { bhavcopyRouter }

import express from 'express'
import { AxiosError } from 'axios'
import * as z from 'zod'
import { parse, subDays } from 'date-fns'
import type { Router } from 'express'

import { exchangeSchema } from '@anahata/shared/schema'

import { kysely } from '@/kysely/kysely'
import { fetchBhavcopy } from './nse/equity/fetchBhavcopy'
import { AlreadyExist, DateMismatch } from './errors'
import { Effect } from 'effect'

const bhavcopyRouter: Router = express.Router()

const segmentSchema = z.literal(['equities', 'derivatives'])

bhavcopyRouter.post('/nse/equities/:date/download', (req, res) => {
    const program = Effect.gen(function* () {
        const date: Date = Effect.try({
            try: () => req.path.date,
            catch: (err) => new ValidationFailedExeption()
        })

        yield* fetchBhavcopy(date)
    })

    Effect.runPromise(program)

    return res.json({ message: 'initiated' })
})

bhavcopyRouter.post('/nse/equity/download', (req, res) => {})

bhavcopyRouter.delete('/errors/:exchange/:segment', async (req, res) => {
    const { exchange, segment } = z
        .strictObject({
            exchange: exchangeSchema,
            segment: segmentSchema
        })
        .parse(req.params)
    const { date } = z
        .strictObject({
            date: z.date()
        })
        .parse({ ...req.body, date: new Date(req.body.date) })

    if (exchange === 'NSE' && segment === 'equities') {
        await kysely
            .deleteFrom('nseEquityBhavcopyErrors')
            .where('date', '=', date)
            .executeTakeFirst()
        res.json({ success: 'ok' })
    } else {
        res.json({
            message: `Exchange '${exchange}' & segment '${segment}' not supported yet.`
        })
    }
})

bhavcopyRouter.get('/errors/:exchange/:segment', async (req, res) => {
    const { exchange, segment } = z
        .strictObject({
            exchange: exchangeSchema,
            segment: segmentSchema
        })
        .parse(req.params)

    if (exchange === 'NSE' && segment === 'equities') {
        const errors = await kysely
            .selectFrom('nseEquityBhavcopyErrors')
            .selectAll()
            .execute()
        res.json(errors)
    } else {
        res.json({
            message: `Exchange ${exchange} & segment ${segment} not supported`
        })
    }
})

bhavcopyRouter.post('/:exchange/:date', async (req, res) => {
    console.log(req.params)
    const { date: date1 } = z
        .strictObject({
            exchange: z.string(),
            date: z.string()
        })
        .parse(req.params)
    try {
        const date4 = parse(date1, 'dd-mm-yyyy', new Date())
        const data = await kysely
            .selectFrom('nseEquityBhavcopies')
            .select('date')
            .where('date', '=', date4)
            .limit(1)
            .executeTakeFirst()
        if (data && date4.getDate() === data.date.getDate()) {
            throw new AlreadyExist(date4)
        }
        const bhavcopy = await fetchEquitiesBhavcopyFromNse(date1)
        const date2 = parse(bhavcopy[0].date, 'dd-MMM-yyyy', new Date())
        if (date2.getDate() !== date4.getDate()) {
            throw new DateMismatch({
                dateInRequest: date4,
                datesInBhavcopy: date2
            })
        }
        const trx = await kysely.startTransaction().execute()
        const data3 = await trx
            .insertInto('nseEquityBhavcopies')
            .values(bhavcopy)
            .returningAll()
            .execute()
        await trx
            .deleteFrom('nseEquityBhavcopyErrors')
            .where('date', '=', date4)
            .execute()
        await trx.commit().execute()
        res.status(200).json(data3)
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.code === 'ENOTFOUND') {
                // Can't connect to the internet.
            } else {
                const date = parse(date1, 'dd-mm-yyyy', new Date())
                const trx = await kysely.startTransaction().execute()
                await trx
                    .deleteFrom('nseEquityBhavcopyErrors')
                    .where('date', '=', date)
                    .execute()
                await trx
                    .insertInto('nseEquityBhavcopyErrors')
                    .values({
                        date: date,
                        percievedReason: 'not_found',
                        actualReason: err.message
                    })
                    .execute()
                await trx.commit().execute()
                res.status(500).json({ message: err.message })
            }
        } else if (err instanceof DateMismatch) {
            const trx = await kysely.startTransaction().execute()
            await trx
                .deleteFrom('nseEquityBhavcopyErrors')
                .where('date', '=', err.dateInRequest)
                .execute()
            await trx
                .insertInto('nseEquityBhavcopyErrors')
                .values({
                    date: err.dateInRequest,
                    percievedReason: 'date_mismatch',
                    actualReason: err.message
                })
                .execute()
            await trx.commit().execute()
            res.status(200).json({ message: err.message })
        } else if (err instanceof AlreadyExist) {
            res.status(200).json({
                message: err.message
            })
        }
    }
})

export { bhavcopyRouter }

import * as z from 'zod'

const priceSchema = z.preprocess(
    (val, ctx) => {
        if (val === '') return null

        try {
            const parsed = Number.parseFloat(String(val))
            return parsed
        } catch (e) {
            ctx.issues.push({
                code: 'custom',
                message: 'Not a number',
                input: val
            })
            return z.NEVER
        }
    },
    z
        .number()
        .nullable()
        .refine((price) => (price ? price >= 0 : true), {
            error: 'Price must be >= 0 or null'
        })
)

const bhavcopyRowSchema = z
    .strictObject({
        SYMBOL: z.string(),
        SERIES: z.string(),
        DATE1: z.string(),
        PREV_CLOSE: priceSchema,
        OPEN_PRICE: priceSchema,
        HIGH_PRICE: priceSchema,
        LOW_PRICE: priceSchema,
        LAST_PRICE: priceSchema,
        CLOSE_PRICE: priceSchema,
        AVG_PRICE: priceSchema,
        TTL_TRD_QNTY: z.preprocess(
            (val) => Number(val),
            z.int().refine((val) => val >= 0)
        ),
        TURNOVER_LACS: z.preprocess(
            (val) => Number(val),
            z.number().refine((val) => val >= 0)
        ),
        NO_OF_TRADES: z.preprocess(
            (val) => Number(val),
            z.int().refine((val) => val >= 0)
        ),
        DELIV_QTY: z.preprocess(
            (val) => {
                if (val === '-') return null
                return Number(val)
            },
            z
                .int()
                .nullable()
                .refine((val) => {
                    return val ? val >= 0 : true
                })
        ),
        DELIV_PER: z.preprocess(
            (val) => {
                if (val === '-') return null
                return Number(val)
            },
            z
                .number()
                .nullable()
                .refine((val) => {
                    return val ? val >= 0 : true
                })
        )
    })
    .refine(
        ({ DELIV_PER: deliveryPercentage, DELIV_QTY: deliveryQuantity }) => {
            if (deliveryPercentage === null) {
                return deliveryQuantity === null
            }

            if (deliveryPercentage === 0) {
                return deliveryQuantity === 0
            }

            return true
        }
    )
    .transform((bhavcopyRow) => {
        const {
            SYMBOL: symbol,
            SERIES: series,
            DATE1: date,
            LAST_PRICE: lastPrice,
            PREV_CLOSE: prevClose,
            OPEN_PRICE: openPrice,
            HIGH_PRICE: highPrice,
            LOW_PRICE: lowPrice,
            CLOSE_PRICE: closePrice,
            AVG_PRICE: averagePrice,
            TTL_TRD_QNTY: totalTradedQuantity,
            TURNOVER_LACS: turnoverInLakhs,
            NO_OF_TRADES: numberOfTrades,
            DELIV_QTY: deliveryQuantity,
            DELIV_PER: deliveryPercentage
        } = bhavcopyRow

        return {
            symbol,
            series,
            date,
            lastPrice,
            prevClose: prevClose!,
            openPrice: openPrice!,
            highPrice: highPrice!,
            lowPrice: lowPrice!,
            closePrice: closePrice!,
            averagePrice: averagePrice!,
            totalTradedQuantity,
            turnoverInLakhs,
            numberOfTrades,
            deliveryQuantity,
            deliveryPercentage
        }
    })

const bhavcopySchema = z.array(bhavcopyRowSchema)

export { bhavcopySchema, bhavcopyRowSchema, priceSchema }

import { priceSchema } from './schemas.js'

test('Negative price', () => {
    expect(priceSchema.parse('-1')).toThrow()
})

test('Positive price', () => {})

test('Price is 0', () => {})

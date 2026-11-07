import express from 'express'

// import { bhavcopyRouter } from '@/bhavcopy/bhavcopy.router'

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())

// app.use('/bhavcopies', bhavcopyRouter)

app.get('/healthy', (req, res) => {
    res.json({ status: 'ok', server: 'Vite-powered Express' })
})

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`)
})

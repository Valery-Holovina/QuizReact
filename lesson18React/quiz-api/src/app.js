//npm create vite@latest quiz-web-student -- --template react


import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { initializeDatabase } from './db/init.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { openApiDocument } from './openapi.js'
import { quizzesRouter } from './routes/quizzes.js'
import { resultsRouter } from './routes/results.js'
import { topicsRouter } from './routes/topics.js'

initializeDatabase()

export const app = express()

app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.get('/', (req, res) => {
  res.json({ name: 'Quiz API', version: '1.0.0', documentation: '/api-docs' })
})
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'sqlite', timestamp: new Date().toISOString() })
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: 'Quiz API Docs' }))
app.use('/api/topics', topicsRouter)
app.use('/api/quizzes', quizzesRouter)
app.use('/api/results', resultsRouter)
app.use(notFound)
app.use(errorHandler)

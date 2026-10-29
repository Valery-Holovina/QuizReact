import { Router } from 'express'
import { db } from '../db/database.js'

export const topicsRouter = Router()

topicsRouter.get('/', (req, res) => {
  const topics = db.prepare(`
    SELECT t.*, COUNT(q.id) AS quizCount
    FROM topics t
    LEFT JOIN quizzes q ON q.topic_id = t.id
    GROUP BY t.id
    ORDER BY t.id
  `).all()
  res.json(topics)
})

topicsRouter.get('/:topicId/quizzes', (req, res) => {
  const topicId = Number(req.params.topicId)
  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId)
  if (!topic) return res.status(404).json({ message: 'Topic was not found' })

  const quizzes = db.prepare(`
    SELECT q.*, COUNT(questions.id) AS questionCount,
           COALESCE(SUM(questions.points), 0) AS maxScore
    FROM quizzes q
    LEFT JOIN questions ON questions.quiz_id = q.id
    WHERE q.topic_id = ?
    GROUP BY q.id
    ORDER BY q.id
  `).all(topicId)

  res.json({ topic, quizzes })
})

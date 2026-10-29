import { Router } from 'express'
import { db } from '../db/database.js'

export const resultsRouter = Router()

resultsRouter.get('/', (req, res) => {
  const requestedLimit = Number(req.query.limit) || 20
  const limit = Math.min(Math.max(requestedLimit, 1), 100)
  const quizId = req.query.quizId ? Number(req.query.quizId) : null

  const rows = quizId
    ? db.prepare(`
        SELECT a.id, a.user_name AS userName, a.correct_answers AS correctAnswers,
               a.total_questions AS totalQuestions, a.score, a.max_score AS maxScore,
               ROUND(a.score * 100.0 / a.max_score) AS percentage,
               a.completed_at AS completedAt, q.id AS quizId, q.title AS quizTitle,
               t.title AS topicTitle
        FROM attempts a
        JOIN quizzes q ON q.id = a.quiz_id
        JOIN topics t ON t.id = q.topic_id
        WHERE a.quiz_id = ?
        ORDER BY percentage DESC, a.correct_answers DESC, a.completed_at ASC
        LIMIT ?
      `).all(quizId, limit)
    : db.prepare(`
        SELECT a.id, a.user_name AS userName, a.correct_answers AS correctAnswers,
               a.total_questions AS totalQuestions, a.score, a.max_score AS maxScore,
               ROUND(a.score * 100.0 / a.max_score) AS percentage,
               a.completed_at AS completedAt, q.id AS quizId, q.title AS quizTitle,
               t.title AS topicTitle
        FROM attempts a
        JOIN quizzes q ON q.id = a.quiz_id
        JOIN topics t ON t.id = q.topic_id
        ORDER BY a.completed_at DESC
        LIMIT ?
      `).all(limit)

  res.json(rows)
})

resultsRouter.get('/:attemptId', (req, res) => {
  const attempt = db.prepare(`
    SELECT a.id, a.user_name AS userName, a.correct_answers AS correctAnswers,
           a.total_questions AS totalQuestions, a.score, a.max_score AS maxScore,
           ROUND(a.score * 100.0 / a.max_score) AS percentage,
           a.completed_at AS completedAt, q.id AS quizId, q.title AS quizTitle,
           t.title AS topicTitle
    FROM attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    JOIN topics t ON t.id = q.topic_id
    WHERE a.id = ?
  `).get(Number(req.params.attemptId))

  if (!attempt) return res.status(404).json({ message: 'Attempt was not found' })

  const answers = db.prepare(`
    SELECT q.text AS question, selected.text AS selectedAnswer,
           correct.text AS correctAnswer, aa.is_correct AS isCorrect,
           aa.points_awarded AS pointsAwarded, q.points AS pointsAvailable,
           q.explanation
    FROM attempt_answers aa
    JOIN questions q ON q.id = aa.question_id
    JOIN answers selected ON selected.id = aa.answer_id
    JOIN answers correct ON correct.question_id = q.id AND correct.is_correct = 1
    WHERE aa.attempt_id = ?
    ORDER BY q.position
  `).all(attempt.id).map((item) => ({ ...item, isCorrect: Boolean(item.isCorrect) }))

  res.json({ ...attempt, answers })
})

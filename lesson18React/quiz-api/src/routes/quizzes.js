import { Router } from 'express'
import { db } from '../db/database.js'

export const quizzesRouter = Router()

function getQuiz(quizId) {
  return db.prepare(`
    SELECT q.*, t.title AS topicTitle, t.color AS topicColor
    FROM quizzes q
    JOIN topics t ON t.id = q.topic_id
    WHERE q.id = ?
  `).get(quizId)
}

quizzesRouter.get('/:quizId', (req, res) => {
  const quizId = Number(req.params.quizId)
  const quiz = getQuiz(quizId)
  if (!quiz) return res.status(404).json({ message: 'Quiz was not found' })

  const questions = db.prepare(`
    SELECT id, text, points, position
    FROM questions
    WHERE quiz_id = ?
    ORDER BY position
  `).all(quizId)
  const answerStatement = db.prepare(`
    SELECT id, text, position
    FROM answers
    WHERE question_id = ?
    ORDER BY position
  `)

  res.json({
    ...quiz,
    questionCount: questions.length,
    maxScore: questions.reduce((sum, question) => sum + question.points, 0),
    questions: questions.map((question) => ({
      ...question,
      answers: answerStatement.all(question.id),
    })),
  })
})

quizzesRouter.post('/:quizId/submit', (req, res) => {
  const quizId = Number(req.params.quizId)
  const quiz = getQuiz(quizId)
  if (!quiz) return res.status(404).json({ message: 'Quiz was not found' })

  const userName = typeof req.body.userName === 'string' ? req.body.userName.trim() : ''
  const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : []

  if (userName.length < 2 || userName.length > 50) {
    return res.status(400).json({ message: 'User name must contain from 2 to 50 characters' })
  }

  const questions = db.prepare(`
    SELECT id, text, explanation, points, position
    FROM questions WHERE quiz_id = ? ORDER BY position
  `).all(quizId)

  if (submittedAnswers.length !== questions.length) {
    return res.status(400).json({ message: `Submit exactly ${questions.length} answers` })
  }

  const byQuestionId = new Map(submittedAnswers.map((item) => [Number(item.questionId), Number(item.answerId)]))
  if (byQuestionId.size !== questions.length) {
    return res.status(400).json({ message: 'Every question must have one answer' })
  }

  const getAnswer = db.prepare(`
    SELECT id, text, is_correct AS isCorrect
    FROM answers WHERE id = ? AND question_id = ?
  `)
  const getCorrectAnswer = db.prepare(`
    SELECT id, text FROM answers WHERE question_id = ? AND is_correct = 1
  `)

  let correctAnswers = 0
  let score = 0
  const details = []

  for (const question of questions) {
    const selectedAnswer = getAnswer.get(byQuestionId.get(question.id), question.id)
    if (!selectedAnswer) {
      return res.status(400).json({ message: `Invalid answer for question ${question.id}` })
    }
    const correctAnswer = getCorrectAnswer.get(question.id)
    const isCorrect = Boolean(selectedAnswer.isCorrect)
    if (isCorrect) {
      correctAnswers += 1
      score += question.points
    }
    details.push({
      questionId: question.id,
      question: question.text,
      selectedAnswer: selectedAnswer.text,
      correctAnswer: correctAnswer.text,
      isCorrect,
      pointsAwarded: isCorrect ? question.points : 0,
      pointsAvailable: question.points,
      explanation: question.explanation,
      selectedAnswerId: selectedAnswer.id,
    })
  }

  const maxScore = questions.reduce((sum, question) => sum + question.points, 0)
  const completedAt = new Date().toISOString()

  const saveAttempt = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO attempts
        (quiz_id, user_name, correct_answers, total_questions, score, max_score, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(quizId, userName, correctAnswers, questions.length, score, maxScore, completedAt)
    const attemptId = Number(result.lastInsertRowid)
    const insertAnswer = db.prepare(`
      INSERT INTO attempt_answers
        (attempt_id, question_id, answer_id, is_correct, points_awarded)
      VALUES (?, ?, ?, ?, ?)
    `)
    details.forEach((item) => {
      insertAnswer.run(
        attemptId,
        item.questionId,
        item.selectedAnswerId,
        item.isCorrect ? 1 : 0,
        item.pointsAwarded,
      )
    })
    return attemptId
  })

  const attemptId = saveAttempt()
  res.status(201).json({
    attemptId,
    userName,
    quiz: { id: quiz.id, title: quiz.title, topicTitle: quiz.topicTitle },
    correctAnswers,
    totalQuestions: questions.length,
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    completedAt,
    details: details.map(({ selectedAnswerId, ...detail }) => detail),
  })
})

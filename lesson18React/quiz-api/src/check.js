import assert from 'node:assert/strict'
import { initializeDatabase } from './db/init.js'

const db = initializeDatabase()
const topics = db.prepare('SELECT COUNT(*) AS count FROM topics').get().count
const quizzes = db.prepare('SELECT COUNT(*) AS count FROM quizzes').get().count
const questions = db.prepare('SELECT COUNT(*) AS count FROM questions').get().count
const answers = db.prepare('SELECT COUNT(*) AS count FROM answers').get().count
const invalidQuestions = db.prepare(`
  SELECT q.id
  FROM questions q
  LEFT JOIN answers a ON a.question_id = q.id
  GROUP BY q.id
  HAVING COUNT(a.id) != 5 OR SUM(a.is_correct) != 1
`).all()

assert.equal(topics, 3)
assert.equal(quizzes, 3)
assert.equal(questions, 30)
assert.equal(answers, 150)
assert.deepEqual(invalidQuestions, [])

console.log({ topics, quizzes, questions, answers, validQuestionStructure: true })
db.close()

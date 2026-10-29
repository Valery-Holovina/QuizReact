import { seedTopics } from './seed-data.js'

export function seedDatabase(db) {
  const existingTopics = db.prepare('SELECT COUNT(*) AS count FROM topics').get().count
  if (existingTopics > 0) return

  const insertTopic = db.prepare(`
    INSERT INTO topics (title, description, icon, color)
    VALUES (@title, @description, @icon, @color)
  `)
  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (topic_id, title, description, difficulty)
    VALUES (?, @title, @description, @difficulty)
  `)
  const insertQuestion = db.prepare(`
    INSERT INTO questions (quiz_id, text, explanation, points, position)
    VALUES (?, ?, ?, ?, ?)
  `)
  const insertAnswer = db.prepare(`
    INSERT INTO answers (question_id, text, is_correct, position)
    VALUES (?, ?, ?, ?)
  `)

  const seed = db.transaction(() => {
    for (const topic of seedTopics) {
      const topicId = Number(insertTopic.run(topic).lastInsertRowid)
      const quizId = Number(insertQuiz.run(topicId, topic.quiz).lastInsertRowid)

      topic.quiz.questions.forEach(([text, answers, correctIndex, points, explanation], questionIndex) => {
        const questionId = Number(
          insertQuestion.run(quizId, text, explanation, points, questionIndex + 1).lastInsertRowid,
        )
        answers.forEach((answer, answerIndex) => {
          insertAnswer.run(questionId, answer, answerIndex === correctIndex ? 1 : 0, answerIndex + 1)
        })
      })
    }
  })

  seed()
}

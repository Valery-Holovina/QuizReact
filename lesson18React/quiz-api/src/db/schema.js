export function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT '',
      points INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
      position INTEGER NOT NULL,
      UNIQUE (quiz_id, position),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
      position INTEGER NOT NULL,
      UNIQUE (question_id, position),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      correct_answers INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS attempt_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer_id INTEGER NOT NULL,
      is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
      points_awarded INTEGER NOT NULL DEFAULT 0,
      UNIQUE (attempt_id, question_id),
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE RESTRICT,
      FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic_id);
    CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON attempts(quiz_id);
  `)
}

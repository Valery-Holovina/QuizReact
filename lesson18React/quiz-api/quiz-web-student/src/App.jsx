import { useEffect, useState } from 'react'
import { quizApi } from './api.js'

const letters = ['A', 'B', 'C', 'D', 'E']

function Header({ onHome }) {
  return (
    <header className="header">
      <button className="logo" onClick={onHome}><b>Q</b> quizly</button>
      <span>React + Node + SQLite</span>
    </header>
  )
}

function Message({ children, error = false }) {
  return <div className={error ? 'message error' : 'message'}>{children}</div>
}

function HomeScreen({ topics, onSelect }) {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">Навчайтесь граючи</span>
          <h1>Перевірте знання.<br /><em>Здивуйте себе.</em></h1>
          <p>Оберіть тему, дайте відповіді та отримайте результат.</p>
        </div>
        <div className="hero-score"><small>Наступний рекорд</small><strong>100%</strong></div>
      </section>

      <h2>Оберіть тему</h2>
      <section className="topics">
        {topics.map(topic => (
          <button className="topic-card" style={{ '--color': topic.color }} key={topic.id} onClick={() => onSelect(topic)}>
            <i>{topic.icon}</i>
            <strong>{topic.title}</strong>
            <span>{topic.description}</span>
            <b>Почати →</b>
          </button>
        ))}
        </section>
    </>
  )
}

function StartScreen({ topic, quizzes, onStart, onBack }) {
  const [name, setName] = useState('')
  const quiz = quizzes[0]

  function submit(event) {
    event.preventDefault()
    if (name.trim().length >= 2) onStart(quiz.id, name.trim())
  }


  return (
    <section className="start-layout">
      <div>
        <button className="link-button" onClick={onBack}>← Усі теми</button>
        <span className="topic-icon" style={{ background: topic.color }}>{topic.icon}</span>
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </div>
      <form className="panel" onSubmit={submit}>
        <span className="eyebrow">Перед стартом</span>
        <h2>Як вас звати?</h2>
        <input value={name} onChange={event => setName(event.target.value)} placeholder="Наприклад, Олексій" maxLength="50" autoFocus />
        <p>{quiz?.title} · {quiz?.questionCount} запитань</p>
        <button className="primary" disabled={name.trim().length < 2}>Почати вікторину →</button>
      </form>
    </section>
  )
}
function QuizScreen({ quiz, userName, onFinish, sending }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const question = quiz.questions[index]
  const selectedId = answers[question.id]
  const isLast = index === quiz.questions.length - 1

  function select(answerId) {
    setAnswers(current => ({ ...current, [question.id]: answerId }))
  }

  function next() {
    if (!selectedId) return
    if (!isLast) return setIndex(current => current + 1)

    onFinish({
      userName,
      answers: quiz.questions.map(item => ({
        questionId: item.id,
        answerId: answers[item.id]
      }))
    })
  }
return (
    <section className="quiz">
      <div className="quiz-top"><span>{quiz.topicTitle}</span><strong>{userName}</strong></div>
      <div className="progress"><span style={{ width: `${((index + 1) / quiz.questionCount) * 100}%` }} /></div>
      <article className="question">
        <small>Запитання {index + 1} з {quiz.questionCount} · {question.points} бал</small>
        <h1>{question.text}</h1>
        <div className="answers">
          {question.answers.map((answer, answerIndex) => (
            <button className={selectedId === answer.id ? 'answer selected' : 'answer'} key={answer.id} onClick={() => select(answer.id)}>
              <i>{letters[answerIndex]}</i><span>{answer.text}</span>
            </button>
          ))}
        </div>
      </article>
      <div className="navigation">
        <button disabled={index === 0} onClick={() => setIndex(value => value - 1)}>← Назад</button>
        <button className="primary" disabled={!selectedId || sending} onClick={next}>
          {sending ? 'Перевіряємо…' : isLast ? 'Завершити' : 'Далі →'}
        </button>
      </div>
    </section>
  )
}

function ResultScreen({ result, leaders, onHome }) {
  const [review, setReview] = useState(false)
return (
    <section className="result">
      <div className="result-head">
        <div className="score">{result.percentage}%</div>
        <div><span className="eyebrow">Вікторину завершено</span>
          <h1>{result.correctAnswers} з {result.totalQuestions} правильно</h1>
          <p>Ви набрали {result.score} з {result.maxScore} балів.</p>
        </div>
      </div>
      <div className="result-columns">
        <article className="panel"><h2>Таблиця лідерів</h2>
          {leaders.map((item, index) => (
            <div className="leader" key={item.id}><b>#{index + 1}</b><span>{item.userName}</span><strong>{item.percentage}%</strong></div>
          ))}
        </article>
        <article className="panel"><h2>{result.quiz.title}</h2>
          <p>Учасник: <b>{result.userName}</b></p>
          <button className="primary" onClick={() => setReview(value => !value)}>{review ? 'Сховати' : 'Розібрати відповіді'}</button>
          <button className="link-button" onClick={onHome}>Обрати іншу тему</button>
        </article>
      </div>
      {review && <div className="review">
        {result.details.map((item, index) => (
          <article className={item.isCorrect ? 'review-item ok' : 'review-item wrong'} key={item.questionId}>
            <h3>{index + 1}. {item.question}</h3>
            <p>Ваша відповідь: <b>{item.selectedAnswer}</b></p>
            {!item.isCorrect && <p>Правильно: <b>{item.correctAnswer}</b></p>}
            <small>{item.explanation}</small>
          </article>
        ))}
      </div>}
    </section>
  )
}
export default function App() {
  const [screen, setScreen] = useState('home')
  const [topics, setTopics] = useState([])
  const [topic, setTopic] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [userName, setUserName] = useState('')
  const [result, setResult] = useState(null)
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    quizApi.getTopics()
      .then(data => { if (!cancelled) setTopics(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function chooseTopic(selectedTopic) {
    setLoading(true); setError('')
    try {
      const data = await quizApi.getTopicQuizzes(selectedTopic.id)
      setTopic(selectedTopic); setQuizzes(data.quizzes); setScreen('start')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function startQuiz(quizId, name) {
    setLoading(true); setError('')
    try {
      setQuiz(await quizApi.getQuiz(quizId)); setUserName(name); setScreen('quiz')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function finishQuiz(payload) {
    setSending(true); setError('')
    try {
      const saved = await quizApi.submitQuiz(quiz.id, payload)
      const rating = await quizApi.getResults(quiz.id)
      setResult(saved); setLeaders(rating); setScreen('result')
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  function goHome() {
    setScreen('home'); setTopic(null); setQuiz(null); setResult(null); setError('')
  }

  return (
    <div className="app">
      <Header onHome={goHome} />
      <main>
        {error && <Message error>{error}</Message>}
        {loading && <Message>Завантажуємо дані…</Message>}
        {!loading && screen === 'home' && <HomeScreen topics={topics} onSelect={chooseTopic} />}
        {!loading && screen === 'start' && <StartScreen topic={topic} quizzes={quizzes} onStart={startQuiz} onBack={goHome} />}
        {!loading && screen === 'quiz' && <QuizScreen quiz={quiz} userName={userName} onFinish={finishQuiz} sending={sending} />}
        {!loading && screen === 'result' && <ResultScreen result={result} leaders={leaders} onHome={goHome} />}
      </main>
    </div>)}
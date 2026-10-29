# Quiz API

Навчальний REST API для React-застосунку «Вікторина».

## Технології

- Node.js — середовище виконання JavaScript;
- Express 5 — HTTP-сервер і маршрути;
- SQLite — файлова реляційна база даних;
- better-sqlite3 — синхронний драйвер SQLite;
- cors — дозвіл браузерних запитів з іншого origin;
- swagger-ui-express — інтерактивна документація OpenAPI.

## Запуск

```powershell
npm install
npm run db:reset
npm run dev
```

API: `http://localhost:4016`

Swagger: `http://localhost:4016/api-docs`

## Скрипти

| Команда | Призначення |
|---|---|
| `npm run dev` | Сервер із автоматичним перезапуском через `node --watch` |
| `npm start` | Звичайний запуск сервера |
| `npm run db:reset` | Видалити локальну БД, створити структуру та тестові дані заново |
| `npm run check` | Перевірити кількість записів і структуру питань |

## Структура проєкту

```text
src/
├── app.js                 # Express, middleware та підключення routes
├── server.js              # запуск HTTP-сервера
├── config.js              # порт і шлях до SQLite
├── openapi.js             # специфікація Swagger/OpenAPI
├── check.js               # перевірка навчальних даних
├── db/
│   ├── database.js        # підключення better-sqlite3
│   ├── schema.js          # CREATE TABLE та індекси
│   ├── seed-data.js       # теми, питання і відповіді
│   ├── seed.js            # запис початкових даних
│   ├── init.js            # створення структури при запуску
│   └── reset.js           # повне локальне пересоздання БД
├── middleware/
│   └── errors.js          # 404 та централізована обробка помилок
└── routes/
    ├── topics.js          # теми і список вікторин
    ├── quizzes.js         # питання і submit
    └── results.js         # рейтинг та історія
```

## Структура бази даних

### topics

Теми вікторин: `id`, `title`, `description`, `icon`, `color`.

### quizzes

Вікторини: `id`, `topic_id`, `title`, `description`, `difficulty`.

### questions

Питання: `id`, `quiz_id`, `text`, `explanation`, `points`, `position`.

### answers

П'ять варіантів кожного питання: `id`, `question_id`, `text`, `is_correct`, `position`.

### attempts

Підсумок проходження: ім'я, вікторина, кількість правильних відповідей, бали, максимальний бал і дата.

### attempt_answers

Деталі спроби: яке питання, яку відповідь обрано, чи правильна вона і скільки балів отримано.

Зв'язки:

```text
topics 1 ── * quizzes 1 ── * questions 1 ── * answers
                     │
                     └── * attempts 1 ── * attempt_answers
```

## API

| Метод | URL | Опис |
|---|---|---|
| GET | `/api/health` | Перевірка сервера і БД |
| GET | `/api/topics` | Усі теми |
| GET | `/api/topics/:topicId/quizzes` | Вікторини теми |
| GET | `/api/quizzes/:quizId` | Питання без ознаки правильної відповіді |
| POST | `/api/quizzes/:quizId/submit` | Перевірка і збереження спроби |
| GET | `/api/results?quizId=1&limit=10` | Рейтинг конкретної вікторини |
| GET | `/api/results/:attemptId` | Деталі спроби |

Приклад submit:

```json
{
  "userName": "Анна",
  "answers": [
    { "questionId": 1, "answerId": 2 },
    { "questionId": 2, "answerId": 7 }
  ]
}
```

Правильні відповіді не надсилаються в React до завершення тесту. Сервер перевіряє, що відповідь належить потрібному питанню, рахує результат і зберігає його в одній транзакції.

## Змінні середовища

Можна створити `.env` за прикладом `.env.example`. У навчальному варіанті достатньо стандартних значень. Node.js сам не читає `.env` без додаткового параметра; за потреби запускайте `node --env-file=.env src/server.js`.

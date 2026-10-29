export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Quiz API',
    version: '1.0.0',
    description: 'Навчальний REST API для вибору вікторин, проходження тестів та збереження результатів у SQLite.',
  },
  servers: [{ url: 'http://localhost:4016', description: 'Local development server' }],
  tags: [
    { name: 'System', description: 'Перевірка стану API' },
    { name: 'Topics', description: 'Теми та доступні вікторини' },
    { name: 'Quizzes', description: 'Запитання та відправлення відповідей' },
    { name: 'Results', description: 'Історія проходжень і рейтинг' },
  ],
  paths: {
    '/api/health': {
      get: { tags: ['System'], summary: 'Перевірити роботу сервера', responses: { 200: { description: 'API is ready' } } },
    },
    '/api/topics': {
      get: { tags: ['Topics'], summary: 'Отримати всі теми', responses: { 200: { description: 'Array of topics' } } },
    },
    '/api/topics/{topicId}/quizzes': {
      get: {
        tags: ['Topics'], summary: 'Отримати вікторини обраної теми',
        parameters: [{ in: 'path', name: 'topicId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Topic and quizzes' }, 404: { description: 'Topic not found' } },
      },
    },
    '/api/quizzes/{quizId}': {
      get: {
        tags: ['Quizzes'], summary: 'Отримати вікторину без правильних відповідей',
        parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Quiz with questions and five answer options' }, 404: { description: 'Quiz not found' } },
      },
    },
    '/api/quizzes/{quizId}/submit': {
      post: {
        tags: ['Quizzes'], summary: 'Перевірити відповіді та зберегти спробу',
        parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/QuizSubmission' } } },
        },
        responses: { 201: { description: 'Calculated and stored result' }, 400: { description: 'Invalid input' }, 404: { description: 'Quiz not found' } },
      },
    },
    '/api/results': {
      get: {
        tags: ['Results'], summary: 'Отримати результати або рейтинг вікторини',
        parameters: [
          { in: 'query', name: 'quizId', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: { 200: { description: 'Array of attempts' } },
      },
    },
    '/api/results/{attemptId}': {
      get: {
        tags: ['Results'], summary: 'Отримати деталі однієї спроби',
        parameters: [{ in: 'path', name: 'attemptId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Attempt with answer details' }, 404: { description: 'Attempt not found' } },
      },
    },
  },
  components: {
    schemas: {
      QuizSubmission: {
        type: 'object', required: ['userName', 'answers'],
        properties: {
          userName: { type: 'string', minLength: 2, maxLength: 50, example: 'Анна' },
          answers: {
            type: 'array',
            items: {
              type: 'object', required: ['questionId', 'answerId'],
              properties: { questionId: { type: 'integer', example: 1 }, answerId: { type: 'integer', example: 2 } },
            },
          },
        },
      },
    },
  },
}

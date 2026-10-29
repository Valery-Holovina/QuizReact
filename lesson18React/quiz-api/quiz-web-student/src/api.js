const API_URL = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`)
  }

  return data
}

export const quizApi = {
  getTopics: () => request('/topics'),
  getTopicQuizzes: topicId => request(`/topics/${topicId}/quizzes`),
  getQuiz: quizId => request(`/quizzes/${quizId}`),
  submitQuiz: (quizId, payload) => request(`/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getResults: quizId => request(`/results?quizId=${quizId}&limit=10`)
}
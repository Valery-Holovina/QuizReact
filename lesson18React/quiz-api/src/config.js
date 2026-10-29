import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(sourceDirectory, '..')

export const config = {
  port: Number(process.env.PORT) || 4016,
  databaseFile: process.env.DB_FILE
    ? path.resolve(projectDirectory, process.env.DB_FILE)
    : path.join(projectDirectory, 'data', 'quiz.sqlite'),
}

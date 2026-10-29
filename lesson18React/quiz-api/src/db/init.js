import { db } from './database.js'
import { createSchema } from './schema.js'
import { seedDatabase } from './seed.js'

export function initializeDatabase() {
  createSchema(db)
  seedDatabase(db)
  return db
}

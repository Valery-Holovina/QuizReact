import fs from 'node:fs'
import { config } from '../config.js'

for (const file of [config.databaseFile, `${config.databaseFile}-shm`, `${config.databaseFile}-wal`]) {
  if (fs.existsSync(file)) fs.rmSync(file)
}

const { initializeDatabase } = await import('./init.js')
initializeDatabase().close()
console.log(`Database recreated: ${config.databaseFile}`)

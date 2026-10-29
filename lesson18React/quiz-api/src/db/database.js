import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { config } from '../config.js'

fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true })

export const db = new Database(config.databaseFile)
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

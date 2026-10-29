import { app } from './app.js'
import { config } from './config.js'

app.listen(config.port, () => {
  console.log(`Quiz API: http://localhost:${config.port}`)
  console.log(`Swagger:  http://localhost:${config.port}/api-docs`)
})

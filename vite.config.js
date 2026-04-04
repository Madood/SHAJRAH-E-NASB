import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const saveTreePlugin = () => ({
  name: 'save-tree',
  configureServer(server) {
    server.middlewares.use('/api/save-tree', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end('Method not allowed')
        return
      }
      let body = ''
      req.on('data', chunk => { body += chunk.toString() })
      req.on('end', () => {
        try {
          JSON.parse(body)
          const filePath = path.resolve(process.cwd(), 'public/shajra-data.json')
          fs.writeFileSync(filePath, JSON.stringify(JSON.parse(body), null, 2), 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: e.message }))
        }
      })
    })
  }
})

export default defineConfig({
  plugins: [react(), saveTreePlugin()],
  base: './',
  server: {
    watch: {
      ignored: ['**/src/data/shajra.json'],
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-verify-dev',
      configureServer(server) {
        server.middlewares.use('/api/verify', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                const { code } = JSON.parse(body || '{}');
                const validCodes = (process.env.VALID_ACCESS_CODES || 'ARDUINO,UNO,UNO2026,COHORT2026,ADMIN,BFIOT')
                  .split(',').map((c) => c.trim().toUpperCase());
                if (code && (validCodes.includes(code.trim().toUpperCase()) || code.trim().length >= 4)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } else {
                  res.statusCode = 401;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, message: 'Invalid access key.' }));
                }
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          }
        });
      },
    },
  ],
})

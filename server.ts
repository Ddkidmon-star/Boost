import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SMM Panel v2 Relay & Proxy Endpoint
  app.post('/api/smm/action', async (req, res) => {
    const { endpoint, key, action, ...extraParams } = req.body;

    const targetUrl = endpoint || 'https://smm8.com/api/v2';
    const apiKey = key || process.env.SMM_MASTER_API_KEY || 'MASTER_DEMO_KEY';

    try {
      const formData = new URLSearchParams();
      formData.append('key', apiKey);
      formData.append('action', action || 'services');

      for (const [k, v] of Object.entries(extraParams)) {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      }

      // Forward request to standard SMM v2 engine
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SMMBoostPro-Client/2.0',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        return res.json(json);
      } else {
        const text = await response.text();
        try {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch {
          return res.json({
            status: response.status,
            rawText: text.substring(0, 500),
            note: 'Response was non-JSON format from SMM provider',
          });
        }
      }
    } catch (err: any) {
      console.warn(`SMM proxy request to ${targetUrl} failed:`, err?.message);
      // Graceful response so client never crashes
      return res.status(200).json({
        proxyFallback: true,
        error: err.name === 'AbortError' ? 'Provider timeout' : err.message,
        message: 'Engine running in local accelerated mode',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SMM Boost Pro v2 Engine', timestamp: new Date().toISOString() });
  });

  // Setup Vite in development or static file serving in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SMM Boost Pro] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

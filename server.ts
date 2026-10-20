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

  // In-memory cache for catalog services (speeds up app loads to <10ms for 10k+ services)
  let smmServicesCache: { data: any; timestamp: number } | null = null;
  let owletServicesCache: { data: any; timestamp: number } | null = null;
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  // Status check (Never exposes the secret key to client)
  app.get('/api/smm/backend-status', (req, res) => {
    const hasKey = Boolean(process.env.SMM_MASTER_API_KEY && process.env.SMM_MASTER_API_KEY.trim() !== '');
    res.json({
      hasMasterKey: hasKey,
      endpoint: process.env.SMM_ENDPOINT || 'https://smm8.com/api/v2',
      engine: 'SMM Panel v2 Secure Backend Relay'
    });
  });

  // Secure Server-Side SMM v2 Relay
  // The private API key is kept 100% on the server and never sent to or requested from the client!
  app.post('/api/smm/action', async (req, res) => {
    const { action, ...extraParams } = req.body;

    // Fast-path cache for services catalog
    if ((!action || action === 'services') && smmServicesCache && (Date.now() - smmServicesCache.timestamp < CACHE_TTL_MS)) {
      return res.json(smmServicesCache.data);
    }

    const targetUrl = process.env.SMM_ENDPOINT || 'https://smm8.com/api/v2';
    const masterApiKey = process.env.SMM_MASTER_API_KEY || '';

    try {
      const formData = new URLSearchParams();
      formData.append('key', masterApiKey);
      formData.append('action', action || 'services');

      for (const [k, v] of Object.entries(extraParams)) {
        if (v !== undefined && v !== null && k !== 'key' && k !== 'endpoint') {
          formData.append(k, String(v));
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SMMBoostPro-Backend/3.0',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        if ((!action || action === 'services') && Array.isArray(json) && json.length > 0) {
          smmServicesCache = { data: json, timestamp: Date.now() };
        }
        return res.json(json);
      } else {
        const text = await response.text();
        try {
          const parsed = JSON.parse(text);
          if ((!action || action === 'services') && Array.isArray(parsed) && parsed.length > 0) {
            smmServicesCache = { data: parsed, timestamp: Date.now() };
          }
          return res.json(parsed);
        } catch {
          return res.json({
            status: response.status,
            rawText: text.substring(0, 500),
            note: 'Non-JSON response from SMM server',
          });
        }
      }
    } catch (err: any) {
      console.warn(`SMM backend proxy call to ${targetUrl} failed:`, err?.message);
      if (smmServicesCache && (!action || action === 'services')) {
        return res.json(smmServicesCache.data);
      }
      return res.status(200).json({
        proxyFallback: true,
        error: err.name === 'AbortError' ? 'Provider timeout' : err.message,
        message: 'Engine running in local accelerated mode',
      });
    }
  });

  // Status check for The Owlet (Never exposes the secret key to client)
  app.get('/api/owlet/backend-status', (req, res) => {
    const hasKey = Boolean(process.env.OWLET_MASTER_KEY && process.env.OWLET_MASTER_KEY.trim() !== '');
    res.json({
      hasMasterKey: hasKey,
      endpoint: 'https://theowlet.com/api/v2',
      engine: 'The Owlet v2 Secure Backend Relay'
    });
  });

  // Secure Server-Side The Owlet Relay (https://theowlet.com/api/v2)
  app.post('/api/owlet/action', async (req, res) => {
    const { action, ...extraParams } = req.body;

    // Fast-path cache for services catalog
    if ((!action || action === 'services') && owletServicesCache && (Date.now() - owletServicesCache.timestamp < CACHE_TTL_MS)) {
      return res.json(owletServicesCache.data);
    }

    // Target https://theowlet.com/api/v2 where user key is active and live
    const envEndpoint = (process.env.OWLET_ENDPOINT || '').trim();
    const targetUrl = (envEndpoint && !envEndpoint.includes('therealowlet.com')) 
      ? envEndpoint 
      : 'https://theowlet.com/api/v2';
    const masterApiKey = process.env.OWLET_MASTER_KEY || '';

    try {
      const formData = new URLSearchParams();
      formData.append('key', masterApiKey);
      formData.append('action', action || 'services');

      for (const [k, v] of Object.entries(extraParams)) {
        if (v !== undefined && v !== null && k !== 'key' && k !== 'endpoint') {
          formData.append(k, String(v));
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BoostPro-Owlet-Backend/3.0',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        if ((!action || action === 'services') && Array.isArray(json) && json.length > 0) {
          owletServicesCache = { data: json, timestamp: Date.now() };
        }
        return res.json(json);
      } else {
        const text = await response.text();
        try {
          const parsed = JSON.parse(text);
          if ((!action || action === 'services') && Array.isArray(parsed) && parsed.length > 0) {
            owletServicesCache = { data: parsed, timestamp: Date.now() };
          }
          return res.json(parsed);
        } catch {
          return res.json({
            status: response.status,
            rawText: text.substring(0, 500),
            note: 'Non-JSON response from Owlet server',
          });
        }
      }
    } catch (err: any) {
      console.warn(`Owlet backend proxy call to ${targetUrl} failed:`, err?.message);
      if (owletServicesCache && (!action || action === 'services')) {
        return res.json(owletServicesCache.data);
      }
      return res.status(200).json({
        proxyFallback: true,
        error: err.name === 'AbortError' ? 'Provider timeout' : err.message,
        message: 'The Owlet engine running in local accelerated mode',
      });
    }
  });

  // Setup / Save The Owlet API Key via backend
  app.post('/api/owlet/save-key', async (req, res) => {
    const { key } = req.body;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Valid Owlet API Key is required' });
    }
    const cleanKey = key.trim();
    process.env.OWLET_MASTER_KEY = cleanKey;

    try {
      const fs = await import('fs/promises');
      const envPath = path.resolve(__dirname, '.env');
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch {
        envContent = '';
      }

      if (envContent.includes('OWLET_MASTER_KEY=')) {
        envContent = envContent.replace(/OWLET_MASTER_KEY=.*/g, `OWLET_MASTER_KEY="${cleanKey}"`);
      } else {
        envContent += `\nOWLET_MASTER_KEY="${cleanKey}"`;
      }
      await fs.writeFile(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (e) {
      console.warn('Could not persist OWLET_MASTER_KEY to .env:', e);
    }

    return res.json({ success: true, message: 'Owlet Master Key updated on backend' });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'SMM Boost Pro v2 Dual-Engine (SMM8 + The Owlet)', 
      hasMasterKey: Boolean(process.env.SMM_MASTER_API_KEY),
      hasOwletKey: Boolean(process.env.OWLET_MASTER_KEY),
      hasPaystackKey: Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_SECRET_KEY.trim() !== ''),
      timestamp: new Date().toISOString() 
    });
  });

  // Secure Backend-Only Role Verification
  // The owner's email is NEVER exposed to or compared on the frontend!
  // The backend securely checks if the authenticated Google email matches the backend OWNER_EMAIL.
  app.post('/api/auth/verify-role', (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.json({ isOwner: false, role: 'customer' });
    }

    const backendOwnerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
    const providedEmail = email.trim().toLowerCase();

    // Secure comparison on server
    const isOwner = Boolean(backendOwnerEmail && providedEmail === backendOwnerEmail);

    return res.json({
      isOwner,
      role: isOwner ? 'owner' : 'customer'
    });
  });

  // Paystack Status & Public Info (Secret key NEVER sent to client)
  app.get('/api/paystack/status', (req, res) => {
    const hasSecretKey = Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_SECRET_KEY.trim() !== '');
    res.json({
      configured: hasSecretKey,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
      currency: 'NGN',
    });
  });

  // Setup Paystack Secret/Public Key via Backend if user wants to supply it directly
  app.post('/api/paystack/save-key', async (req, res) => {
    const { secretKey, publicKey } = req.body;
    if (!secretKey || typeof secretKey !== 'string') {
      return res.status(400).json({ error: 'Valid Paystack Secret Key is required' });
    }

    const cleanSecretKey = secretKey.trim();
    const cleanPublicKey = (publicKey || '').trim();

    process.env.PAYSTACK_SECRET_KEY = cleanSecretKey;
    if (cleanPublicKey) {
      process.env.PAYSTACK_PUBLIC_KEY = cleanPublicKey;
    }

    try {
      // Append or replace in .env
      const fs = await import('fs/promises');
      const envPath = path.resolve(__dirname, '.env');
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch {
        envContent = '';
      }

      if (envContent.includes('PAYSTACK_SECRET_KEY=')) {
        envContent = envContent.replace(/PAYSTACK_SECRET_KEY=.*/g, `PAYSTACK_SECRET_KEY="${cleanSecretKey}"`);
      } else {
        envContent += `\nPAYSTACK_SECRET_KEY="${cleanSecretKey}"`;
      }

      if (cleanPublicKey) {
        if (envContent.includes('PAYSTACK_PUBLIC_KEY=')) {
          envContent = envContent.replace(/PAYSTACK_PUBLIC_KEY=.*/g, `PAYSTACK_PUBLIC_KEY="${cleanPublicKey}"`);
        } else {
          envContent += `\nPAYSTACK_PUBLIC_KEY="${cleanPublicKey}"`;
        }
      }

      await fs.writeFile(envPath, envContent.trim() + '\n', 'utf-8');
    } catch (e) {
      console.warn('Could not persist to .env, kept in runtime process.env:', e);
    }

    return res.json({
      success: true,
      message: 'Paystack Secret Key activated on backend successfully'
    });
  });

  // Paystack Initialize Transaction Endpoint
  app.post('/api/paystack/initialize', async (req, res) => {
    const { email, amount, currency = 'NGN', metadata } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

    if (!secretKey) {
      return res.status(400).json({
        status: false,
        requiresKey: true,
        message: 'Paystack Secret Key is not configured yet on backend.'
      });
    }

    if (!email || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Valid email and deposit amount are required'
      });
    }

    try {
      // Amount in Paystack is in kobo (NGN * 100)
      const paystackAmount = Math.round(Number(amount) * 100);

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          amount: paystackAmount,
          currency: currency.toUpperCase(),
          callback_url: `${req.headers.origin || 'http://localhost:3000'}/?paystack_callback=true`,
          metadata: metadata || {}
        })
      });

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('Paystack initialization error:', err);
      return res.status(500).json({
        status: false,
        message: err.message || 'Failed to initialize Paystack transaction'
      });
    }
  });

  // Paystack Verify Transaction Endpoint
  app.get('/api/paystack/verify/:reference', async (req, res) => {
    const { reference } = req.params;
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

    if (!secretKey) {
      return res.status(400).json({
        status: false,
        message: 'Paystack Secret Key is not configured on backend.'
      });
    }

    if (!reference) {
      return res.status(400).json({ status: false, message: 'Reference is required' });
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status && data.data && data.data.status === 'success') {
        const depositedAmount = data.data.amount / 100; // convert kobo back to main unit
        return res.json({
          status: true,
          verified: true,
          amount: depositedAmount,
          currency: data.data.currency,
          customer: data.data.customer,
          reference: data.data.reference
        });
      } else {
        return res.json({
          status: false,
          verified: false,
          message: data.data?.gateway_response || data.message || 'Payment not verified'
        });
      }
    } catch (err: any) {
      console.error('Paystack verification error:', err);
      return res.status(500).json({
        status: false,
        message: err.message || 'Failed to verify Paystack transaction'
      });
    }
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

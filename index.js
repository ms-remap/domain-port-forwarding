const express = require('express');
const http = require('http');

const app = express();
const API_KEY = process.env.API_KEY || 'd613c3';
const LLM_PORT = process.env.LLM_PORT || 2146;

// Parse all request bodies as raw buffer
app.use(express.raw({ type: '*/*' }));

app.all('/*', (req, res) => {
  const authHeader = req.headers['authorization'];

  // ----- AUTH CHECK -----
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  // // ----- LOG FIRST 4 AND LAST 4 CHARS -----
  // const first4 = token.slice(0, 4);
  // const last4 = token.slice(-4);
  // console.log(`Incoming token: ${first4}...${last4}`);

  if (token !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // ----- VALIDATE JSON IF CONTENT-TYPE IS APPLICATION/JSON -----
  if (req.headers['content-type']?.includes('application/json') && req.body?.length) {
    try {
      JSON.parse(req.body.toString());
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON', details: err.message });
    }
  }

  // ----- PROXY OPTIONS -----
  const options = {
    hostname: '172.17.0.1',
    port: LLM_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      // Remove auth before forwarding (optional)
      authorization: undefined,
      // host: undefined, 
    },
  };

  const proxyReq = http.request(options, proxyRes => {
    let data = '';
    proxyRes.on('data', chunk => (data += chunk));
    proxyRes.on('end', () => {
      // Log backend errors if any
      if (proxyRes.statusCode >= 400) {
        console.error(`Backend error ${proxyRes.statusCode}: ${data}`);
      }
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      res.end(data);
    });
  });

  proxyReq.on('error', err => {
    console.error('Proxy request error:', err);
    res.status(500).json({ error: 'Proxy request failed', details: err.message });
  });

  // Forward body if present
  if (req.body?.length) {
    proxyReq.write(req.body);
  }

  proxyReq.end();
});

app.listen(3000, () => {
  console.log('Secure proxy running on http://localhost:3000');
});

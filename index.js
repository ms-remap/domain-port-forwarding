const express = require('express');
const http = require('http');

const app = express();
const API_KEY = process.env.API_KEY || 'd613c3';

app.use(express.raw({ type: '*/*' }));

app.all('/*', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing Authorization header',
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (token !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid token',
    });
  }

  const options = {
    hostname: '172.17.0.1',
    port: 2145,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      // optionally strip auth before forwarding
      authorization: undefined,
    },
  };

  const proxyReq = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    res.status(500).send(err.message);
  });

  if (req.body?.length) {
    proxyReq.write(req.body);
  }

  proxyReq.end();
});

app.listen(3000, () => {
  console.log('Secure proxy running on http://localhost:3000');
});

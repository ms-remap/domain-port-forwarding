const express = require('express');
const http = require('http');

const app = express();
const API_KEY = process.env.API_KEY || 'my-secret-key';

app.use(express.raw({ type: '*/*' }));

app.all('/*', (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing API key',
    });
  }

  const options = {
    hostname: '172.17.0.1',
    port: 2145,
    path: req.originalUrl,
    method: req.method,
    headers: req.headers,
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

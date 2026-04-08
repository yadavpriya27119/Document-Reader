const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();

if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
  // eslint-disable-next-line global-require
  const helmet = require('helmet');
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(
  cors({
    origin: config.cors.origin,
    exposedHeaders: ['X-Chat-Source', 'X-Chat-Session'],
  })
);
app.use(express.json({ limit: '2mb' }));

app.use('/', routes);

const distPath = path.join(__dirname, '../frontend/dist');
if (config.nodeEnv === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = app;

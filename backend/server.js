const app = require('./app');
const config = require('./config');

app.listen(config.port, config.host, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://${config.host}:${config.port} (${config.nodeEnv})`);
  // eslint-disable-next-line no-console
  console.log('Routes: GET /health | POST /upload | POST /chat | DELETE /cache');
});

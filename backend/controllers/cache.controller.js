const chatCache = require('../services/chatCache.service');

function clearCache(_req, res) {
  const cleared = chatCache.clear();
  // eslint-disable-next-line no-console
  console.log(`[cache CLEAR] wiped ${cleared} entries`);
  res.json({ cleared });
}

module.exports = { clearCache };

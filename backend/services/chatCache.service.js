const cache = Object.create(null);

function normalize(question) {
  return question.toLowerCase().trim().replace(/\s+/g, ' ');
}

function get(key) {
  return cache[key];
}

function set(key, value) {
  cache[key] = value;
}

function clear() {
  const keys = Object.keys(cache);
  keys.forEach((k) => delete cache[k]);
  return keys.length;
}

function stats() {
  const keys = Object.keys(cache);
  return { size: keys.length, keys };
}

module.exports = {
  normalize,
  get,
  set,
  clear,
  stats,
};

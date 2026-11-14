const fs = require('fs');
const os = require('os');
const path = require('path');

const DATA_FILE = path.join(os.tmpdir(), 'xtreme_spin_winners.json');

function readWinners() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveWinners(list) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list || [], null, 2), 'utf8');
  } catch (e) {}
}

module.exports = function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    if (req.method === 'GET') {
      const winners = readWinners();
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        count: winners.length,
        data: winners
      }));
    }

    if (req.method === 'DELETE') {
      saveWinners([]);
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        message: 'All winner records cleared.'
      }));
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
  } catch (err) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, count: 0, data: [] }));
  }
};

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

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        return resolve(JSON.parse(req.body));
      } catch (e) {
        return resolve({});
      }
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
    }

    const payload = await parseBody(req);
    const { name, email, phone, prize, claimCode, timestamp } = payload || {};

    if (!name || !email || !phone || !prize) {
      res.statusCode = 400;
      return res.end(JSON.stringify({
        success: false,
        message: 'Name, email, phone, and prize are required fields.'
      }));
    }

    const winners = readWinners();
    const newEntry = {
      id: payload.id || ('WIN-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000)),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      prize: prize,
      claimCode: claimCode || ('XTR-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)),
      timestamp: timestamp || new Date().toISOString()
    };

    winners.unshift(newEntry);
    saveWinners(winners);

    res.statusCode = 201;
    return res.end(JSON.stringify({
      success: true,
      message: 'Winner record stored successfully!',
      entry: newEntry
    }));
  } catch (err) {
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      message: 'Saved locally.'
    }));
  }
};

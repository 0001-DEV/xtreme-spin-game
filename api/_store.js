const fs = require('fs');
const os = require('os');
const path = require('path');

const DATA_FILE = path.join(os.tmpdir(), 'xtreme_spin_winners.json');
let memoryStore = [];

function readWinners() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // Fallback to in-memory store if tmpdir read fails
  }
  return memoryStore;
}

function saveWinners(winners) {
  memoryStore = Array.isArray(winners) ? winners : [];
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    // Ignore write error on read-only environments, memoryStore still holds it
  }
  return true;
}

module.exports = {
  readWinners,
  saveWinners
};

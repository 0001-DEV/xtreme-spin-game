const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'winners.json');

// Ensure data folder and storage file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Helper functions for data access
function readWinners() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading winners file:', err);
    return [];
  }
}

function saveWinners(winners) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(winners, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving winners file:', err);
    return false;
  }
}

// MIME types dictionary for static file serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper: send CORS & JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Create native HTTP Server (Zero npm dependencies required)
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API ROUTE: GET /api/winners
  if (pathname === '/api/winners' && method === 'GET') {
    const winners = readWinners();
    return sendJson(res, 200, { success: true, count: winners.length, data: winners });
  }

  // API ROUTE: POST /api/spin
  if (pathname === '/api/spin' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { name, email, phone, prize, claimCode, timestamp } = payload;

        if (!name || !email || !phone || !prize) {
          return sendJson(res, 400, {
            success: false,
            message: 'Name, email, phone, and prize are required fields.'
          });
        }

        const winners = readWinners();
        const newEntry = {
          id: 'WIN-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          prize: prize,
          claimCode: claimCode || ('XTR-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)),
          timestamp: timestamp || new Date().toISOString()
        };

        // Add to beginning of array so newest is at the top
        winners.unshift(newEntry);
        saveWinners(winners);

        const prizeName = newEntry.prize.name || newEntry.prize;
        console.log(`[SPIN LOGGED] ${newEntry.name} (${newEntry.email}) won: ${prizeName} [Code: ${newEntry.claimCode}]`);

        return sendJson(res, 201, {
          success: true,
          message: 'Winner record stored successfully!',
          entry: newEntry
        });
      } catch (err) {
        return sendJson(res, 400, { success: false, message: 'Invalid JSON payload.' });
      }
    });
    return;
  }

  // API ROUTE: GET /api/export-csv
  if (pathname === '/api/export-csv' && method === 'GET') {
    const winners = readWinners();
    const headers = ['Record ID', 'Full Name', 'Email Address', 'Phone Number', 'Prize Won', 'Claim Code', 'Date & Time'];
    const rows = winners.map(w => [
      `"${w.id || ''}"`,
      `"${(w.name || '').replace(/"/g, '""')}"`,
      `"${(w.email || '').replace(/"/g, '""')}"`,
      `"${(w.phone || '').replace(/"/g, '""')}"`,
      `"${(w.prize && w.prize.name ? w.prize.name : (w.prize || '')).replace(/"/g, '""')}"`,
      `"${(w.claimCode || '').replace(/"/g, '""')}"`,
      `"${w.timestamp ? new Date(w.timestamp).toLocaleString() : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="spin_winners_${Date.now()}.csv"`,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(csvContent);
  }

  // API ROUTE: DELETE /api/winners
  if (pathname === '/api/winners' && method === 'DELETE') {
    saveWinners([]);
    return sendJson(res, 200, { success: true, message: 'All winner records cleared.' });
  }

  // STATIC FILE SERVING
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🎡 Xtreme Lucky Spin Game running at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`📊 Winner records saved automatically to:`);
  console.log(`   👉 ${DATA_FILE}`);
  console.log(`=================================================`);
});

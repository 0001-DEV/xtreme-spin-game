const { readWinners, saveWinners } = require('./_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name, email, phone, prize, claimCode, timestamp } = payload;

    if (!name || !email || !phone || !prize) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and prize are required fields.'
      });
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

    return res.status(201).json({
      success: true,
      message: 'Winner record stored successfully!',
      entry: newEntry
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
  }
};

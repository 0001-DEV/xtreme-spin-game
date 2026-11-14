const { readWinners, saveWinners } = require('./_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const winners = readWinners();
    return res.status(200).json({
      success: true,
      count: winners.length,
      data: winners
    });
  }

  if (req.method === 'DELETE') {
    saveWinners([]);
    return res.status(200).json({
      success: true,
      message: 'All winner records cleared.'
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};

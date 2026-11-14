/**
 * XTREME LUCKY SPIN WHEEL GAME
 * Features:
 * - Dynamic 8-segment prize wheel with custom placeholder gift objects (Bottles, Tech, Vouchers)
 * - Strict lead validation (Name, Email, Phone) before spinning
 * - Real physics-based deceleration animation + audio clicks
 * - Full celebration modal with confetti explosion
 * - Dual-layer automatic persistence (Server API + LocalStorage)
 * - Real-time Congratulations Table & CSV Export
 */

// ========================================================
// 1. PRIZE POOL CONFIGURATION
// ========================================================
const PRIZES = [
  {
    id: 1,
    name: 'Stainless Thermal Bottle',
    shortName: 'Thermal Bottle',
    icon: '🍾',
    value: '$38.00',
    color: '#e61e2b',
    desc: 'Premium double-wall vacuum insulated 750ml water bottle. Keeps drinks cold for 24h & hot for 12h!'
  },
  {
    id: 2,
    name: 'Wireless Earbuds Pro',
    shortName: 'Earbuds Pro',
    icon: '🎧',
    value: '$69.00',
    color: '#ff5722',
    desc: 'Active Noise Cancelling Bluetooth 5.3 earbuds with 36-hour charging case & deep bass.'
  },
  {
    id: 3,
    name: 'Smart Fitness Watch',
    shortName: 'Smart Watch',
    icon: '⌚',
    value: '$85.00',
    color: '#b71c1c',
    desc: 'AMOLED display, 24/7 heart-rate tracking, sleep analyzer, and 5ATM waterproof casing.'
  },
  {
    id: 4,
    name: '$100 Shopping Voucher',
    shortName: '$100 Credit',
    icon: '🎁',
    value: '$100.00',
    color: '#ff8f00',
    desc: 'Instant $100 store shopping credit automatically unlocked for your next order.'
  },
  {
    id: 5,
    name: 'Waterproof Travel Backpack',
    shortName: 'Travel Backpack',
    icon: '🎒',
    value: '$55.00',
    color: '#c2185b',
    desc: 'Ergonomic anti-theft laptop backpack with built-in USB charging port & weatherproofing.'
  },
  {
    id: 6,
    name: '20,000mAh Fast Power Bank',
    shortName: 'Power Bank',
    icon: '⚡',
    value: '$49.00',
    color: '#e65100',
    desc: '65W Power Delivery high-speed portable battery bank for smartphones, tablets, and laptops.'
  },
  {
    id: 7,
    name: 'Smart Temperature Mug',
    shortName: 'Smart Mug',
    icon: '☕',
    value: '$45.00',
    color: '#880e4f',
    desc: 'Self-heating ceramic travel mug with precision temperature touch control and charging coaster.'
  },
  {
    id: 8,
    name: 'Mega Mystery Gift Box',
    shortName: 'Mystery Box',
    icon: '📦',
    value: '$120.00',
    color: '#ff6f00',
    desc: 'Exclusive mystery bundle loaded with 3 top trending smart gadgets and accessories!'
  }
];

// ========================================================
// 2. WEB AUDIO SOUND SYNTHESIZER (No external files needed)
// ========================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playWinFanfare() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + idx * 0.12;
        const dur = idx === notes.length - 1 ? 0.7 : 0.25;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// ========================================================
// 3. CANVAS WHEEL CONTROLLER
// ========================================================
class SpinWheel {
  constructor(canvasId, pointerId, ledRingId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.pointer = document.getElementById(pointerId);
    this.ledRing = document.getElementById(ledRingId);

    this.numSlices = PRIZES.length;
    this.sliceAngle = (2 * Math.PI) / this.numSlices;

    this.currentRotation = 0; // In radians
    this.isSpinning = false;
    this.lastTickSegment = -1;

    this.setupLEDs();
    this.draw();
  }

  setupLEDs() {
    if (!this.ledRing) return;
    this.ledRing.innerHTML = '';
    const numBulbs = 24;
    const radius = 275; // Outside canvas
    const center = 280;

    for (let i = 0; i < numBulbs; i++) {
      const angle = (i * 2 * Math.PI) / numBulbs;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      const bulb = document.createElement('div');
      bulb.className = 'led-bulb';
      bulb.style.left = `${(x / 560) * 100}%`;
      bulb.style.top = `${(y / 560) * 100}%`;
      this.ledRing.appendChild(bulb);
    }
  }

  draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const center = width / 2;
    const radius = center - 16;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(this.currentRotation);

    // 1. Draw outer gold decorative rim
    ctx.beginPath();
    ctx.arc(0, 0, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#b8860b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#59000a';
    ctx.fill();

    // 2. Draw Wheel Slices
    for (let i = 0; i < this.numSlices; i++) {
      const startAngle = i * this.sliceAngle;
      const endAngle = startAngle + this.sliceAngle;
      const prize = PRIZES[i];

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Subtle radial gradient per slice
      const grad = ctx.createRadialGradient(0, 0, 40, 0, 0, radius);
      grad.addColorStop(0, '#fff2b3');
      grad.addColorStop(0.35, prize.color);
      grad.addColorStop(1, '#3b0008');

      ctx.fillStyle = grad;
      ctx.fill();

      // Golden separator line
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner decorative border arc
      ctx.beginPath();
      ctx.arc(0, 0, radius - 8, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Slice Text & Icon
      ctx.save();
      ctx.rotate(startAngle + this.sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // 1. Prize Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px Outfit, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
      ctx.fillText(prize.shortName, radius - 60, 0);

      // 2. Prize Icon / Emoji
      ctx.font = '32px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';
      ctx.fillText(prize.icon, radius - 15, 0);

      // 3. Mini Value tag
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(prize.value, radius - 60, 18);

      ctx.restore();
    }

    // Outer rim golden pegs
    for (let i = 0; i < this.numSlices * 2; i++) {
      const pegAngle = (i * Math.PI) / this.numSlices;
      const px = (radius + 2) * Math.cos(pegAngle);
      const py = (radius + 2) * Math.sin(pegAngle);

      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Spin animation with smooth cubic-bezier easing
   * @param {number} targetPrizeIndex 
   * @param {function} onComplete 
   */
  spinTo(targetPrizeIndex, onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Pointer is located at top = 270 degrees = 3*Math.PI / 2
    // We want targetPrizeIndex slice center to align with top pointer at stop
    const targetSliceAngle = targetPrizeIndex * this.sliceAngle + this.sliceAngle / 2;
    const topPointerAngle = (3 * Math.PI) / 2;

    // Current angle normalized [0, 2*PI]
    const currentNorm = this.currentRotation % (2 * Math.PI);

    // Number of full rotations for excitement (5 to 7 full circles)
    const extraSpins = 6 * 2 * Math.PI;

    // Calculate delta needed to align target slice with top pointer
    let targetRotation = topPointerAngle - targetSliceAngle;
    while (targetRotation < currentNorm) {
      targetRotation += 2 * Math.PI;
    }

    const finalAngle = targetRotation + extraSpins;
    const startAngle = this.currentRotation;
    const totalDelta = finalAngle - startAngle;

    const duration = 5200; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 4);

      this.currentRotation = startAngle + totalDelta * easeOut;
      this.draw();

      // Sound & Needle Tick check
      // Compute which segment currently passes under pointer
      const normalizedRot = (this.currentRotation + Math.PI / 2) % (2 * Math.PI);
      const currentSegment = Math.floor((normalizedRot / (2 * Math.PI)) * (this.numSlices * 2));

      if (currentSegment !== this.lastTickSegment) {
        this.lastTickSegment = currentSegment;
        sfx.playTick();
        if (this.pointer) {
          this.pointer.classList.add('tick-bounce');
          setTimeout(() => this.pointer.classList.remove('tick-bounce'), 50);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        if (onComplete) onComplete(PRIZES[targetPrizeIndex]);
      }
    };

    requestAnimationFrame(animate);
  }
}

// ========================================================
// 4. DATA PERSISTENCE & LEADERBOARD STORE
// ========================================================
class WinnerStore {
  constructor() {
    this.localStorageKey = 'xtreme_spin_winners_data';
  }

  // Get all winners (from LocalStorage or fallback)
  getLocalWinners() {
    try {
      // Check current key, then legacy key
      const saved = localStorage.getItem(this.localStorageKey) || localStorage.getItem('spin_winners_data');
      if (saved) return JSON.parse(saved);
      // Seed with initial records on very first run
      const initialSeed = [
        {
          id: 'WIN-M5L9K1-742',
          name: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          phone: '+1 (555) 014-8821',
          prize: PRIZES[0], // Stainless Thermal Bottle
          claimCode: 'XTR-7K9A-4821',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'WIN-M5L8Z3-195',
          name: 'Marcus Brody',
          email: 'm.brody@example.com',
          phone: '+1 (555) 019-3342',
          prize: PRIZES[3], // $100 Shopping Voucher
          claimCode: 'XTR-2X9B-6184',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      localStorage.setItem(this.localStorageKey, JSON.stringify(initialSeed));
      return initialSeed;
    } catch (e) {
      return [];
    }
  }

  // Save new winner to LocalStorage
  saveLocal(entry) {
    const list = this.getLocalWinners();
    list.unshift(entry);
    localStorage.setItem(this.localStorageKey, JSON.stringify(list));
    return list;
  }

  // Clear LocalStorage
  clearLocal() {
    localStorage.removeItem(this.localStorageKey);
  }

  // Sync to Backend Server (if running)
  async saveToServer(entry) {
    try {
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Server not running; client-side storage is active
      console.log('Running in standalone/browser mode (LocalStorage active).');
    }
    return null;
  }

  // Fetch from server if online, else return local
  async getAll() {
    try {
      const res = await fetch('/api/winners');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          // Sync to localStorage
          localStorage.setItem(this.localStorageKey, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (e) {
      // offline fallback
    }
    return this.getLocalWinners();
  }

  async clearAll() {
    this.clearLocal();
    try {
      await fetch('/api/winners', { method: 'DELETE' });
    } catch (e) {}
  }
}

const store = new WinnerStore();

// ========================================================
// 5. APPLICATION ORCHESTRATION & DOM LOGIC
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const form = document.getElementById('spinForm');
  const nameInput = document.getElementById('userName');
  const emailInput = document.getElementById('userEmail');
  const phoneInput = document.getElementById('userPhone');
  const formSpinBtn = document.getElementById('formSpinBtn');
  const centerSpinHub = document.getElementById('centerSpinHub');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');

  // Modal References
  const winModalOverlay = document.getElementById('winModalOverlay');
  const closeWinModal = document.getElementById('closeWinModal');
  const winWinnerName = document.getElementById('winWinnerName');
  const winPrizeIcon = document.getElementById('winPrizeIcon');
  const winPrizeName = document.getElementById('winPrizeName');
  const winPrizeValue = document.getElementById('winPrizeValue');
  const winPrizeDesc = document.getElementById('winPrizeDesc');
  const winClaimCode = document.getElementById('winClaimCode');
  const winWinnerDetails = document.getElementById('winWinnerDetails');
  const winTimestamp = document.getElementById('winTimestamp');
  const btnClaimPrize = document.getElementById('btnClaimPrize');
  const btnViewTable = document.getElementById('btnViewTable');

  // Table References
  const winnersTableBody = document.getElementById('winnersTableBody');
  const totalWinnersCount = document.getElementById('totalWinnersCount');
  const tableSearch = document.getElementById('tableSearch');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const winnersSection = document.getElementById('winnersSection');

  // Initialize Canvas Spin Wheel
  const wheel = new SpinWheel('wheelCanvas', 'wheelPointer', 'ledRing');

  // Load and Render Existing Winners
  loadAndRenderWinners();

  // Start Urgency Countdown
  startCountdown(4 * 60 + 59);

  // ----------------------------------------------------
  // Form Validation
  // ----------------------------------------------------
  function validateForm() {
    let isValid = true;

    // Name Validation
    if (!nameInput.value.trim()) {
      nameInput.classList.add('input-error');
      nameError.classList.add('visible');
      isValid = false;
    } else {
      nameInput.classList.remove('input-error');
      nameError.classList.remove('visible');
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('input-error');
      emailError.classList.add('visible');
      isValid = false;
    } else {
      emailInput.classList.remove('input-error');
      emailError.classList.remove('visible');
    }

    // Phone Validation
    const phoneClean = phoneInput.value.replace(/[^0-9]/g, '');
    if (phoneClean.length < 7) {
      phoneInput.classList.add('input-error');
      phoneError.classList.add('visible');
      isValid = false;
    } else {
      phoneInput.classList.remove('input-error');
      phoneError.classList.remove('visible');
    }

    return isValid;
  }

  // Clear validation on input
  [nameInput, emailInput, phoneInput].forEach(inp => {
    inp.addEventListener('input', () => {
      inp.classList.remove('input-error');
      const err = inp.parentElement.querySelector('.error-msg');
      if (err) err.classList.remove('visible');
    });
  });

  // ----------------------------------------------------
  // Spin Trigger Handler
  // ----------------------------------------------------
  function handleSpinRequest(e) {
    if (e) e.preventDefault();

    if (wheel.isSpinning) return;

    // Ensure audio context is ready on user gesture
    sfx.init();

    if (!validateForm()) {
      // Scroll to form if on mobile or out of view
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInput.focus();
      return;
    }

    // Disable buttons during spin
    formSpinBtn.disabled = true;
    centerSpinHub.style.pointerEvents = 'none';

    // Pick a winning prize
    // We can weight or randomize evenly across prizes
    // For realistic feel, randomize from PRIZES array
    const targetPrizeIndex = Math.floor(Math.random() * PRIZES.length);

    wheel.spinTo(targetPrizeIndex, async (wonPrize) => {
      // Spin finished!
      formSpinBtn.disabled = false;
      centerSpinHub.style.pointerEvents = 'auto';

      // Play victory sound
      sfx.playWinFanfare();

      // Launch Confetti
      launchConfetti();

      // Generate unique claim code
      const claimCode = 'XTR-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      const timestamp = new Date().toISOString();

      const winnerRecord = {
        id: 'WIN-' + Date.now().toString(36).toUpperCase(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        prize: wonPrize,
        claimCode: claimCode,
        timestamp: timestamp
      };

      // 1. Save locally
      store.saveLocal(winnerRecord);

      // 2. Save to server backend
      await store.saveToServer(winnerRecord);

      // 3. Update table
      loadAndRenderWinners();

      // 4. Show Congratulations Modal
      showCongratulationsModal(winnerRecord);

      // 5. Automatically reset input form to blank for the next person!
      resetFormToBlank();
    });
  }

  // Helper to blank out the form inputs for the next player
  function resetFormToBlank() {
    form.reset();
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    [nameInput, emailInput, phoneInput].forEach(inp => {
      inp.classList.remove('input-error');
      const err = inp.parentElement.querySelector('.error-msg');
      if (err) err.classList.remove('visible');
    });
  }



  // Attach triggers
  form.addEventListener('submit', handleSpinRequest);
  centerSpinHub.addEventListener('click', handleSpinRequest);

  // ----------------------------------------------------
  // Congratulations Modal Display (Clean & Direct)
  // ----------------------------------------------------
  function showCongratulationsModal(record) {
    if (winWinnerName) winWinnerName.textContent = record.name;
    if (winPrizeIcon) winPrizeIcon.textContent = record.prize.icon;
    if (winPrizeName) winPrizeName.textContent = record.prize.name;

    winModalOverlay.classList.add('active');
  }

  function hideModal() {
    winModalOverlay.classList.remove('active');
    resetFormToBlank();
  }

  if (closeWinModal) closeWinModal.addEventListener('click', hideModal);
  if (winModalOverlay) {
    winModalOverlay.addEventListener('click', (e) => {
      if (e.target === winModalOverlay) hideModal();
    });
  }

  if (btnClaimPrize) {
    btnClaimPrize.addEventListener('click', () => {
      hideModal();
    });
  }

  if (btnViewTable) {
    btnViewTable.addEventListener('click', () => {
      hideModal();
      winnersSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ----------------------------------------------------
  // Confetti Explosion
  // ----------------------------------------------------
  function launchConfetti() {
    if (typeof confetti !== 'function') return;

    // Left cannon
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#ffd700', '#ff3d00', '#ffffff', '#e61e2b']
    });

    // Right cannon
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#ffd700', '#ff3d00', '#ffffff', '#e61e2b']
    });

    // Center starburst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 }
      });
    }, 250);
  }

  // ----------------------------------------------------
  // Render Congratulations / Winners Table
  // ----------------------------------------------------
  let allWinnersCache = [];

  async function loadAndRenderWinners() {
    allWinnersCache = await store.getAll();
    renderFilteredTable();
  }

  function renderFilteredTable() {
    const searchTerm = (tableSearch.value || '').toLowerCase().trim();
    const filtered = allWinnersCache.filter(w => {
      const prizeTitle = (w.prize && w.prize.name) ? w.prize.name : (w.prize || '');
      return (
        (w.name || '').toLowerCase().includes(searchTerm) ||
        (w.email || '').toLowerCase().includes(searchTerm) ||
        (w.phone || '').includes(searchTerm) ||
        (w.claimCode || '').toLowerCase().includes(searchTerm) ||
        prizeTitle.toLowerCase().includes(searchTerm)
      );
    });

    totalWinnersCount.textContent = allWinnersCache.length;

    if (filtered.length === 0) {
      winnersTableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">
            <div class="empty-state">
              <span class="empty-icon">${allWinnersCache.length === 0 ? '🎡' : '🔍'}</span>
              <p>${allWinnersCache.length === 0 ? 'No spins yet! Enter your details above and take your first spin.' : 'No matching winners found for your search.'}</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    winnersTableBody.innerHTML = filtered.map((w, index) => {
      const prizeName = w.prize && w.prize.name ? w.prize.name : (w.prize || 'Special Gift');
      const prizeIcon = w.prize && w.prize.icon ? w.prize.icon : '🎁';
      const formattedDate = w.timestamp ? new Date(w.timestamp).toLocaleString() : 'Just now';

      return `
        <tr>
          <td><strong>#${index + 1}</strong></td>
          <td>
            <div style="font-weight: 700; color: #fff;">${escapeHtml(w.name || 'Anonymous')}</div>
          </td>
          <td>
            <span class="prize-badge">${prizeIcon} ${escapeHtml(prizeName)}</span>
          </td>
          <td>
            <span class="code-pill">${escapeHtml(w.claimCode || 'CLAIM-CODE')}</span>
          </td>
          <td>${escapeHtml(w.email || '-')}</td>
          <td>${escapeHtml(w.phone || '-')}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${formattedDate}</td>
          <td>
            <span class="status-won-pill">✅ WON & LOGGED</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  tableSearch.addEventListener('input', renderFilteredTable);

  // ----------------------------------------------------
  // Export CSV Action
  // ----------------------------------------------------
  btnExportCsv.addEventListener('click', () => {
    if (allWinnersCache.length === 0) {
      alert('There are no winner records to export yet. Take a spin first!');
      return;
    }

    const headers = ['Record ID', 'Full Name', 'Email Address', 'Phone Number', 'Prize Won', 'Claim Code', 'Date & Time'];
    const rows = allWinnersCache.map(w => [
      `"${w.id || ''}"`,
      `"${(w.name || '').replace(/"/g, '""')}"`,
      `"${(w.email || '').replace(/"/g, '""')}"`,
      `"${(w.phone || '').replace(/"/g, '""')}"`,
      `"${(w.prize && w.prize.name ? w.prize.name : (w.prize || '')).replace(/"/g, '""')}"`,
      `"${(w.claimCode || '').replace(/"/g, '""')}"`,
      `"${w.timestamp ? new Date(w.timestamp).toLocaleString() : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `xtreme_spin_winners_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // ----------------------------------------------------
  // Clear History Action
  // ----------------------------------------------------
  btnClearHistory.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all winner records from the Congratulations Table?')) {
      await store.clearAll();
      loadAndRenderWinners();
    }
  });

  // ----------------------------------------------------
  // Countdown Timer
  // ----------------------------------------------------
  function startCountdown(seconds) {
    const timerEl = document.getElementById('countdownTimer');
    let remaining = seconds;

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) remaining = 300; // loop
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      if (timerEl) {
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  // Helper
  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});

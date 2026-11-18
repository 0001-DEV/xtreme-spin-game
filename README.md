# 🎡 Xtreme Lucky Spin & Win Prize Game

An interactive, high-conversion Lucky Spin Wheel Game.

Players enter their **Full Name**, **Email Address**, and **Phone Number** into their **Xtreme VIP Card** before spinning. Once they spin, the wheel slows down with realistic physics and sound, celebrates with a **full-screen confetti explosion**, displays a **Congratulations Modal**, and **automatically logs the results into the Congratulations Table and database**.

---

## 🚀 Quick Start (2 Ways to Run)

### Option 1: Instant Browser Mode (No Setup Required)
You can directly double-click or open **`index.html`** in any web browser (Chrome, Edge, Firefox, Safari).
- Works 100% offline.
- All winner data is automatically saved to your browser's `localStorage`.
- You can export the winner leads to CSV anytime with 1 click.

### Option 2: Full Server Mode (Zero External NPM Dependencies)
Run the built-in Node.js server to enable persistent backend disk storage:

```bash
# Start the server (runs natively with zero npm dependencies)
npm run dev
# or
npm start
```

Then visit: **`http://localhost:3000`** in your browser.
All spins will be automatically recorded to **`data/winners.json`** on your disk!

---

## 🎁 Spin Wheel Prizes & Winning Odds

The wheel is configured with 6 segments and probability-weighted outcomes:

1. 🏷️ **20% off card order** — ~12.5% chance (Weight: 30)
2. 🔥 **30% off card order** — ~12.5% chance (Weight: 30)
3. 🪪 **Free ID card sample** — ~12.5% chance (Weight: 30)
4. 📓 **Vintage Notepad** — ~12.5% chance (Weight: 30)
5. 🍾 **Water bottle** — ~16.7% chance (Weight: 40)
6. 🔄 **Try again** — ~33.3% chance (Weight: 80)

*To customize prizes or probabilities, edit the `PRIZES` array and weights in `script.js`.*

---

## ✨ Features

- **Xtreme VIP Card Form**: Styled after the premium metal card from the Xtreme Card website, requiring player's Full Name, Email, and Phone Number with real-time validation.
- **Realistic Canvas Wheel**: 8 colorful slices, golden dividers, outer LED blinking bulbs, and a top golden needle indicator.
- **Physics Easing & Audio Clicks**: Realistic deceleration easing and ticker sounds synthesized with Web Audio API (zero external audio files needed).
- **Celebratory Win Experience**: Confetti fireworks burst, victory fanfare chime, and a glowing Congratulations Modal showing the winner's name, item won, estimated value, and unique claim code.
- **Automatic Congratulations Table**:
  - Live table listing every spin with Name, Email, Phone, Prize Won, Claim Code, and Date & Time.
  - Live search bar to filter by name, email, or prize.
  - **1-Click "Export CSV"** button to download leads directly into Excel or Google Sheets.
  - Clear Log option with safety confirmation.
- **Dual Persistence**:
  - Automatically saves in browser (`localStorage`).
  - Automatically posts to backend server API (`/api/spin`) and saves to `data/winners.json`.

---

## 📁 File Structure

```
SPIN GAME/
├── index.html           # Main game interface and Congratulations Table
├── style.css            # Xtreme luxury theme & animations
├── script.js            # Canvas wheel math, physics, audio synth, and storage logic
├── dev-server.js        # Native Node.js backend (serves app & saves data/winners.json)
├── package.json         # Project metadata and start script
├── README.md            # Documentation and instructions
├── assets/              # Xtreme Card images and assets
│   ├── bcard.jpg
│   ├── black-matte-metal.webp
│   └── xtreme-card.jpeg
└── data/
    └── winners.json     # Permanent JSON database file for winner logs
```

---

## 📊 Exporting Winner Leads
Click the **"📥 Export CSV"** button on the Congratulations Table at any time to download a formatted spreadsheet (`.csv`) containing:
- Record ID
- Full Name
- Email Address
- Phone Number
- Prize Won
- Claim Code
- Date & Time

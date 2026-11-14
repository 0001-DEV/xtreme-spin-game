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

## 🎁 Included Placeholder Gift Objects

The wheel comes pre-configured with 8 exciting prizes, including bottles and trending gadgets:

1. 🍾 **Stainless Thermal Bottle** — 750ml double-wall vacuum insulated flask (Worth $38.00)
2. 🎧 **Wireless Earbuds Pro** — ANC Bluetooth 5.3 earbuds with 36h battery (Worth $69.00)
3. ⌚ **Smart Fitness Watch** — AMOLED screen with 24/7 heart-rate tracking (Worth $85.00)
4. 🎁 **$100 Shopping Voucher** — Instant store credit coupon (Worth $100.00)
5. 🎒 **Waterproof Travel Backpack** — Anti-theft laptop bag with USB port (Worth $55.00)
6. ⚡ **20,000mAh Power Bank** — 65W fast-charging portable charger (Worth $49.00)
7. ☕ **Smart Temperature Mug** — Self-heating travel mug with temp controls (Worth $45.00)
8. 📦 **Mega Mystery Gift Box** — Curated surprise tech accessories bundle (Worth $120.00)

*To customize prizes, simply edit the `PRIZES` array in `app.js`.*

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
├── app.js               # Canvas wheel math, physics, audio synth, and storage logic
├── server.js            # Native Node.js backend (serves app & saves data/winners.json)
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

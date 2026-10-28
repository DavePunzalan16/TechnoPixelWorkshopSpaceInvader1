# TECHNOPIXEL SPACE INVADERS

> **Defend the Grid. Save the Pixelverse.**

A complete browser-based Space Invaders game built with vanilla HTML5, CSS3, and JavaScript (Canvas API). Created for the TechNoPixel Web Game Development Workshop — Day 1.

**Workshop Date:** December 10, 2026  
**Created by:** Dave Punzalan · TECHNOPIXEL

---

## What Is This Game?

TECHNOPIXEL SPACE INVADERS is a polished arcade game featuring:

- A cinematic loading screen with falling katakana-code animation
- A branded landing page with instructions, enemy types, power-ups, and storyline
- 5 progressively harder waves of Space Invaders gameplay
- 4 formation enemy types and 4 side-sweeping enemy types
- 5 power-up types (Extra Life, Shield, Multishot, Big Bullet, Rapid Shot)
- Background music + synthesized sound effects
- Fullscreen support and mobile touch controls (virtual joystick + fire button)
- Persistent high score via localStorage
- Beginner-friendly commented source code for live teaching

---

## How to Run Locally

### Option 1 — Direct Browser Open (simplest)

1. Open File Explorer and navigate to this folder.
2. Double-click **`index.html`**.
3. It opens in your default browser. The game loads immediately.

> ⚠️ Some browsers (Firefox, Chrome) may block local audio autoplay. Click the **MUSIC** button in the navbar to start music manually after the page loads.

### Option 2 — VS Code Live Server (recommended for development)

1. Open this folder in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if you haven't already.
3. Right-click `index.html` in the file explorer panel.
4. Select **"Open with Live Server"**.
5. Your browser opens at `http://127.0.0.1:5500` — audio, fonts, and all assets work perfectly.

### Option 3 — Python Simple HTTP Server

If you have Python installed, open a terminal in this folder and run:

```bash
# Python 3
python -m http.server 8080

# Then open: http://localhost:8080
```

---

## Controls

| Input | Action |
|-------|--------|
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `Space` | Shoot |
| `P` | Pause / Resume |
| `F` | Toggle Fullscreen |
| `Enter` | Start / Restart |
| Touch Joystick | Move (mobile) |
| FIRE Button | Shoot (mobile) |

---

## Features

- **Loading Screen** — Katakana matrix animation, real asset-loading progress bar, smooth fade transition
- **Landing Page** — Hero section, navigation, How to Play, Enemy Types panel, Power-Ups panel, About / Storyline, Footer
- **Formation Enemies** — 4 types (Blue 10pts, Red 20pts, Green 50pts, Pink 100pts) in grid formation
- **Side Enemies** — 4 matching side-sweeper types entering from screen edges
- **5 Waves** — Each wave increases enemy speed, fire rate, and side enemy count
- **5 Power-Ups** — Drop at 20% chance on enemy death; timed effects last 8 seconds
- **Shield** — Absorbs 1 hit; visible as a glowing cyan ring
- **Invulnerability Cooldown** — 1.5 seconds after taking damage; prevents rapid life loss
- **Pause** — Freezes simulation; P key or mobile PAUSE button
- **Victory Screen** — After wave 5; shows score, high score, replay button
- **Game Over Screen** — Shows score, wave reached, high score, replay button
- **Music Control** — Available in navbar (landing) and in-game; plays `music.mp3`
- **Sound Effects** — Web Audio API synthesized: shoot, enemy die, player hit, power-up, wave clear, victory, game over
- **Mobile Controls** — Virtual analog joystick + FIRE button; auto-shown on touch devices
- **Fullscreen** — `F` key; uses browser Fullscreen API
- **High Score** — Saved to localStorage; displayed in hero and result screens
- **Responsive** — Works on desktop, tablet, and mobile

---

## Project File Structure

```
Samplegame/
├── index.html          ← Page structure, all screens, overlays, mobile controls
├── styles.css          ← TechNoPixel branding, layout, animations, responsive
├── game.js             ← All game logic (asset loading, update loop, rendering, audio)
├── README.md           ← This file
├── WORKSHOP_GUIDE.md   ← 150-minute instructor guide for live teaching
├── CODE_WALKTHROUGH.md ← How the code works (execution-order explanation)
├── ASSETS.md           ← Asset inventory, roles, and fallback notes
└── techassets/
    ├── Background.png       ← Retrowave purple space background (game backdrop)
    ├── TEXT.png             ← TECHNOPIXEL wordmark (square, dark-bg image)
    ├── Logo.png             ← Full logo composition
    ├── newLogo.png          ← Pixel emblem / favicon (480×480 with dark bg)
    ├── technospaceship.png  ← Player spaceship sprite
    ├── bullet.png           ← Player bullet projectile sprite
    ├── enemy1.png           ← Blue formation enemy (10 pts)
    ├── enemy2.png           ← Red formation enemy (20 pts)
    ├── enemy3.png           ← Green formation enemy (50 pts)
    ├── enemy4.png           ← Pink formation enemy (100 pts)
    ├── sidenemy1.png        ← Blue side-sweeper enemy
    ├── sidenemy2.png        ← Red side-sweeper enemy
    ├── sidenemy3.png        ← Green side-sweeper enemy
    ├── sidenemy4.png        ← Pink side-sweeper enemy
    └── music.mp3            ← Background soundtrack
```

---

## Troubleshooting

### Images don't appear / broken image icons

- Confirm you are running via a local server (VS Code Live Server or Python), not just double-clicking.
- Check the browser console (F12 → Console) for `ASSET NOT FOUND:` messages.
- Verify all filenames match exactly (capitalization matters): `Background.png`, `technospaceship.png`, etc.
- The game continues running even if images fail to load — colored shapes are used as fallbacks.

### No sound / music doesn't play

- Browsers block autoplay before a user gesture. **Click the MUSIC button** in the navbar after the page loads.
- If using Firefox, go to `about:preferences` → Privacy & Security → Autoplay → Allow Audio.
- If `music.mp3` fails to load, check the file exists at `techassets/music.mp3`. Sound effects (Web Audio API) work independently of the mp3.

### Game doesn't respond to keyboard

- Click on the game canvas area first to give it focus.
- If you're on the landing page, keyboard controls don't activate until you start the game.

### Game runs slowly or stutters

- Close other browser tabs.
- On mobile, ensure the browser has hardware acceleration enabled.
- Try Chrome or Edge for best Canvas performance.

### Fullscreen doesn't work

- Some browsers require HTTPS for Fullscreen API. Use the VS Code Live Server which serves on localhost (HTTPS not required).
- On mobile, fullscreen is handled by landscape orientation.

### "High score resets every session"

- Some browsers block localStorage in private/incognito mode. This is expected behavior — scores won't persist in private browsing.

### Power-up images show as emoji instead of images

Power-up images (`heart.png`, `shield.png`, `multishot.png`, `bigbulletmoto.png`, `rapidshot.png`) are all present in `techassets/`. If they fail to display, confirm the filenames match exactly — the Big Bullet file is `bigbulletmoto.png` (not `bigbullet.png`). The game falls back to emoji icons if any image fails to load.

---

## Known Limitations

- `TEXT.png` and `newLogo.png` have dark backgrounds (they are square images with filled backgrounds), so they are displayed using `object-fit: contain` rather than as transparent logos.
- Music autoplay requires a user gesture per browser policy — the MUSIC button triggers it.
- The Big Bullet power-up image file is named `bigbulletmoto.png` rather than the expected `bigbullet.png`; the code maps to the actual filename correctly.
- The game has not been tested on Internet Explorer (not supported).

---

*TECHNOPIXEL SPACE INVADERS · Created by Dave Punzalan · TechNoPixel · 2026*

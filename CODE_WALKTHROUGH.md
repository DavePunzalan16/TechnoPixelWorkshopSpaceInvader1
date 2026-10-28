# TECHNOPIXEL SPACE INVADERS — Code Walkthrough

> How the code works, in execution order. For instructors and students who want to understand the source before teaching or modifying it.

---

## Execution Order Overview

When you open `index.html` in a browser:

1. Browser parses `index.html`, builds the DOM (all the HTML elements).
2. Browser downloads and applies `styles.css` (visual layout).
3. Browser downloads and executes `game.js`.
4. `game.js` waits for `DOMContentLoaded` (step 1 complete).
5. Loading screen appears; asset loading starts.
6. When all assets load → landing page appears.
7. Player clicks START → game starts.
8. `requestAnimationFrame` loop runs ~60 times per second until the game ends.

---

## Part 1: `index.html` — Page Structure

The HTML is organized into three major `<div>` containers, each with class `screen`:

```html
<div id="loading-screen" class="screen active"> ... </div>
<div id="landing-screen" class="screen"> ... </div>
<div id="game-screen" class="screen"> ... </div>
```

Only the screen with class `active` is visible (CSS: `.screen { display: none }`, `.screen.active { display: block }`).

Inside `#game-screen`, there is:
- `<canvas id="game-canvas">` — where the game is drawn
- Overlay divs (`pause-overlay`, `wave-cleared-overlay`, `victory-overlay`, `gameover-overlay`) — shown/hidden via `.hidden` class
- `#mobile-controls` — virtual joystick + fire button (shown only on touch devices)
- `#powerup-hud` — active power-up display (HTML, not canvas)

---

## Part 2: `styles.css` — Visual Design

Key design decisions:

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-bg` | `#0d0020` | Deep violet page background |
| `--color-magenta` | `#ff2eff` | Primary accent (buttons, glow) |
| `--color-cyan` | `#00f5ff` | Secondary highlight |
| `--font-pixel` | Press Start 2P | All in-game and heading text |

The Canvas element is sized in CSS (`max-width: 100%; max-height: 100vh`) so it scales to the viewport. Its internal coordinate system (`width=800, height=600`) is set in JavaScript and never changes.

Overlays use `position: absolute; inset: 0` to cover the game canvas, with `backdrop-filter: blur(4px)` for the frosted glass effect.

Mobile controls (`.mobile-controls`) are hidden by default and shown via `.visible` class when a touch screen is detected.

---

## Part 3: `game.js` — The Game Engine

### Startup Sequence

Everything is wrapped in `DOMContentLoaded`:

```javascript
document.addEventListener('DOMContentLoaded', function () {
  // All game code lives here
});
```

This ensures the HTML elements (canvas, buttons, overlays) exist before JavaScript tries to find them.

---

### Configuration (`CONFIG` and `ASSETS`)

`CONFIG` is an object containing every tunable constant:

```javascript
const CONFIG = {
  CANVAS_W: 800,
  CANVAS_H: 600,
  PLAYER_SPEED: 4,
  PLAYER_BULLET_COOL: 300,   // ms between shots
  POWERUP_DROP_CHANCE: 0.20, // 20%
  // ... etc
};
```

`ASSETS.images` maps keys to file paths. `loadImage(key, url)` creates an `HTMLImageElement`, sets its `.src`, and stores it in `imgs[key]` on load. Missing files set `imgs[key] = null` and the renderer uses shape fallbacks.

**Important:** `totalAssets` and `loadedAssets` counters drive the loading progress bar. When `loadedAssets >= totalAssets`, `transitionToLanding()` is called after an 800ms delay.

---

### Matrix Animation

The falling katakana code effect uses a separate `<canvas id="matrix-canvas">` positioned behind the loading content via CSS (`z-index: 0`).

```javascript
function drawMatrix() {
  matrixCtx.fillStyle = 'rgba(13, 0, 32, 0.12)'; // Semi-transparent overlay creates trails
  matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

  for (let i = 0; i < matrixCols; i++) {
    const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    matrixCtx.fillText(char, i * 14, matrixDrops[i]);
    matrixDrops[i] += 14;
    if (matrixDrops[i] > matrixCanvas.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
  }
  matrixRafId = requestAnimationFrame(drawMatrix);
}
```

`stopMatrix()` cancels the animation frame when the loading screen transitions away, freeing CPU.

---

### Game State

`STATE` is a single string variable:

```javascript
let STATE = 'loading';
// Valid values: 'loading' | 'menu' | 'playing' | 'paused' | 'wave-cleared' | 'victory' | 'game-over'
```

The update loop (`update()`) returns immediately if `STATE !== 'playing'`, freezing the simulation.

The render loop (`render()`) always runs, so the canvas keeps drawing whatever is currently there (important for the pause screen — the game scene stays visible behind the overlay).

---

### The `player` Object

```javascript
const player = {
  x: 0, y: 0,           // Position (set in initGame)
  w: 56, h: 56,         // Size
  speed: 4,             // Pixels per frame
  lives: 3, score: 0, wave: 1,
  shieldActive: false,  // Power-up flags
  multishot: false,
  bigBullet: false,
  rapidShot: false,
  multishotTimer: 0,    // Countdown timers (ms)
  bigBulletTimer: 0,
  rapidShotTimer: 0,
  lastShotTime: 0,      // Timestamp: when player last fired
  invulnUntil: 0,       // Timestamp: invulnerability window end
  hitFlash: 0,          // Visual feedback counter
};
```

`initGame()` resets all these to starting values and calls `spawnFormation(0)`.

---

### Keyboard Input

```javascript
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup',   e => keys[e.code] = false);
```

`keys` is a dictionary that tracks which keys are currently held. In `updatePlayer()`, these are checked every frame:

```javascript
let dx = 0;
if (keys['ArrowLeft']  || keys['KeyA']) dx = -1;
if (keys['ArrowRight'] || keys['KeyD']) dx =  1;
player.x += dx * player.speed;
player.x = Math.max(0, Math.min(CONFIG.CANVAS_W - player.w, player.x));
```

`Math.max(0, ...)` prevents going off the left edge. `Math.min(CANVAS_W - player.w, ...)` prevents going off the right edge.

Single-press actions (Start, Pause, Fullscreen) are handled in `handleKeyAction(code)` which is called from `keydown` — this avoids them firing every frame.

---

### Touch Input

A virtual joystick uses pointer events:

```javascript
joystickBase.addEventListener('pointerdown', e => {
  touch.joystickStartX = e.clientX;
  touch.joystickActive = true;
});
joystickBase.addEventListener('pointermove', e => {
  touch.joystickDeltaX = Math.max(-36, Math.min(36, e.clientX - touch.joystickStartX));
});
joystickBase.addEventListener('pointerup', () => {
  touch.joystickActive = false;
  touch.joystickDeltaX = 0;
});
```

In `updatePlayer()`, if `|touch.joystickDeltaX| > 10`, it sets `dx` direction accordingly.

---

### How the Player Shoots

`firePlayerBullet()` creates bullet objects and pushes them onto the `bullets` array:

```javascript
function firePlayerBullet() {
  const bx = player.x + player.w / 2 - bulletW / 2; // Centered on player
  const by = player.y - bulletH;                     // Just above the player

  if (player.multishot) {
    bullets.push({ x: bx,      y: by, angle: 0,    ... });
    bullets.push({ x: bx - 18, y: by, angle: -0.12, ... });
    bullets.push({ x: bx + 18, y: by, angle:  0.12, ... });
  } else {
    bullets.push({ x: bx, y: by, angle: 0, ... });
  }
}
```

A cooldown prevents firing too fast:

```javascript
if (wantsToShoot && (now - player.lastShotTime) >= shootCooldown) {
  firePlayerBullet();
  player.lastShotTime = now;
}
```

`now` is the `DOMHighResTimeStamp` from `requestAnimationFrame` — it's in milliseconds and grows continuously.

`updateBullets()` moves bullets upward (`b.y -= CONFIG.BULLET_SPEED`) and removes them when they exit the top.

---

### Enemy Formation

`spawnFormation(waveIdx)` builds the grid:

```javascript
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    // Row 0 = pink (100 pts), row 1 = green (50), row 2 = red (20), row 3+ = blue (10)
    enemies.push({ x: startX + col * (W + gap), y: startY + row * (H + gap), type: typeIndex, alive: true });
  }
}
```

`updateEnemies()` moves the whole formation. It finds the min/max x of all alive enemies, then checks if the formation has hit a wall:

```javascript
if (hitRight || hitLeft) {
  formationDir *= -1;            // Reverse direction
  for (const e of aliveEnemies) e.y += CONFIG.ENEMY_DROP; // Drop down
} else {
  for (const e of aliveEnemies) e.x += formationSpeedX * formationDir;
}
```

Enemy shooting: once per `shootDelay` ms, a random alive enemy fires a projectile:

```javascript
const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
enemyBullets.push({ x: shooter.x + shooter.w/2 - 4, y: shooter.y + shooter.h, w: 8, h: 16, speed: 3.5 });
```

---

### Side Enemies

`spawnSideEnemy()` creates an enemy with horizontal velocity:

```javascript
sideEnemies.push({
  x: goRight ? -SIDE_ENEMY_W - 10 : CONFIG.CANVAS_W + 10,
  vx: goRight ? speed : -speed,  // Positive = right, negative = left
  type: sType,
});
```

`updateSideEnemies()` moves them by `vx` each frame and removes them when they exit the opposite side. Side enemies are spawned at intervals controlled by `SIDE_ENEMY_INTERVAL / waveData.speedMult`.

---

### Collision Detection

`rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh)` returns `true` when two rectangles intersect:

```javascript
return ax < bx + bw &&   // A's left is before B's right
       ax + aw > bx  &&  // A's right is past B's left
       ay < by + bh &&   // A's top is before B's bottom
       ay + ah > by;     // A's bottom is past B's top
```

All four conditions must be true simultaneously for an overlap.

`checkCollisions(now)` runs three checks each frame:
1. **Player bullets vs. formation enemies** — kill enemy, add score, maybe drop power-up
2. **Player bullets vs. side enemies** — same
3. **Enemy bullets vs. player** — call `handlePlayerHit(now)`
4. **Player vs. power-ups** — call `applyPowerup(type)`

`handlePlayerHit()` checks `now < player.invulnUntil` to skip damage during invulnerability. If shield is active, the shield absorbs the hit instead.

---

### Power-Up System

`POWERUP_TYPES` array defines the five types:

```javascript
const POWERUP_TYPES = [
  { id: 'heart',     label: '❤️',  name: 'EXTRA LIFE',  color: '#ff4444' },
  { id: 'shield',    label: '🛡️', name: 'SHIELD',      color: '#00f5ff' },
  { id: 'multishot', label: '🔱',  name: 'MULTISHOT',   color: '#ff2eff' },
  { id: 'bigbullet', label: '💥',  name: 'BIG BULLET',  color: '#ffaa00' },
  { id: 'rapidshot', label: '⚡',  name: 'RAPID SHOT',  color: '#b44fff' },
];
```

`spawnPowerup(cx, cy)` picks a random type and creates a falling object. `updatePowerups()` moves them down. `applyPowerup(typeData)` applies the effect and resets duration timers.

Timed power-ups count down in `updatePlayer()`:

```javascript
player.multishotTimer -= 16; // ~1 frame at 60fps
if (player.multishotTimer <= 0) {
  player.multishot = false;
}
```

---

### Wave Progression

`checkWaveComplete()` runs every frame in `update()`:

```javascript
const aliveCount = enemies.filter(e => e.alive).length;
if (aliveCount === 0) triggerWaveCleared();
```

`triggerWaveCleared()` sets `STATE = 'wave-cleared'` and starts a `setInterval` countdown. When it reaches 0:
- If `player.wave >= CONFIG.TOTAL_WAVES` → `triggerVictory()`
- Otherwise: increment `player.wave`, call `spawnFormation(player.wave - 1)`, set `STATE = 'playing'`

`WAVE_DATA` array defines difficulty per wave:

```javascript
const WAVE_DATA = [
  { speedMult: 1.0, shootMult: 1.0, sideMax: 2, rows: 4, cols: 10 },
  { speedMult: 1.3, shootMult: 0.85, sideMax: 3, ... },
  // ... up to wave 5
];
```

Higher `speedMult` = faster formation. Lower `shootMult` = shorter delay between enemy shots (harder).

---

### The Render Loop

`render()` is called every frame regardless of `STATE`:

```javascript
function render() {
  ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  // Draw background image or fallback gradient
  if (imgs.background) {
    ctx.drawImage(imgs.background, 0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
  }

  // Dark overlay to ensure sprites are readable
  ctx.fillStyle = 'rgba(0, 0, 10, 0.35)';
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  drawHUD();

  if (STATE === 'playing' || STATE === 'paused' || STATE === 'wave-cleared') {
    drawEnemies();
    drawSideEnemies();
    drawBullets();
    drawEnemyBullets();
    drawPlayer();
    drawPowerups();
    drawParticles();
    drawPowerupNotification();
  }
}
```

Drawing order matters — things drawn later appear on top. The HUD is always drawn so the score is visible even on the game-over screen.

Enemies draw a glow effect using `ctx.shadowBlur`:

```javascript
ctx.shadowColor = '#7ec8ff';
ctx.shadowBlur = 8;
ctx.drawImage(img, e.x, e.y + bob, e.w, e.h);
ctx.shadowBlur = 0; // Always reset after — otherwise every subsequent draw inherits it
```

---

### Audio System

**Music:** Standard HTML `Audio` object:

```javascript
const bgMusic = new Audio('techassets/music.mp3');
bgMusic.loop   = true;
bgMusic.volume = 0.5;
bgMusic.play(); // Returns a Promise — .catch() handles autoplay blocks
```

**Sound effects:** Web Audio API oscillators generated on demand:

```javascript
function playSound(type) {
  const ac   = getAudioCtx();
  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.start(now);
  osc.stop(now + 0.1);
}
```

`getAudioCtx()` creates the `AudioContext` lazily (only when the first sound is needed) to comply with browser autoplay policy.

---

### The Main Game Loop

```javascript
function gameLoop(timestamp) {
  update(timestamp);   // Update all game state
  render();            // Draw the current frame
  animFrameId = requestAnimationFrame(gameLoop); // Schedule next frame
}
```

`requestAnimationFrame` calls the function before the browser's next screen repaint — typically 60 times per second.

`animFrameId` stores the ID so `cancelAnimationFrame(animFrameId)` can stop it when restarting or going to the menu. This prevents duplicate loops from accumulating.

---

### Restart Safety

`restartGame()` and `goToMenu()` both call:

```javascript
if (waveCountdownTimer) { clearInterval(waveCountdownTimer); waveCountdownTimer = null; }
if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
hideAllOverlays();
```

This ensures no old timers or loops remain active. `startGameLoop()` is called fresh with a new `requestAnimationFrame`.

---

### High Score

```javascript
// Load on startup
highScore = parseInt(localStorage.getItem('tp_hiscore') || '0', 10) || 0;

// Save when game ends
function saveHighScore() {
  if (player.score > highScore) {
    highScore = player.score;
    localStorage.setItem('tp_hiscore', highScore);
  }
}
```

Both calls are wrapped in `try/catch` because `localStorage` can throw in private browsing mode.

---

## Quick Reference: Key Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `STATE` | string | Current game state |
| `player` | object | All player data (pos, lives, score, power-ups) |
| `bullets` | array | Active player projectiles |
| `enemyBullets` | array | Active enemy projectiles |
| `enemies` | array | Formation enemy objects |
| `sideEnemies` | array | Side-sweeping enemy objects |
| `powerups` | array | Active falling power-up drops |
| `particles` | array | Explosion particle effects |
| `imgs` | object | Loaded HTMLImageElement instances |
| `keys` | object | Keyboard state (true = held) |
| `touch` | object | Joystick and fire button state |
| `animFrameId` | number | Current `requestAnimationFrame` ID |
| `formationDir` | number | 1 = right, -1 = left |
| `highScore` | number | Best score from localStorage |
| `puNotif` | object | Current power-up notification text + timer |

---

*TECHNOPIXEL SPACE INVADERS · Code Walkthrough · Created by Dave Punzalan · TechNoPixel · 2026*

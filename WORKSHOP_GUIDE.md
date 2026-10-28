# TECHNOPIXEL SPACE INVADERS — Workshop Instructor Guide

**TechNoPixel Web Game Development Workshop — Day 1**  
**Date:** December 10, 2026  
**Instructor:** Dave Punzalan · TECHNOPIXEL  
**Duration:** 4 hours total (30 min setup + 150 min coding + 30 min buffer/challenge)

---

## Learning Objectives

By the end of this workshop, students will be able to:

1. Explain the structure of a web game (HTML, CSS, JavaScript, Canvas).
2. Use variables, arrays, objects, and functions in JavaScript.
3. Implement a `requestAnimationFrame` game loop.
4. Move sprites using keyboard input.
5. Detect collisions between rectangles (AABB).
6. Update a score and manage lives.
7. Understand game states (menu, playing, paused, game over).
8. Describe how images and audio are loaded and used in the browser.

---

## Prerequisites

Students do NOT need prior JavaScript experience. Prior HTML/CSS basics are helpful but not required.

What to have ready:
- Each student has a computer with Chrome or Edge installed.
- VS Code installed with the **Live Server** extension.
- This project folder (`Samplegame/`) is already copied to each student machine OR accessible via a shared drive.
- Optionally: projector showing your screen for live coding demonstration.

---

## Introduction Script (5 minutes, before coding starts)

> "Today we're going to build a real browser game — from scratch. Not a toy example, not a simulation. A game you can actually play, show your friends, and put in a portfolio.
>
> We're using three tools you might already know: HTML to structure the page, CSS to make it look cool, and JavaScript to make things move and respond to you.
>
> The secret weapon is the HTML Canvas — think of it like a whiteboard inside your browser. Instead of writing text or clicking buttons, we draw directly onto it using JavaScript code.
>
> By the end of today, your browser will be running TECHNOPIXEL SPACE INVADERS."

Show the finished game running (pre-built version). Let students play for 2 minutes. Then say:

> "This is what we're going to build together. Let's go."

---

## Workshop Timeline: 150-Minute Coding Session

---

### STEP 1 — Project Setup and Test the Initial Page (10 min)

**Goal:** Every student has the project running in their browser.

**What to do:**
1. Open VS Code. File → Open Folder → select the `Samplegame/` folder.
2. Open `index.html`. Show the overall structure — loading screen, landing screen, game screen.
3. Right-click `index.html` → Open with Live Server.
4. The browser opens. Students should see the loading screen with the TechNoPixel logo and katakana animation.

**Concepts to explain:**
- "The browser reads `index.html` first, like the front page of a book."
- "It then fetches `styles.css` (the look) and `game.js` (the behavior)."
- "`<link>` and `<script>` tags connect these files."
- "The Canvas is a drawing surface — right now it's empty."

**Questions to ask:**
- *"What do you think HTML does?"* → Structure / skeleton of the page.
- *"What do you think JavaScript does?"* → Makes things interactive / move.

**Common mistakes:**
- Opening the file directly from File Explorer (not using Live Server) — fonts won't load, audio will be blocked.
- VS Code showing "Port 5500 is taken" — kill the existing server or change the port in settings.

---

### STEP 2 — Load and Draw the Game Assets (15 min)

**Focus area:** `game.js` — SECTION 1 (CONFIG, ASSETS) and SECTION 2 (Asset Loading)

**What to explain:**
- Open `game.js`. Scroll to `const CONFIG = { ... }`.
- "This is our settings panel. Every important number lives here."
- Scroll to `const ASSETS = { ... }`.
- "These are the file paths to our images. Think of ASSETS as a map — it tells JavaScript where to find each picture."

**Live demo — show what `loadImage` does:**

```javascript
function loadImage(key, url) {
  if (!url) { imgs[key] = null; return; }
  totalAssets++;
  const img = new Image();
  img.onload = function() {
    imgs[key] = img;
    loadedAssets++;
    updateLoadingProgress();
  };
  img.src = url;
}
```

- "We create a blank `Image` object, attach a function to run when it loads, then set `.src` to start downloading."
- "Once all images are loaded, `updateLoadingProgress` transitions us to the landing page."

**Key analogy:** "Loading assets is like putting ingredients on the counter before cooking. You don't start until everything is ready."

**Questions to ask:**
- *"Why do we wait for images to load before drawing?"* → If an image isn't ready, `drawImage()` draws nothing.
- *"What happens if a file is missing?"* → `img.onerror` fires, `imgs[key] = null`, we use a fallback shape.

**Checkpoint:** Students can see the loading screen transition to the landing page.

---

### STEP 3 — Player Movement and Keyboard Handling (20 min)

**Focus areas:** SECTION 4 (input) and SECTION 5 (player movement)

**What to explain — the `keys` object:**

```javascript
const keys = {};

window.addEventListener('keydown', function(e) {
  keys[e.code] = true;
});
window.addEventListener('keyup', function(e) {
  keys[e.code] = false;
});
```

- "Every time a key goes down, we store `true`. When it comes up, we store `false`."
- "It's like a light switch — pressed = on, released = off."
- "Each frame, we CHECK the switch. If it's on, we move."

**Show `updatePlayer`:**

```javascript
let dx = 0;
if (keys['ArrowLeft']  || keys['KeyA']) dx = -1;
if (keys['ArrowRight'] || keys['KeyD']) dx =  1;
player.x += dx * player.speed;
player.x = Math.max(0, Math.min(CONFIG.CANVAS_W - player.w, player.x));
```

- "dx is the direction: -1 left, 0 still, +1 right."
- "We multiply direction by speed to get how far we move."
- "The `Math.max/Math.min` line is the wall — it stops the player at the canvas edges."

**Draw the player — show `drawPlayer`:**

```javascript
ctx.drawImage(imgs.spaceship, player.x, player.y, player.w, player.h);
```

- "ctx is the painter. `drawImage` says: 'paint this image at these coordinates with this size.'"
- "x=0, y=0 is the TOP-LEFT corner of the canvas. x goes right, y goes down."

**Key analogy:** "The player object is a box. x,y is where the box sits. w,h is how big it is."

**Questions to ask:**
- *"What would happen if we didn't clamp the player position?"* → The ship would fly off the screen.
- *"Why do we check keys every frame instead of once on keydown?"* → So the ship moves smoothly while the key is held.

**Checkpoint:** Students can move the spaceship left and right using the keyboard.

---

### STEP 4 — Bullets and Enemy Formation (25 min)

**Focus areas:** SECTION 5 (shooting), SECTION 6 (enemies)

**Part A — Player bullets (12 min):**

Show `firePlayerBullet`:

```javascript
const bx = player.x + player.w / 2 - bulletW / 2;
const by = player.y - bulletH;
bullets.push({ x: bx, y: by, w: bulletW, h: bulletH, angle: 0, big: false });
```

- "bullets is an array — a list of bullet objects."
- "Each bullet is a box: x, y, width, height."
- "We center the bullet on the player by adding half the player width and subtracting half the bullet width."

Show `updateBullets`:

```javascript
for (let i = bullets.length - 1; i >= 0; i--) {
  bullets[i].y -= CONFIG.BULLET_SPEED;
  if (bullets[i].y + bullets[i].h < 0) {
    bullets.splice(i, 1);
  }
}
```

- "We loop backwards because we're removing items from the array while looping. If we looped forwards and removed index 3, old index 4 becomes index 3 and we'd skip it."
- "Bullets move up by subtracting from y (remember: y=0 is the top)."
- "When a bullet goes off the top, we splice (remove) it from the array."

**Part B — Enemy formation (13 min):**

Show `spawnFormation`:

```javascript
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    enemies.push({ x: startX + col * (ENEMY_W + gap), y: startY + row * (ENEMY_H + gap), type: typeIndex, alive: true });
  }
}
```

- "A nested loop — the outer loop goes through rows, the inner loop goes through columns."
- "For each position we create an enemy object and add it to the enemies array."

Show `updateEnemies` — wall detection:

```javascript
if (hitRight || hitLeft) {
  formationDir *= -1;      // Flip direction
  for (const e of aliveEnemies) {
    e.y += CONFIG.ENEMY_DROP; // Drop down
  }
}
```

- "When the formation hits a wall, we multiply the direction by -1 to reverse it, then drop all enemies down."
- "This is the classic Space Invaders mechanic."

**Questions to ask:**
- *"What does `bullets.splice(i, 1)` do?"* → Removes 1 item at index i from the array.
- *"Why do we loop backwards when removing items?"* → To avoid skipping items when indices shift.
- *"What does `formationDir *= -1` do?"* → Flips +1 to -1 or -1 to +1, reversing direction.

**Checkpoint:** Formation enemies appear and move. Player can fire bullets that travel upward.

---

### STEP 5 — Collision Detection, Score and Lives (20 min)

**Focus areas:** SECTION 8 (collisions), SECTION 9 (scoring)

**Show `rectsOverlap`:**

```javascript
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw &&
         ax + aw > bx &&
         ay < by + bh &&
         ay + ah > by;
}
```

- "This checks if two rectangles overlap. AABB = Axis-Aligned Bounding Box."
- "Four conditions must ALL be true for an overlap."
- "Think of it as: is there any gap between them? If no gap on any side — they're touching."

**Draw this on the board:** Two rectangles side by side. Label ax, ay, aw, ah. Ask "does A overlap B?"

Show the collision loop:

```javascript
for (let bi = bullets.length - 1; bi >= 0; bi--) {
  const b = bullets[bi];
  for (let ei = enemies.length - 1; ei >= 0; ei--) {
    const e = enemies[ei];
    if (!e.alive) continue;
    if (rectsOverlap(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
      e.alive = false;
      player.score += ENEMY_POINTS[e.type];
      bullets.splice(bi, 1);
      break;
    }
  }
}
```

- "We loop through every bullet and every enemy."
- "If `rectsOverlap` is true, we kill the enemy (`alive = false`), add to the score, and remove the bullet."
- "`break` stops checking more enemies for this bullet — one bullet, one hit."

Show `handlePlayerHit`:

```javascript
player.lives--;
player.invulnUntil = now + CONFIG.INVULN_DURATION;
if (player.lives <= 0) { triggerGameOver(); }
```

- "Invulnerability cooldown prevents losing several lives in the same instant."
- "`invulnUntil` is a timestamp. If `now < invulnUntil`, we skip damage."

**Questions to ask:**
- *"What would happen without the invulnerability cooldown?"* → The player could lose all lives in one collision frame.
- *"Why do we set `e.alive = false` instead of removing it from the array immediately?"* → Safer during iteration; the render skips `!e.alive` enemies.

**Checkpoint:** Bullets kill enemies, score increases, player loses lives when hit by enemy bullets.

---

### STEP 6 — Power-Up Drops and Effects (20 min)

**Focus areas:** SECTION 9 (power-ups)

Show `spawnPowerup`:

```javascript
const typeData = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
powerups.push({ x: cx - CONFIG.POWERUP_W/2, y: cy, w: ..., h: ..., type: typeData, vy: CONFIG.POWERUP_SPEED });
```

- "`Math.random()` gives a number between 0 and 1."
- "Multiplying by the array length and flooring gives a random valid index."

Show `applyPowerup`:

```javascript
if (typeData.id === 'heart') {
  if (player.lives < CONFIG.PLAYER_MAX_LIVES) player.lives++;
} else if (typeData.id === 'shield') {
  player.shieldActive = true;
} else if (typeData.id === 'multishot') {
  player.multishot = true;
  player.multishotTimer = CONFIG.POWERUP_DURATION;
}
```

- "Each power-up has a different effect. We use `if/else if` to check which type was collected."
- "Timed power-ups set a timer. In `updatePlayer`, that timer counts down and turns off the power-up when it hits zero."

Show the timer countdown:

```javascript
if (player.multishot && player.multishotTimer > 0) {
  player.multishotTimer -= 16;
  if (player.multishotTimer <= 0) {
    player.multishot = false;
  }
}
```

- "16ms ≈ one frame at 60fps. Subtracting 16 each frame counts down in real time."

**Questions to ask:**
- *"What does `Math.floor(Math.random() * 5)` produce?"* → A random integer: 0, 1, 2, 3, or 4.
- *"Why do we check `player.lives < CONFIG.PLAYER_MAX_LIVES` before adding a life?"* → So hearts can't give more than 5 lives.

**Checkpoint:** Enemies drop power-ups. Collecting them changes the ship's behavior visibly.

---

### STEP 7 — Game States, Wave Progression and Audio (20 min)

**Focus areas:** SECTION 3 (STATE), SECTION 10 (waves), SECTION 13 (audio)

**Game states (5 min):**

```javascript
let STATE = 'loading'; // 'menu' | 'playing' | 'paused' | 'wave-cleared' | 'victory' | 'game-over'
```

- "STATE is like a traffic light — the game can only be in one mode at a time."
- "In the update loop: `if (STATE !== 'playing') return;` — if we're paused, nothing moves."
- "In the render loop: we use STATE to decide which overlays to show."

**Wave progression (10 min):**

Show `checkWaveComplete`:

```javascript
const aliveCount = enemies.filter(e => e.alive).length;
if (aliveCount === 0) { triggerWaveCleared(); }
```

- "`filter` creates a new array containing only items where the condition is true."
- "`.length` counts how many survived the filter."

Show `triggerWaveCleared`:

```javascript
STATE = 'wave-cleared';
waveCountdownTimer = setInterval(function() {
  waveCountdownVal--;
  if (waveCountdownVal <= 0) {
    clearInterval(waveCountdownTimer);
    player.wave++;
    spawnFormation(player.wave - 1);
    STATE = 'playing';
  }
}, 1000);
```

- "`setInterval` calls a function repeatedly on a timer — every 1000ms (1 second) here."
- "When countdown hits 0, we clear the interval (stop it), advance the wave, spawn new enemies, and resume."

**Audio (5 min):**

Show `playSound`:

```javascript
const ac = getAudioCtx();
const osc = ac.createOscillator();
const gain = ac.createGain();
osc.connect(gain);
gain.connect(ac.destination);
osc.frequency.setValueAtTime(900, now);
osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
```

- "The Web Audio API is a mini synthesizer built into the browser."
- "An oscillator generates a tone. A gain node controls the volume."
- "We connect oscillator → gain → speakers."
- "We don't need any audio files for sound effects — we create the sound mathematically."

**Questions to ask:**
- *"What does `filter` return?"* → A new array with only the items that match the condition.
- *"Why do we `clearInterval` at the end of the countdown?"* → If we don't, `setInterval` keeps firing forever.
- *"Why can't we just play audio immediately on page load?"* → Browsers block autoplay without a user gesture (to prevent annoying websites).

**Checkpoint:** Waves clear, countdown appears, next wave spawns with new formation. Sound effects play.

---

### STEP 8 — Testing, Quick Challenges, and Recap (20 min)

**Testing (5 min):**

Walk through the checklist together:
- Does the spaceship move? Stay in bounds?
- Do bullets fire and travel upward?
- Do enemies move and descend when hitting walls?
- Does killing an enemy add to the score?
- Does the player lose a life when hit?
- Do power-ups drop and apply effects?
- Does the wave advance after clearing all enemies?
- Does the game end in victory after wave 5?
- Does the game-over screen appear when lives hit 0?
- Does pause freeze the game?
- Does the MUSIC button toggle the soundtrack?

**Quick Challenges (10 min) — pick 1–2 based on time:**

1. **Easy:** Change `CONFIG.PLAYER_SPEED` from 4 to 7 and play. How does it feel?
2. **Easy:** Change `CONFIG.POWERUP_DROP_CHANCE` from 0.20 to 0.80 and replay. What happens?
3. **Medium:** Change `CONFIG.PLAYER_BULLET_COOL` from 300 to 100. How does rapid-fire feel?
4. **Medium:** In `spawnFormation`, change the top row enemy type to 0 (blue). What changes visually and score-wise?
5. **Medium:** Change `CONFIG.TOTAL_WAVES` from 5 to 3 and test the victory screen.
6. **Challenge:** Find where `ENEMY_POINTS` is defined and add a new type: `150`. Then modify a row in `spawnFormation` to use `typeIndex = 4` and see what happens. (This requires adding a 5th enemy key — discuss what else would need to change.)

**Recap (5 min):**

Ask the class:
- *"What are the three files and what does each one do?"*
- *"What is a game loop?"*
- *"What is collision detection?"*
- *"What is a game state?"*
- *"What's one thing you'd change about this game if you had more time?"*

---

## Common Beginner Mistakes

| Mistake | Cause | Fix |
|---------|-------|-----|
| Ship doesn't move | Didn't click canvas to give it focus | Click on the game area first |
| Console shows `Uncaught ReferenceError` | Typo in variable name | Check spelling carefully; JavaScript is case-sensitive |
| `splice` removes wrong items | Looping forward when removing | Always loop backwards when removing from an array |
| Game freezes on restart | Duplicate `requestAnimationFrame` loop started | Always cancel the old loop with `cancelAnimationFrame` before starting a new one |
| Enemy doesn't die | Forgot to check `e.alive` | Add `if (!e.alive) continue;` in collision loop |
| Score shows NaN | `ENEMY_POINTS[e.type]` returned undefined | Check that type index matches array length |
| Music autoplay blocked | Browser policy | Remind students to click MUSIC button after page loads |
| Power-up timer doesn't expire | Timer decremented but flag not reset | Set both `player.multishot = false` AND `player.multishotTimer = 0` |
| Fullscreen doesn't work | Running from file:// not server | Use VS Code Live Server |

---

## Final Student Challenge

> **"The Bonus Wave"**
>
> After the fifth wave ends (before triggering victory), add a secret "BONUS WAVE 6" where:
> - All enemies move at 4× speed
> - Every enemy is a pink enemy (100 pts)
> - The wave lasts only 30 seconds before victory is granted
>
> Hints:
> - Change `CONFIG.TOTAL_WAVES` to 6
> - Add a 6th entry to `WAVE_DATA` with `speedMult: 4.0` and `cols: 8`
> - Set all typeIndex values to 3 (pink) for that wave in `spawnFormation`

---

## Closing Recap

Say to the class:

> "Today you built a real browser game. You used variables, arrays, objects, functions, loops, conditions, events, and the Canvas API.
>
> More importantly — you now know how a game is structured. There's a game loop. There's state. There's input. There's physics (movement). There's collision. There's data (score, lives).
>
> Every game you've ever played — from Flappy Bird to Minecraft to GTA — uses the same ideas. Just bigger.
>
> Day 2, we build something new. But first — play your game. You earned it."

---

*TECHNOPIXEL SPACE INVADERS · Workshop Guide · Created by Dave Punzalan · TechNoPixel · December 10, 2026*

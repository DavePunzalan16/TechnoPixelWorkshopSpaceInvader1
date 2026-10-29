TECHNOPIXEL SPACE INVADERS — Workshop Instructor Guide

TechNoPixel Web Game Development Workshop — Day 1
Date: December 10, 2026
Instructor: Dave Punzalan · TECHNOPIXEL
Duration: 4 hours total (30 min setup + 150 min coding + 30 min buffer/challenge)

Codebase status (last updated Oct 29 2026 — Upgrade v2):
Upgrade v2 adds: time-based firing with projectile caps, a fixed-timestep game loop, rarity-based loot tables, INFINITY ROOM (endless mode with saved personal records), and responsive layout fixes (SIDE INVADERS spacing, 4 / 2 / 1-column grids).
The original index.html audit passed HTML-Validate with 0 errors (semantic structure, HTML5 void elements, no inline styles, no duplicate IDs). Upgrade v2 added 5 buttons (20 total, all with type="button") and new Infinity Room markup — re-run HTML-Validate before the workshop.
Power-up cards use real image assets (heart.png, shield.png, multishot.png, bigbullet.png, rapidshot.png). The big-bullet file was renamed from bigbulletmoto.png.
Drop chances and loot tables below are starting values — tune them in CONFIG / LOOT_TABLES after playtesting.

Learning Objectives

By the end of this workshop, students will be able to:

Explain the structure of a web game (HTML, CSS, JavaScript, Canvas).
Use variables, arrays, objects, and functions in JavaScript.
Implement a requestAnimationFrame game loop.
Move sprites using keyboard input.
Detect collisions between rectangles (AABB).
Update a score and manage lives.
Understand game states (menu, playing, paused, game over).
Describe how images and audio are loaded and used in the browser.
(Upgrade module) Explain why a game needs time-based firing, object caps, and a fixed-timestep loop.
(Upgrade module) Use weighted probability to build a loot table.
(Upgrade module) Save and load personal records with localStorage.
Prerequisites

Students do NOT need prior JavaScript experience. Prior HTML/CSS basics are helpful but not required.

What to have ready:

Each student has a computer with Chrome or Edge installed.
VS Code installed with the Live Server extension.
This project folder (Samplegame/) is already copied to each student machine OR accessible via a shared drive.
Optionally: projector showing your screen for live coding demonstration.
Introduction Script (5 minutes, before coding starts)

"Today we're going to build a real browser game — from scratch. Not a toy example, not a simulation. A game you can actually play, show your friends, and put in a portfolio.

We're using three tools you might already know: HTML to structure the page, CSS to make it look cool, and JavaScript to make things move and respond to you.

The secret weapon is the HTML Canvas — think of it like a whiteboard inside your browser. Instead of writing text or clicking buttons, we draw directly onto it using JavaScript code.

By the end of today, your browser will be running TECHNOPIXEL SPACE INVADERS."

Show the finished game running (pre-built version). Let students play for 2 minutes. Then say:

"This is what we're going to build together. Let's go."

Workshop Timeline: 150-Minute Coding Session
STEP 1 — Project Setup and Test the Initial Page (10 min)

Goal: Every student has the project running in their browser.

What to do:

Open VS Code. File → Open Folder → select the Samplegame/ folder.
Open index.html. Show the overall structure:
<section id="loading-screen"> — cinematic loading screen with progress bar
<main id="landing-screen"> — full landing page (nav, hero, how-to-play, enemies, power-ups, about, footer)
<div id="game-screen"> — game canvas and all in-game overlays (including the Infinity run-ended screen)
<div id="infinity-panel"> — the INFINITY ROOM records panel (opened by the ∞ INFINITY ROOM button on the hero; CLASSIC MODE starts the five-wave game)
Right-click index.html → Open with Live Server.
The browser opens. Students should see the loading screen with the TechNoPixel logo and katakana animation.

Concepts to explain:

"The browser reads index.html first, like the front page of a book."
"It then fetches styles.css (the look) and game.js (the behavior)."
"<link> and <script> tags connect these files."
"The Canvas is a drawing surface — right now it's empty."
"We use semantic HTML tags (<main>, <nav>, <section>, <footer>) so the browser and screen readers understand the page structure."

Questions to ask:

"What do you think HTML does?" → Structure / skeleton of the page.
"What do you think JavaScript does?" → Makes things interactive / move.

Common mistakes:

Opening the file directly from File Explorer (not using Live Server) — fonts won't load, audio will be blocked.
VS Code showing "Port 5500 is taken" — kill the existing server or change the port in settings.
STEP 2 — Load and Draw the Game Assets (15 min)

Focus area: game.js — SECTION 1 (CONFIG, ASSETS) and SECTION 2 (Asset Loading)

What to explain:

Open game.js. Scroll to const CONFIG = { ... }.
"This is our settings panel. Every important number lives here."
Scroll to const ASSETS = { ... }.
"These are the file paths to our images. Think of ASSETS as a map — it tells JavaScript where to find each picture."

Live demo — show what loadImage does:

javascript
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
"We create a blank Image object, attach a function to run when it loads, then set .src to start downloading."
"Once all images are loaded, updateLoadingProgress transitions us to the landing page."

Key analogy: "Loading assets is like putting ingredients on the counter before cooking. You don't start until everything is ready."

Questions to ask:

"Why do we wait for images to load before drawing?" → If an image isn't ready, drawImage() draws nothing.
"What happens if a file is missing?" → img.onerror fires, imgs[key] = null, we use a fallback shape.

Checkpoint: Students can see the loading screen transition to the landing page.

STEP 3 — Player Movement and Keyboard Handling (20 min)

Focus areas: SECTION 4 (input) and SECTION 5 (player movement)

What to explain — the keys object:

javascript
const keys = {};

window.addEventListener('keydown', function(e) {
  keys[e.code] = true;
});
window.addEventListener('keyup', function(e) {
  keys[e.code] = false;
});
"Every time a key goes down, we store true. When it comes up, we store false."
"It's like a light switch — pressed = on, released = off."
"Each frame, we CHECK the switch. If it's on, we move."

Show updatePlayer:

javascript
let dx = 0;
if (keys['ArrowLeft']  || keys['KeyA']) dx = -1;
if (keys['ArrowRight'] || keys['KeyD']) dx =  1;
player.x += dx * player.speed;
player.x = Math.max(0, Math.min(CONFIG.CANVAS_W - player.w, player.x));
"dx is the direction: -1 left, 0 still, +1 right."
"We multiply direction by speed to get how far we move."
"The Math.max/Math.min line is the wall — it stops the player at the canvas edges."

Draw the player — show drawPlayer:

javascript
ctx.drawImage(imgs.spaceship, player.x, player.y, player.w, player.h);
"ctx is the painter. drawImage says: 'paint this image at these coordinates with this size.'"
"x=0, y=0 is the TOP-LEFT corner of the canvas. x goes right, y goes down."

Key analogy: "The player object is a box. x,y is where the box sits. w,h is how big it is."

Questions to ask:

"What would happen if we didn't clamp the player position?" → The ship would fly off the screen.
"Why do we check keys every frame instead of once on keydown?" → So the ship moves smoothly while the key is held.

Checkpoint: Students can move the spaceship left and right using the keyboard.

STEP 4 — Bullets and Enemy Formation (25 min)

Focus areas: SECTION 5 (shooting), SECTION 6 (enemies)

Part A — Player bullets (12 min):

Show firePlayerBullet:

javascript
const bx = player.x + player.w / 2 - bulletW / 2;
const by = player.y - bulletH;
bullets.push({ x: bx, y: by, w: bulletW, h: bulletH, angle: 0, big: false });
"bullets is an array — a list of bullet objects."
"Each bullet is a box: x, y, width, height."
"We center the bullet on the player by adding half the player width and subtracting half the bullet width."

Controlled firing — Upgrade v2 (3 min):

Holding Space used to be a lag risk. Firing is now TIME-based, not frame-based:

javascript
const wantsToShoot = keys['Space'] || touch.fireHeld;
if (wantsToShoot && (now - player.lastShotTime) >= shootCooldown) {
  firePlayerBullet();
  player.lastShotTime = now;
}
"now is a timestamp in milliseconds. We only fire if enough time has passed since the last shot."
"CONFIG.PLAYER_BULLET_COOL is 160 ms — roughly 6 shots per second, no matter how fast the keyboard repeats or how fast the monitor refreshes."
"CONFIG.MAX_PLAYER_BULLETS (55) is a safety cap. At the top of firePlayerBullet: if (bullets.length >= CONFIG.MAX_PLAYER_BULLETS) return;"
Mobile uses the same code: the FIRE button just sets touch.fireHeld = true.

Show updateBullets:

javascript
for (let i = bullets.length - 1; i >= 0; i--) {
  bullets[i].y -= CONFIG.BULLET_SPEED;
  if (bullets[i].y + bullets[i].h < 0) {
    bullets.splice(i, 1);
  }
}
"We loop backwards because we're removing items from the array while looping. If we looped forwards and removed index 3, old index 4 becomes index 3 and we'd skip it."
"Bullets move up by subtracting from y (remember: y=0 is the top)."
"When a bullet goes off the top, we splice (remove) it from the array."

Part B — Enemy formation (13 min):

Show spawnFormation:

javascript
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    enemies.push({ x: startX + col * (ENEMY_W + gap), y: startY + row * (ENEMY_H + gap), type: typeIndex, alive: true });
  }
}
"A nested loop — the outer loop goes through rows, the inner loop goes through columns."
"For each position we create an enemy object and add it to the enemies array."

Show updateEnemies — wall detection:

javascript
if (hitRight || hitLeft) {
  formationDir *= -1;      // Flip direction
  for (const e of aliveEnemies) {
    e.y += CONFIG.ENEMY_DROP; // Drop down
  }
}
"When the formation hits a wall, we multiply the direction by -1 to reverse it, then drop all enemies down."
"This is the classic Space Invaders mechanic."

Questions to ask:

"What does bullets.splice(i, 1) do?" → Removes 1 item at index i from the array.
"Why do we loop backwards when removing items?" → To avoid skipping items when indices shift.
"What does formationDir *= -1 do?" → Flips +1 to -1 or -1 to +1, reversing direction.

Checkpoint: Formation enemies appear and move. Player can fire bullets that travel upward.

STEP 5 — Collision Detection, Score and Lives (20 min)

Focus areas: SECTION 8 (collisions), SECTION 9 (scoring)

Show rectsOverlap:

javascript
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw &&
         ax + aw > bx &&
         ay < by + bh &&
         ay + ah > by;
}
"This checks if two rectangles overlap. AABB = Axis-Aligned Bounding Box."
"Four conditions must ALL be true for an overlap."
"Think of it as: is there any gap between them? If no gap on any side — they're touching."

Draw this on the board: Two rectangles side by side. Label ax, ay, aw, ah. Ask "does A overlap B?"

Show the collision loop:

javascript
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
"We loop through every bullet and every enemy."
"If rectsOverlap is true, we kill the enemy (alive = false), add to the score, and remove the bullet."
"break stops checking more enemies for this bullet — one bullet, one hit."
"After the loops, enemies = enemies.filter(e => e.alive) throws the dead ones away so the array never fills with corpses." (Upgrade v2)

Show handlePlayerHit:

javascript
player.lives--;
player.invulnUntil = now + CONFIG.INVULN_DURATION;
if (player.lives <= 0) { triggerGameOver(); }
"Invulnerability cooldown prevents losing several lives in the same instant."
"invulnUntil is a timestamp. If now < invulnUntil, we skip damage."

Questions to ask:

"What would happen without the invulnerability cooldown?" → The player could lose all lives in one collision frame.
"Why do we set e.alive = false instead of removing the enemy in the middle of the loop?" → Removing while looping can skip items. We mark it dead, finish the loops, then clean up with filter once.

Checkpoint: Bullets kill enemies, score increases, player loses lives when hit by enemy bullets.

STEP 6 — Power-Up Drops and Effects (20 min)

Focus areas: SECTION 9 (power-ups)

Point out the landing page first: Scroll to the Power-Ups section on the landing page.
Each card shows the actual in-game asset (heart.png, shield.png, multishot.png, bigbullet.png, rapidshot.png) so students know exactly what to look for during gameplay.
"These images in the cards are the same images the game drops during play — so you know what to collect."

Show the loot system (Upgrade v2) — two separate rolls:

javascript
// ROLL 1: does this kill drop anything at all?
function tryDropLoot(cx, cy, enemyType) {
  if (powerups.length >= CONFIG.POWERUP_MAX_ACTIVE) return;            // max 3 on screen
  if (Math.random() >= CONFIG.POWERUP_DROP_CHANCE[enemyType]) return;  // 3% / 5% / 9% / 15%
  spawnPowerup(cx, cy, enemyType);
}

// ROLL 2: WHICH power-up? Each enemy color has its own reward table.
function pickLootType(enemyType) {
  const table = LOOT_TABLES[enemyType];
  let roll = Math.random() * 100;
  for (const t of POWERUP_TYPES) {
    roll -= (table[t.id] || 0);
    if (roll < 0) return t;
  }
  return POWERUP_TYPES[0];
}

Starting values (in CONFIG and LOOT_TABLES):

Enemy	Points	Drop chance	Heart	Rapid Shot	Multishot	Shield	Big Bullet
Blue	10	3%	35%	35%	15%	10%	5%
Red	20	5%	25%	30%	20%	15%	10%
Green	50	9%	15%	20%	25%	22%	18%
Pink	100	15%	10%	15%	25%	25%	25%
"Math.random() gives a number between 0 and 1."
"Roll 1 decides IF something drops. Roll 2 decides WHAT. Never mix them up."
"Roll 2 is like a pie chart: we walk around the slices, subtracting each weight from the roll, until it drops below zero — that's the slice we landed on."
"Rarer enemies are worth more points AND drop better loot, so players chase the pink ones."
"Side enemies use the same tiers as the matching formation color."

Show applyPowerup:

javascript
if (typeData.id === 'heart') {
  if (player.lives < CONFIG.PLAYER_MAX_LIVES) player.lives++;
} else if (typeData.id === 'shield') {
  player.shieldActive = true;
} else if (typeData.id === 'multishot') {
  player.multishot = true;
  player.multishotTimer = CONFIG.POWERUP_DURATION;
}
"Each power-up has a different effect. We use if/else if to check which type was collected."
"Timed power-ups set a timer. In updatePlayer, that timer counts down and turns off the power-up when it hits zero."

Show the timer countdown:

javascript
if (player.multishot && player.multishotTimer > 0) {
  player.multishotTimer -= 16;
  if (player.multishotTimer <= 0) {
    player.multishot = false;
  }
}
"Each simulation step is 1/60 of a second (≈16ms), so subtracting 16 per step counts down in real time. The game loop guarantees this with a fixed timestep — see Step 9."

Questions to ask:

"What does Math.floor(Math.random() * 5) produce?" → A random integer: 0, 1, 2, 3, or 4.
"Why do we check player.lives < CONFIG.PLAYER_MAX_LIVES before adding a life?" → So hearts can't give more than 5 lives.
"Why cap power-ups at 3 on screen?" → Loot should feel special, and bounded object counts keep the game fast.

Checkpoint: Enemies drop power-ups (rarely — for the demo, temporarily set POWERUP_DROP_CHANCE to [1, 1, 1, 1], then put it back). Collecting them changes the ship's behavior visibly.

STEP 7 — Game States, Wave Progression and Audio (20 min)

Focus areas: SECTION 3 (STATE), SECTION 10 (waves), SECTION 13 (audio)

Game states (5 min):

javascript
let STATE = 'loading'; // 'menu' | 'playing' | 'paused' | 'wave-cleared' | 'victory' | 'game-over'
"STATE is like a traffic light — the game can only be in one mode at a time."
"In the update loop: if (STATE !== 'playing') return; — if we're paused, nothing moves."
"In the render loop: we use STATE to decide which overlays to show."

Wave progression (10 min):

Show checkWaveComplete:

javascript
const aliveCount = enemies.filter(e => e.alive).length;
if (aliveCount === 0) { triggerWaveCleared(); }
"filter creates a new array containing only items where the condition is true."
".length counts how many survived the filter."

Show triggerWaveCleared:

javascript
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
"setInterval calls a function repeatedly on a timer — every 1000ms (1 second) here."
"When countdown hits 0, we clear the interval (stop it), advance the wave, spawn new enemies, and resume."

Classic vs Infinity (Upgrade v2): the code asks one question instead of hardcoding wave 5:

javascript
function isFinalWave() { return GAME_MODE === 'classic' && player.wave >= CONFIG.TOTAL_WAVES; }
"In Classic Mode the last wave leads to victory. In Infinity Room isFinalWave() is always false, so the next wave always spawns."

Audio (5 min):

Show playSound:

javascript
const ac = getAudioCtx();
const osc = ac.createOscillator();
const gain = ac.createGain();
osc.connect(gain);
gain.connect(ac.destination);
osc.frequency.setValueAtTime(900, now);
osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
"The Web Audio API is a mini synthesizer built into the browser."
"An oscillator generates a tone. A gain node controls the volume."
"We connect oscillator → gain → speakers."
"We don't need any audio files for sound effects — we create the sound mathematically."

Questions to ask:

"What does filter return?" → A new array with only the items that match the condition.
"Why do we clearInterval at the end of the countdown?" → If we don't, setInterval keeps firing forever.
"Why can't we just play audio immediately on page load?" → Browsers block autoplay without a user gesture (to prevent annoying websites).

Checkpoint: Waves clear, countdown appears, next wave spawns with new formation. Sound effects play.

STEP 8 — Testing, Quick Challenges, and Recap (20 min)

Testing (5 min):

Walk through the checklist together:

Does the spaceship move? Stay in bounds?
Do bullets fire and travel upward?
Do enemies move and descend when hitting walls?
Does killing an enemy add to the score?
Does the player lose a life when hit?
Do power-ups drop and apply effects?
Does the wave advance after clearing all enemies?
Does the game end in victory after wave 5?
Does the game-over screen appear when lives hit 0?
Does pause freeze the game?
Does the MUSIC button toggle the soundtrack?
Hold Space for a full minute — does the game stay smooth? (Upgrade v2)
Are power-ups rare, and never more than 3 on screen at once?
Does INFINITY ROOM keep going past wave 5 and show a run-ended screen when lives hit 0?
Do the Infinity records still show after refreshing the page? Is Classic Mode unaffected?

Quick Challenges (10 min) — pick 1–2 based on time:

Easy: Change CONFIG.PLAYER_SPEED from 4 to 7 and play. How does it feel?
Easy: CONFIG.POWERUP_DROP_CHANCE is now a list (blue, red, green, pink). Change it from [0.03, 0.05, 0.09, 0.15] to [0.30, 0.30, 0.30, 0.30] and replay. What happens? Why is the 3-on-screen cap still important?
Medium: Change CONFIG.PLAYER_BULLET_COOL from 160 to 60. How does rapid-fire feel? What stops the bullet count from exploding? (Hint: MAX_PLAYER_BULLETS.)
Medium: In spawnFormation, change the top row enemy type to 0 (blue). What changes visually and score-wise?
Medium: Change CONFIG.TOTAL_WAVES from 5 to 3 and test the victory screen.
Medium: Edit one row of LOOT_TABLES so pink enemies always drop a Heart (set heart to 100, the rest to 0). Check that each row still adds up to 100.
Challenge: Find where ENEMY_POINTS is defined and add a new type: 150. Then modify a row in spawnFormation to use typeIndex = 4 and see what happens. (This requires adding a 5th enemy key — discuss what else would need to change.)

Recap (5 min):

Ask the class:

"What are the three files and what does each one do?"
"What is a game loop?"
"What is collision detection?"
"What is a game state?"
"What's one thing you'd change about this game if you had more time?"
STEP 9 — OPTIONAL Upgrade Module: Performance, Rare Loot & Infinity Room (30 min, advanced or take-home)

This sits outside the 150-minute core session. Use it for fast students, a Day 2 warm-up, or homework. The code is already in the project — students read it, tweak it, and explain it.

Part A — Why did spamming Space cause lag? (10 min)

Cause found in v1	Fix in v2
shadowBlur glow on every enemy, bullet and particle	No glow on crowded objects; bullet/enemy-bullet glow only when 12 or fewer are on screen
Background image scaled every frame	Scaled once onto an offscreen canvas (getBgCache)
Power-up HUD rebuilt in the DOM every frame	Rebuilt only when the displayed text changes (hudKey)
A new sound oscillator for every shot, with no limit	70 ms throttle per effect (sfxLast)
Timers assumed 60 fps	Fixed-timestep loop (below)
Dead enemies stayed in the array; no caps	enemies is cleaned after collisions; caps on bullets, enemy bullets and particles

The fixed-timestep game loop:

javascript
accumulator += Math.min(100, timestamp - lastFrameTime);
lastFrameTime = timestamp;
let steps = 0;
while (accumulator >= STEP && steps < 3) { update(timestamp); accumulator -= STEP; steps++; }
render();
"STEP is 1000/60 ms. The game always simulates in 1/60-second slices, so a 144Hz monitor doesn't make the game 2.4× faster."
"The accumulator is a savings jar of elapsed time. Each simulation step spends one STEP from it."
"Max 3 steps per frame stops a slow computer from spiraling into even slower frames."
"startGameLoop cancels any existing loop first, so restarting never creates two loops."

Questions to ask:

"Why is a cooldown based on time better than firing every frame?" → Fair on every monitor speed.
"What does a cap like MAX_PLAYER_BULLETS protect us from?" → Unbounded arrays slowing the game down.

Part B — INFINITY ROOM (10 min)

javascript
function getWaveData(idx) {
  if (idx < WAVE_DATA.length) return WAVE_DATA[idx];       // waves 1-5: the hand-made table
  const extra = idx - (WAVE_DATA.length - 1);              // waves 6+: extend the last row a bit each wave
  return {
    speedMult: Math.min(CONFIG.INF_MAX_SPEED_MULT, last.speedMult + extra * 0.25),
    shootMult: Math.max(CONFIG.INF_MIN_SHOOT_MULT, last.shootMult - extra * 0.03),
    // ...sideMax, rows and cols are scaled and capped the same way
  };
}
"Math.min / Math.max are the ceiling and floor: difficulty rises every wave but can never become impossible."
"There is no hardcoded last wave. The run ends only when lives reach 0."
"The survival timer only counts while the game is actually playing, so pausing doesn't add time."

Part C — Saving personal records with localStorage (10 min)

javascript
const INF_KEYS = { wave: 'tp_inf_wave', score: 'tp_inf_score', time: 'tp_inf_time' };
"localStorage is a tiny notepad inside the browser. It keeps data between visits — but only on THIS browser and device. It's not an online leaderboard."
"Infinity records use their own keys (tp_inf_*), so they can never overwrite the Classic best score (tp_hiscore)."
"We only write when a record improves — once per wave and once at game over — never every frame."
"Private/incognito mode can block storage, so every read and write is wrapped in try/catch. The game stays playable and the panel says records won't persist."

Checkpoint: Students can start Infinity Room, pass wave 5 without a victory screen, lose, see the run-ended screen, refresh the page, and still see their records.

Common Beginner Mistakes
Mistake	Cause	Fix
Ship doesn't move	Didn't click canvas to give it focus	Click on the game area first
Console shows Uncaught ReferenceError	Typo in variable name	Check spelling carefully; JavaScript is case-sensitive
splice removes wrong items	Looping forward when removing	Always loop backwards when removing from an array
Game freezes on restart	Duplicate requestAnimationFrame loop started	Always cancel the old loop with cancelAnimationFrame before starting a new one
Enemy doesn't die	Forgot to check e.alive	Add if (!e.alive) continue; in collision loop
Score shows NaN	ENEMY_POINTS[e.type] returned undefined	Check that type index matches array length
Music autoplay blocked	Browser policy	Remind students to click MUSIC button after page loads
Power-up timer doesn't expire	Timer decremented but flag not reset	Set both player.multishot = false AND player.multishotTimer = 0
Fullscreen doesn't work	Running from file:// not server	Use VS Code Live Server
HTML-Validate errors on <button>	Missing type attribute	Add type="button" to every button that isn't inside a <form>
HTML-Validate void-element errors	Self-closing slash on <img />, <meta />, etc.	HTML5 void elements don't need the slash — use <img>, <meta>
\1	Holding Space lags the game	Too many bullets, glow effects, or sounds per frame
Power-ups never drop (or NaN chance)	POWERUP_DROP_CHANCE is now a list but code treats it as one number	Index it by enemy type: CONFIG.POWERUP_DROP_CHANCE[enemyType]
Loot table does nothing	Weights don't add up, or ids don't match POWERUP_TYPES	Each row must total 100 and use ids like heart, rapidshot
Infinity records vanish	Private mode, or storage blocked by the browser	Use a normal window; the panel shows a warning when storage is blocked
Infinity Room ends at wave 5	isFinalWave() replaced by a hardcoded player.wave >= 5	Keep using isFinalWave()
Big bullet power-up shows an emoji	Wrong image path	The file is techassets/bigbullet.png
Final Student Challenge

"The Bonus Wave"

After the fifth wave ends (before triggering victory), add a secret "BONUS WAVE 6" where:

All enemies move at 4× speed
Every enemy is a pink enemy (100 pts)
The wave lasts only 30 seconds before victory is granted

Hints:

Change CONFIG.TOTAL_WAVES to 6
Add a 6th entry to WAVE_DATA with speedMult: 4.0 and cols: 8
Set all typeIndex values to 3 (pink) for that wave in spawnFormation
This is a Classic Mode challenge. Infinity Room ignores TOTAL_WAVES on purpose.
Closing Recap

Say to the class:

"Today you built a real browser game. You used variables, arrays, objects, functions, loops, conditions, events, and the Canvas API.

More importantly — you now know how a game is structured. There's a game loop. There's state. There's input. There's physics (movement). There's collision. There's data (score, lives).

Every game you've ever played — from Flappy Bird to Minecraft to GTA — uses the same ideas. Just bigger.

Day 2, we build something new. But first — play your game. You earned it."

TECHNOPIXEL SPACE INVADERS · Workshop Guide · Created by Dave Punzalan · TechNoPixel · December 10, 2026
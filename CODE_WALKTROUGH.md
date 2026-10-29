TECHNOPIXEL SPACE INVADERS — Step-Step Code Walkthrough

For high-school students. No coding experience needed. You will build your own mini space shooter one tiny step at a time by copying and pasting the code boxes below. Every step adds one new thing, and every step tells you exactly where to paste and what you should see. At the end, you'll find the same ideas inside the real TECHNOPIXEL game.

How this works (read this first!)
You will make one file called index.html.
Each step gives you a code box. Click the copy button (or select + Ctrl+C), then paste (Ctrl+V) into your file.
Your file has marker lines like // >>> DATA GOES HERE. They are your landmarks. Never delete them. Always paste right above the marker named in the step.
After every step: save (Ctrl+S), then refresh the browser (F5) and check what you see.
If something breaks, press F12 → Console. A red message tells you the line with the problem. Don't panic — see the Fix-it table at the end.

Tip: Indentation (the spaces at the start of a line) doesn't have to be perfect. JavaScript doesn't care.

Time needed: about 2 hours for all 12 steps. You can stop after any step — your game still works.

Step 0 — Set up (5 minutes)
Make a new folder on your desktop called my-game.
Open VS Code → File → Open Folder → choose my-game.
Click New File, name it index.html.
If your teacher says so, install the Live Server extension. (Our mini game also works if you just double-click index.html.)
Step 1 — The starter file (5 minutes)

Copy this whole box into index.html. It is the empty "stage" for your game.

html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Space Shooter</title>
  <style>
    body   { margin: 0; background: #0d0020; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { background: #16002e; border: 2px solid #ff2eff; max-width: 100%; max-height: 100vh; }
  </style>
</head>
<body>
<canvas id="game" width="800" height="600"></canvas>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameOver = false;   // we will use this in Step 7

// >>> DATA GOES HERE

// >>> FUNCTIONS GO HERE

function update() {
  if (gameOver) return;      // when the game is over, nothing moves
  // >>> UPDATE LINES GO HERE
}

function render() {
  ctx.clearRect(0, 0, 800, 600);   // wipe the canvas
  // >>> DRAW LINES GO HERE
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
</script>
</body>
</html>

Save, then open it in Chrome or Edge.

✅ You should see: a dark purple page with a magenta-bordered box in the middle. That box is the canvas — your drawing board.

💡 What is in this file?

HTML (<canvas>) = the drawing board.
CSS (<style>) = the colors.
JavaScript (<script>) = the brain.
gameLoop runs about 60 times every second: it calls update() (change things) and render() (draw things). A game is just this, over and over, super fast — like a flip-book!
update() = where things move. render() = where things get drawn.
Step 2 — Draw your spaceship

Goal: Put a ship on the screen.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
const player = { x: 372, y: 520, w: 56, h: 56, speed: 5 };

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function drawPlayer() {
  ctx.fillStyle = '#ff2eff';
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

Paste 3. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawPlayer();

Save and refresh.

✅ You should see: A magenta square near the bottom-middle of the canvas.

💡 What does it mean?

player is an object — a little bag of facts about the ship: where it is (x, y), how big (w, h), and how fast it moves.
x = 0, y = 0 is the top-left corner. x goes right, y goes down.
ctx is the painter. fillStyle picks the color. fillRect(x, y, w, h) paints a rectangle.
render() runs about 60 times a second, so drawPlayer() repaints the ship every frame.

🎮 Try it: Change 
#ff2eff to 
#00f5ff. What color is your ship now?

🔍 In the real game: player object and drawPlayer() in game.js (the real one draws the spaceship picture with ctx.drawImage).

Step 3 — Move with the keyboard

Goal: Make the ship slide left and right.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
const keys = {};

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
window.addEventListener('keydown', function (e) { keys[e.code] = true; });
window.addEventListener('keyup',   function (e) { keys[e.code] = false; });

function updatePlayer() {
  let dx = 0;
  if (keys['ArrowLeft']  || keys['KeyA']) dx = -1;
  if (keys['ArrowRight'] || keys['KeyD']) dx =  1;
  player.x += dx * player.speed;
  player.x = Math.max(0, Math.min(800 - player.w, player.x));
}

Paste 3. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
updatePlayer();

Save and refresh.

✅ You should see: Click the page, then press A / D or the ← / → arrows. The ship slides and stops at the edges.

💡 What does it mean?

keys is a light-switch board. When a key goes down we flip its switch to true. When it comes up, false.
Every frame, updatePlayer() looks at the switches. dx means direction: -1 left, 0 stay, +1 right.
dx * player.speed is how far we move this frame.
Math.max(0, Math.min(...)) is an invisible wall so the ship can't leave the screen.

🎮 Try it: Change speed: 5 to speed: 9. Too fast? Too twitchy?

🔍 In the real game: keys, updatePlayer() in game.js (Section 4 and 5).

Step 4 — Shoot (with a cooldown)

Goal: Press SPACE to fire bullets, but at a controlled speed.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
const bullets = [];
let lastShot = 0;
const SHOOT_COOLDOWN = 160;   // milliseconds between shots

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function fireBullet() {
  bullets.push({ x: player.x + player.w / 2 - 5, y: player.y - 20, w: 10, h: 20 });
}

function handleShooting() {
  const now = performance.now();
  if (keys['Space'] && now - lastShot >= SHOOT_COOLDOWN) {
    fireBullet();
    lastShot = now;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 9;                                    // move up
    if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);   // off the top? delete it
  }
}

function drawBullets() {
  ctx.fillStyle = '#00f5ff';
  for (const b of bullets) ctx.fillRect(b.x, b.y, b.w, b.h);
}

// Stop the SPACE bar from scrolling the page
window.addEventListener('keydown', function (e) { if (e.code === 'Space') e.preventDefault(); });

Paste 3. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
handleShooting();
updateBullets();

Paste 4. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawBullets();

Save and refresh.

✅ You should see: Press SPACE. Cyan bullets shoot upward, about 6 per second even if you hold it.

💡 What does it mean?

bullets is an array (a list). bullets.push({...}) adds a new bullet to the list.
Cooldown: performance.now() is the clock in milliseconds. We only fire if 160 ms have passed since the last shot. Hold SPACE and you get a steady stream — never a flood.
Bullets move up by subtracting from y (remember: up = smaller y).
We loop backwards (i--) when deleting with splice. If you loop forwards and delete item 3, item 4 slides into slot 3 and gets skipped!

🎮 Try it: Change SHOOT_COOLDOWN to 60, then to 500. How does each feel?

🔍 In the real game: firePlayerBullet(), updateBullets() and the PLAYER_BULLET_COOL setting in game.js.

Step 5 — Add the invaders

Goal: Build a grid of enemies that march and drop down.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
let enemies = [];
let enemyDir = 1;            // 1 = moving right, -1 = moving left
let enemySpeed = 1.2;
const ENEMY_COLORS = ['#7ec8ff', '#ff7e7e', '#7eff9e', '#ff7eff'];   // blue, red, green, pink
const ENEMY_POINTS = [10, 20, 50, 100];
spawnEnemies();

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function spawnEnemies() {
  enemies = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      // top row = pink (type 3), bottom row = blue (type 0)
      enemies.push({ x: 100 + col * 60, y: 60 + row * 50, w: 40, h: 36, type: 3 - row });
    }
  }
}

function updateEnemies() {
  let hitWall = false;
  for (const e of enemies) {
    if ((enemyDir === 1 && e.x + e.w >= 796) || (enemyDir === -1 && e.x <= 4)) hitWall = true;
  }
  if (hitWall) {
    enemyDir *= -1;                          // turn around
    for (const e of enemies) e.y += 20;      // and drop down
  } else {
    for (const e of enemies) e.x += enemySpeed * enemyDir;
  }
}

function drawEnemies() {
  for (const e of enemies) {
    ctx.fillStyle = ENEMY_COLORS[e.type];
    ctx.fillRect(e.x, e.y, e.w, e.h);
  }
}

Paste 3. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
updateEnemies();

Paste 4. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawEnemies();

Save and refresh.

✅ You should see: Forty colored boxes march across, bounce off the walls, and creep downward.

💡 What does it mean?

A nested loop: the outer loop makes rows, the inner loop makes columns. Each pass makes one enemy object.
type is a number 0–3 that picks a color and a point value: blue 10, red 20, green 50, pink 100.
When any enemy touches a wall we flip the direction with enemyDir *= -1 and move everyone down. That's the classic Space Invaders move!

🎮 Try it: Change col < 10 to col < 6. What happens to the grid?

🔍 In the real game: spawnFormation() and updateEnemies() in game.js.

Step 6 — Collisions and score

Goal: Bullets destroy enemies and give points.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
let score = 0;

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function checkBulletHits() {
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      if (rectsOverlap(bullets[bi], enemies[ei])) {
        score += ENEMY_POINTS[enemies[ei].type];
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        break;
      }
    }
  }
}

function drawScore() {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText('SCORE: ' + score, 20, 30);
}

Paste 3. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
checkBulletHits();

Paste 4. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawScore();

Save and refresh.

✅ You should see: Shoot an enemy: it vanishes and SCORE goes up. Pink (top row) gives 100!

💡 What does it mean?

rectsOverlap answers: are these two boxes touching? All four conditions must be true. Think: "is there a gap on any side? If not — they overlap." (This trick is called AABB.)
We check every bullet against every enemy. On a hit: add points (ENEMY_POINTS[type]), remove the enemy, remove the bullet, and break so one bullet kills only one enemy.
ctx.fillText draws text on the canvas — that's our score display.

🎮 Try it: Change the score text color. Then try to find where ENEMY_POINTS lives and make blue worth 15.

🔍 In the real game: rectsOverlap() and checkCollisions() in game.js (the real game marks enemies alive = false first, then cleans up after the loops).

Step 7 — Enemies shoot back, lives, and game over

Goal: Make the game dangerous.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
const enemyBullets = [];
let lastEnemyShot = 0;
let enemyShootDelay = 1000;   // milliseconds between enemy shots
let lives = 3;

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function endGame() { gameOver = true; }

function enemyShooting() {
  const now = performance.now();
  if (enemies.length > 0 && now - lastEnemyShot > enemyShootDelay) {
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];   // pick a random enemy
    enemyBullets.push({ x: shooter.x + shooter.w / 2 - 4, y: shooter.y + shooter.h, w: 8, h: 16 });
    lastEnemyShot = now;
  }
}

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += 3.5;
    if (rectsOverlap(enemyBullets[i], player)) {
      enemyBullets.splice(i, 1);
      lives--;
      if (lives <= 0) endGame();
    } else if (enemyBullets[i].y > 600) {
      enemyBullets.splice(i, 1);
    }
  }
}

// If an enemy reaches the player's row, it's over
function checkInvasion() {
  for (const e of enemies) {
    if (e.y + e.h >= player.y) endGame();
  }
}

function drawEnemyBullets() {
  ctx.fillStyle = '#ff4444';
  for (const b of enemyBullets) ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawLives() {
  ctx.fillStyle = '#ff2eff';
  ctx.font = '16px monospace';
  ctx.fillText('LIVES: ' + lives, 680, 30);
}

function drawGameOver() {
  ctx.fillStyle = '#ffffff';
  ctx.font = '40px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', 400, 300);
  ctx.textAlign = 'left';
}

Paste 3. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
enemyShooting();
updateEnemyBullets();
checkInvasion();

Paste 4. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawEnemyBullets();
drawLives();
if (gameOver) drawGameOver();

Save and refresh.

✅ You should see: Red bullets rain down. Get hit 3 times: GAME OVER appears and everything freezes.

💡 What does it mean?

Once per second, a random enemy fires a red bullet. Math.random() * enemies.length picks a random position in the list.
If an enemy bullet overlaps the player, we remove the bullet and lives--. At 0 lives we call endGame().
Remember the if (gameOver) return; line in update()? Once gameOver is true, the whole game freezes — that's a game state. The real game uses a STATE word like 'playing' or 'paused'.
The real game also gives you a short invulnerability window after a hit so one bullet can't take all your lives at once.

🎮 Try it: Change lives = 3 to lives = 10, then change enemyShootDelay to 400. Hard mode!

🔍 In the real game: updateEnemies() (enemy shooting), handlePlayerHit(), triggerGameOver() in game.js.

Step 8 — Endless waves (Infinity Room idea)

Goal: When all enemies are gone, start a harder wave — forever.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
let wave = 1;

Paste 2. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function checkWaveClear() {
  if (enemies.length === 0) {
    wave++;
    bullets.length = 0;          // clear leftover bullets
    enemyBullets.length = 0;
    // Harder every wave... but Math.min / Math.max put a LIMIT on it
    enemySpeed      = Math.min(4, 1.2 + (wave - 1) * 0.25);
    enemyShootDelay = Math.max(350, 1000 - (wave - 1) * 60);
    spawnEnemies();
  }
}

function drawWave() {
  ctx.fillStyle = '#b44fff';
  ctx.font = '16px monospace';
  ctx.fillText('WAVE ' + wave + ' \u221E', 340, 30);
}

Paste 3. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
checkWaveClear();

Paste 4. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawWave();

Save and refresh.

✅ You should see: Destroy all 40 enemies. WAVE 2 starts, a little faster. Keep going — it never ends!

💡 What does it mean?

There is no "last wave" in this code. When enemies.length === 0 we simply start the next wave. That's how Infinity Room works.
Difficulty goes up each wave, but Math.min(4, ...) is a ceiling and Math.max(350, ...) is a floor. Without limits the game would become impossible.
bullets.length = 0 empties an array without making a new one.

🎮 Try it: Change 0.25 to 0.5. How quickly does it become unfair?

🔍 In the real game: checkWaveComplete(), triggerWaveCleared(), getWaveData() and isFinalWave() in game.js.

Step 9 — Rare loot (power-ups)

Goal: Enemies sometimes drop upgrades — rarer enemies drop better loot.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
const powerups = [];
const DROP_CHANCE = [0.03, 0.05, 0.09, 0.15];   // blue, red, green, pink: chance a kill drops something
const LOOT_TABLE = [                            // IF it drops, which item? (each row adds up to 100)
  { heart: 70, rapid: 30 },   // blue
  { heart: 55, rapid: 45 },   // red
  { heart: 35, rapid: 65 },   // green
  { heart: 20, rapid: 80 },   // pink
];
let rapidUntil = 0;           // time when RAPID SHOT runs out

Paste 2 — REPLACE a function. Press Ctrl+F and search for function checkBulletHits. Select that whole function (from function to its closing }) and replace it with this new version:

javascript
function checkBulletHits() {
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (rectsOverlap(bullets[bi], e)) {
        score += ENEMY_POINTS[e.type];
        tryDropLoot(e.x + e.w / 2, e.y + e.h / 2, e.type);   // ONE roll per kill
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        break;
      }
    }
  }
}

Paste 3 — REPLACE a function. Press Ctrl+F and search for function handleShooting. Select that whole function (from function to its closing }) and replace it with this new version:

javascript
function handleShooting() {
  const now = performance.now();
  const cooldown = (now < rapidUntil) ? SHOOT_COOLDOWN / 2 : SHOOT_COOLDOWN;   // rapid shot = twice as fast
  if (keys['Space'] && now - lastShot >= cooldown) {
    fireBullet();
    lastShot = now;
  }
}

Paste 4. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
// ROLL 2: WHICH item? Walk down the table, subtracting each weight until we go below zero.
function pickLoot(enemyType) {
  const table = LOOT_TABLE[enemyType];
  let roll = Math.random() * 100;
  for (const name in table) {
    roll -= table[name];
    if (roll < 0) return name;
  }
  return 'heart';
}

// ROLL 1: does this kill drop anything at all?
function tryDropLoot(x, y, enemyType) {
  if (powerups.length >= 3) return;                          // never more than 3 on screen
  if (Math.random() >= DROP_CHANCE[enemyType]) return;       // no luck
  powerups.push({ x: x - 14, y: y, w: 28, h: 28, kind: pickLoot(enemyType) });
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += 2;
    if (rectsOverlap(p, player)) {
      if (p.kind === 'heart' && lives < 5) lives++;
      if (p.kind === 'rapid') rapidUntil = performance.now() + 8000;   // 8 seconds
      powerups.splice(i, 1);                                           // collected!
    } else if (p.y > 600) {
      powerups.splice(i, 1);                                           // missed it
    }
  }
}

function drawPowerups() {
  ctx.font = '16px monospace';
  for (const p of powerups) {
    ctx.fillStyle = (p.kind === 'heart') ? '#ff4444' : '#b44fff';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(p.kind === 'heart' ? 'H' : 'R', p.x + 9, p.y + 20);
  }
}

Paste 5. Paste it inside update(), right ABOVE the line // >>> UPDATE LINES GO HERE:

javascript
updatePowerups();

Paste 6. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawPowerups();

Save and refresh.

✅ You should see: You'll need patience — drops are rare! (To test fast, temporarily set DROP_CHANCE to [1, 1, 1, 1], then change it back.)

💡 What does it mean?

Two separate rolls. Roll 1 asks "does this kill drop anything?" (3% for blue, up to 15% for pink). Roll 2 asks "which item?" using that enemy's table. Never mix them up!
Roll 2 is like a pie chart: we walk around the slices, subtracting each size from the roll until it goes below zero. That's the slice we landed on.
Rare enemies are worth more points and have a better chance of dropping better loot — so players chase them.
Safety rules: max 3 power-ups on screen, and missed ones are deleted when they fall off the bottom.
H = heart (+1 life, max 5). R = rapid shot (faster firing for 8 seconds).

🎮 Try it: Make pink enemies always drop a heart: set pink to { heart: 100, rapid: 0 }.

🔍 In the real game: tryDropLoot(), pickLootType(), LOOT_TABLES, applyPowerup() in game.js (the real game has 5 power-ups; this mini version has 2).

Step 10 — Play again (restart)

Goal: Press ENTER after game over to start fresh.

Paste 1. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function resetGame() {
  // Put EVERYTHING back to the start, or old bullets and loot sneak into the new game
  player.x = 372;
  bullets.length = 0;
  enemyBullets.length = 0;
  powerups.length = 0;
  score = 0;
  lives = 3;
  wave = 1;
  enemyDir = 1;
  enemySpeed = 1.2;
  enemyShootDelay = 1000;
  rapidUntil = 0;
  gameOver = false;
  spawnEnemies();
}

window.addEventListener('keydown', function (e) {
  if (e.code === 'Enter' && gameOver) resetGame();
});

function drawRestartHint() {
  ctx.fillStyle = '#00f5ff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', 400, 340);
  ctx.textAlign = 'left';
}

Paste 2. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
if (gameOver) drawRestartHint();

Save and refresh.

✅ You should see: Lose all lives, press ENTER: a fresh WAVE 1 starts with 3 lives and no old bullets.

💡 What does it mean?

A restart must reset everything — arrays, numbers, timers. If you forget one thing, bugs from the last game follow you into the next.
We only listen for ENTER while gameOver is true, so it can't restart a game in progress.

🎮 Try it: Remove powerups.length = 0; from resetGame, then restart after dropping loot. What goes wrong?

🔍 In the real game: restartGame(), initGame() and hideAllOverlays() in game.js.

Step 11 — Save your best score (personal records)

Goal: Remember the best score and best wave, even after you close the tab.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
let bestScore = 0;
let bestWave = 1;
try {
  bestScore = parseInt(localStorage.getItem('mini_best_score') || '0', 10) || 0;
  bestWave  = parseInt(localStorage.getItem('mini_best_wave')  || '1', 10) || 1;
} catch (e) { }   // storage can be blocked (e.g. private mode) - the game must still work

Paste 2 — REPLACE a function. Press Ctrl+F and search for function endGame. Select that whole function (from function to its closing }) and replace it with this new version:

javascript
function endGame() {
  gameOver = true;
  saveRecords();      // save once, when the run ends (not every frame!)
}

Paste 3. Paste it right ABOVE the line that says // >>> FUNCTIONS GO HERE:

javascript
function saveRecords() {
  if (score > bestScore) bestScore = score;
  if (wave > bestWave) bestWave = wave;
  try {
    localStorage.setItem('mini_best_score', bestScore);
    localStorage.setItem('mini_best_wave', bestWave);
  } catch (e) { }
}

function drawBest() {
  ctx.fillStyle = '#9070b0';
  ctx.font = '14px monospace';
  ctx.fillText('BEST: ' + bestScore + '   BEST WAVE: ' + bestWave, 20, 52);
}

Paste 4. Paste it inside render(), right ABOVE the line // >>> DRAW LINES GO HERE:

javascript
drawBest();

Save and refresh.

✅ You should see: Play, lose, then refresh the page (F5). BEST SCORE and BEST WAVE are still there.

💡 What does it mean?

localStorage is a tiny notepad inside the browser. It remembers things between visits — but only on this browser and device. It is not an online leaderboard.
We save only when a run ends. Saving 60 times a second would be wasteful.
try / catch means: try this, and if the browser says no, don't crash.

🎮 Try it: Open DevTools (F12) → Application → Local Storage and find mini_best_score.

🔍 In the real game: saveInfinityRecords(), INF_KEYS and triggerInfinityOver() in game.js (it saves the best wave, best score and survival time).

Step 12 — Make it fast and smooth (performance)

Goal: Stop lag and make the game run the same speed on every screen.

Paste 1. Paste it right ABOVE the line that says // >>> DATA GOES HERE:

javascript
const MAX_BULLETS = 55;   // safety cap

Paste 2 — REPLACE a function. Press Ctrl+F and search for function fireBullet. Select that whole function (from function to its closing }) and replace it with this new version:

javascript
function fireBullet() {
  if (bullets.length >= MAX_BULLETS) return;   // too many already? skip this shot
  bullets.push({ x: player.x + player.w / 2 - 5, y: player.y - 20, w: 10, h: 20 });
}

Paste 3 — REPLACE the game loop. Scroll to the bottom of your script. Select from function gameLoop() { down to requestAnimationFrame(gameLoop); (the very last line of the script) and replace all of it with this:

javascript
const STEP = 1000 / 60;   // the game always moves in 1/60-second slices
let lastTime = 0;
let accumulator = 0;

function gameLoop(time) {
  if (!lastTime) lastTime = time;
  accumulator += Math.min(100, time - lastTime);   // time since the last frame
  lastTime = time;
  let steps = 0;
  while (accumulator >= STEP && steps < 3) {       // spend the saved-up time in equal slices
    update();
    accumulator -= STEP;
    steps++;
  }
  if (accumulator > STEP) accumulator = 0;
  render();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

Save and refresh.

✅ You should see: Everything works the same, but now holding SPACE for a minute stays smooth, and the speed matches on every monitor.

💡 What does it mean?

Cap: an array that can grow forever will eventually slow your game down. MAX_BULLETS says: no more than 55.
Fixed timestep: a 144Hz monitor calls the loop 2.4× more often than a 60Hz one. Without this fix, your game would run 2.4× faster on a gaming monitor! The accumulator is a savings jar of elapsed time; each update() spends exactly 1/60 of a second from it.
steps < 3 stops a slow computer from spiralling into even slower frames.
In the real game we also fixed lag by: removing glow (shadowBlur) from crowded objects, drawing the background once instead of every frame, only updating the power-up HUD when its text changes, and limiting how often each sound can play.

🎮 Try it: Hold SPACE for 60 seconds. Open DevTools (F12) → Console and type bullets.length. It never goes above 55!

🔍 In the real game: gameLoop(), STEP, MAX_PLAYER_BULLETS in game.js, plus getBgCache() and the sfxLast sound throttle.

🎉 You did it!

You just built a game with a game loop, keyboard input, bullets, enemies, collision detection, score and lives, game states, endless waves, rare loot, saved records, and performance protection. That is how real games are made.

Scavenger hunt: find it in the real game

Open the real game.js from the TECHNOPIXEL project. Press Ctrl+F and search for each name. Tick them off!

You built (mini game)	Search for this in the real game.js	What it does
player object	const player = {	Everything about the ship
keys + updatePlayer()	function updatePlayer	Reads keys, moves the ship
fireBullet() + cooldown	function firePlayerBullet and PLAYER_BULLET_COOL	Time-based shooting
Bullet cap MAX_BULLETS	MAX_PLAYER_BULLETS	Stops too many bullets
spawnEnemies()	function spawnFormation	Builds the enemy grid
rectsOverlap()	function rectsOverlap	Box-vs-box collision
checkBulletHits()	function checkCollisions	Bullets kill enemies, score goes up
endGame()	function triggerGameOver	Ends the run
checkWaveClear()	function checkWaveComplete	Starts the next wave
Endless difficulty	function getWaveData and isFinalWave	Infinity Room waves with limits
tryDropLoot() / pickLoot()	function tryDropLoot and function pickLootType	The two loot rolls
DROP_CHANCE / LOOT_TABLE	POWERUP_DROP_CHANCE and LOOT_TABLES	Drop odds and reward tables
saveRecords()	function saveInfinityRecords	Saves best wave / score / time
resetGame()	function restartGame and function initGame	Fresh start
Fixed-timestep gameLoop	function gameLoop and const STEP	Same speed on every monitor
Bonus missions
Easy: Change the colors of the enemies in ENEMY_COLORS.
Easy: Make the ship wider (w: 90). Is the game easier or harder?
Medium: Make the score pop up bigger when you hit a pink enemy.
Medium: Add a third loot item called big that makes bullets 20 pixels wide for 8 seconds. (Hint: copy how rapid works.)
Hard: Add a PAUSE with the P key. (Hint: you need a new variable and an if at the top of update().)
Fix-it table
What you see	Probably why	What to do
Blank page	A typo or missing }	F12 → Console → read the red message and line number
X is not defined	You skipped a step, or pasted in the wrong place	Check that the earlier step's code is in your file
Ship doesn't move	The page isn't focused	Click on the page first, then press the keys
SPACE scrolls the page	Step 4's last paste is missing	Paste the preventDefault line from Step 4
Nothing changes after you edit	You didn't save, or the browser is showing the old file	Ctrl+S, then Ctrl+Shift+R
Pasted code appears twice	You pasted two times	Delete the copy
Game is too hard/easy	That's a setting!	Change the numbers (speed, delay, lives)
Totally lost	It happens to everyone	Copy the full finished file from the appendix and compare
Mini glossary
Word	Plain English
Variable	A labeled box that holds a value (let score = 0;)
Object	A bag of facts about one thing (player, an enemy)
Array	An ordered list (bullets, enemies)
Function	A reusable recipe (drawPlayer())
Loop	Do something again and again
Canvas	A drawing board you paint on with code
Game loop	The update → draw cycle that runs ~60 times a second
Frame	One pass of the game loop (one picture in the flip-book)
Collision (AABB)	Checking whether two rectangles overlap
Game state	What mode the game is in (playing, game over…)
Cooldown	A short wait before you can do something again
Cap	A limit so something can't grow forever
Fixed timestep	Moving the game in equal time slices so speed is the same everywhere
localStorage	The browser's tiny notepad for saving data
Appendix — The full finished file

Stuck? Replace everything in your index.html with this complete, working version of all 12 steps.

html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Space Shooter</title>
  <style>
    body   { margin: 0; background: #0d0020; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { background: #16002e; border: 2px solid #ff2eff; max-width: 100%; max-height: 100vh; }
  </style>
</head>
<body>
<canvas id="game" width="800" height="600"></canvas>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameOver = false;   // we will use this in Step 7

const player = { x: 372, y: 520, w: 56, h: 56, speed: 5 };

const keys = {};

const bullets = [];
let lastShot = 0;
const SHOOT_COOLDOWN = 160;   // milliseconds between shots

let enemies = [];
let enemyDir = 1;            // 1 = moving right, -1 = moving left
let enemySpeed = 1.2;
const ENEMY_COLORS = ['#7ec8ff', '#ff7e7e', '#7eff9e', '#ff7eff'];   // blue, red, green, pink
const ENEMY_POINTS = [10, 20, 50, 100];
spawnEnemies();

let score = 0;

const enemyBullets = [];
let lastEnemyShot = 0;
let enemyShootDelay = 1000;   // milliseconds between enemy shots
let lives = 3;

let wave = 1;

const powerups = [];
const DROP_CHANCE = [0.03, 0.05, 0.09, 0.15];   // blue, red, green, pink: chance a kill drops something
const LOOT_TABLE = [                            // IF it drops, which item? (each row adds up to 100)
  { heart: 70, rapid: 30 },   // blue
  { heart: 55, rapid: 45 },   // red
  { heart: 35, rapid: 65 },   // green
  { heart: 20, rapid: 80 },   // pink
];
let rapidUntil = 0;           // time when RAPID SHOT runs out

let bestScore = 0;
let bestWave = 1;
try {
  bestScore = parseInt(localStorage.getItem('mini_best_score') || '0', 10) || 0;
  bestWave  = parseInt(localStorage.getItem('mini_best_wave')  || '1', 10) || 1;
} catch (e) { }   // storage can be blocked (e.g. private mode) - the game must still work

const MAX_BULLETS = 55;   // safety cap

// >>> DATA GOES HERE

function drawPlayer() {
  ctx.fillStyle = '#ff2eff';
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

window.addEventListener('keydown', function (e) { keys[e.code] = true; });
window.addEventListener('keyup',   function (e) { keys[e.code] = false; });

function updatePlayer() {
  let dx = 0;
  if (keys['ArrowLeft']  || keys['KeyA']) dx = -1;
  if (keys['ArrowRight'] || keys['KeyD']) dx =  1;
  player.x += dx * player.speed;
  player.x = Math.max(0, Math.min(800 - player.w, player.x));
}

function fireBullet() {
  if (bullets.length >= MAX_BULLETS) return;   // too many already? skip this shot
  bullets.push({ x: player.x + player.w / 2 - 5, y: player.y - 20, w: 10, h: 20 });
}

function handleShooting() {
  const now = performance.now();
  const cooldown = (now < rapidUntil) ? SHOOT_COOLDOWN / 2 : SHOOT_COOLDOWN;   // rapid shot = twice as fast
  if (keys['Space'] && now - lastShot >= cooldown) {
    fireBullet();
    lastShot = now;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 9;                                    // move up
    if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);   // off the top? delete it
  }
}

function drawBullets() {
  ctx.fillStyle = '#00f5ff';
  for (const b of bullets) ctx.fillRect(b.x, b.y, b.w, b.h);
}

// Stop the SPACE bar from scrolling the page
window.addEventListener('keydown', function (e) { if (e.code === 'Space') e.preventDefault(); });

function spawnEnemies() {
  enemies = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      // top row = pink (type 3), bottom row = blue (type 0)
      enemies.push({ x: 100 + col * 60, y: 60 + row * 50, w: 40, h: 36, type: 3 - row });
    }
  }
}

function updateEnemies() {
  let hitWall = false;
  for (const e of enemies) {
    if ((enemyDir === 1 && e.x + e.w >= 796) || (enemyDir === -1 && e.x <= 4)) hitWall = true;
  }
  if (hitWall) {
    enemyDir *= -1;                          // turn around
    for (const e of enemies) e.y += 20;      // and drop down
  } else {
    for (const e of enemies) e.x += enemySpeed * enemyDir;
  }
}

function drawEnemies() {
  for (const e of enemies) {
    ctx.fillStyle = ENEMY_COLORS[e.type];
    ctx.fillRect(e.x, e.y, e.w, e.h);
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function checkBulletHits() {
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (rectsOverlap(bullets[bi], e)) {
        score += ENEMY_POINTS[e.type];
        tryDropLoot(e.x + e.w / 2, e.y + e.h / 2, e.type);   // ONE roll per kill
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        break;
      }
    }
  }
}

function drawScore() {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText('SCORE: ' + score, 20, 30);
}

function endGame() {
  gameOver = true;
  saveRecords();      // save once, when the run ends (not every frame!)
}

function enemyShooting() {
  const now = performance.now();
  if (enemies.length > 0 && now - lastEnemyShot > enemyShootDelay) {
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];   // pick a random enemy
    enemyBullets.push({ x: shooter.x + shooter.w / 2 - 4, y: shooter.y + shooter.h, w: 8, h: 16 });
    lastEnemyShot = now;
  }
}

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += 3.5;
    if (rectsOverlap(enemyBullets[i], player)) {
      enemyBullets.splice(i, 1);
      lives--;
      if (lives <= 0) endGame();
    } else if (enemyBullets[i].y > 600) {
      enemyBullets.splice(i, 1);
    }
  }
}

// If an enemy reaches the player's row, it's over
function checkInvasion() {
  for (const e of enemies) {
    if (e.y + e.h >= player.y) endGame();
  }
}

function drawEnemyBullets() {
  ctx.fillStyle = '#ff4444';
  for (const b of enemyBullets) ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawLives() {
  ctx.fillStyle = '#ff2eff';
  ctx.font = '16px monospace';
  ctx.fillText('LIVES: ' + lives, 680, 30);
}

function drawGameOver() {
  ctx.fillStyle = '#ffffff';
  ctx.font = '40px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', 400, 300);
  ctx.textAlign = 'left';
}

function checkWaveClear() {
  if (enemies.length === 0) {
    wave++;
    bullets.length = 0;          // clear leftover bullets
    enemyBullets.length = 0;
    // Harder every wave... but Math.min / Math.max put a LIMIT on it
    enemySpeed      = Math.min(4, 1.2 + (wave - 1) * 0.25);
    enemyShootDelay = Math.max(350, 1000 - (wave - 1) * 60);
    spawnEnemies();
  }
}

function drawWave() {
  ctx.fillStyle = '#b44fff';
  ctx.font = '16px monospace';
  ctx.fillText('WAVE ' + wave + ' \u221E', 340, 30);
}

// ROLL 2: WHICH item? Walk down the table, subtracting each weight until we go below zero.
function pickLoot(enemyType) {
  const table = LOOT_TABLE[enemyType];
  let roll = Math.random() * 100;
  for (const name in table) {
    roll -= table[name];
    if (roll < 0) return name;
  }
  return 'heart';
}

// ROLL 1: does this kill drop anything at all?
function tryDropLoot(x, y, enemyType) {
  if (powerups.length >= 3) return;                          // never more than 3 on screen
  if (Math.random() >= DROP_CHANCE[enemyType]) return;       // no luck
  powerups.push({ x: x - 14, y: y, w: 28, h: 28, kind: pickLoot(enemyType) });
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += 2;
    if (rectsOverlap(p, player)) {
      if (p.kind === 'heart' && lives < 5) lives++;
      if (p.kind === 'rapid') rapidUntil = performance.now() + 8000;   // 8 seconds
      powerups.splice(i, 1);                                           // collected!
    } else if (p.y > 600) {
      powerups.splice(i, 1);                                           // missed it
    }
  }
}

function drawPowerups() {
  ctx.font = '16px monospace';
  for (const p of powerups) {
    ctx.fillStyle = (p.kind === 'heart') ? '#ff4444' : '#b44fff';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(p.kind === 'heart' ? 'H' : 'R', p.x + 9, p.y + 20);
  }
}

function resetGame() {
  // Put EVERYTHING back to the start, or old bullets and loot sneak into the new game
  player.x = 372;
  bullets.length = 0;
  enemyBullets.length = 0;
  powerups.length = 0;
  score = 0;
  lives = 3;
  wave = 1;
  enemyDir = 1;
  enemySpeed = 1.2;
  enemyShootDelay = 1000;
  rapidUntil = 0;
  gameOver = false;
  spawnEnemies();
}

window.addEventListener('keydown', function (e) {
  if (e.code === 'Enter' && gameOver) resetGame();
});

function drawRestartHint() {
  ctx.fillStyle = '#00f5ff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', 400, 340);
  ctx.textAlign = 'left';
}

function saveRecords() {
  if (score > bestScore) bestScore = score;
  if (wave > bestWave) bestWave = wave;
  try {
    localStorage.setItem('mini_best_score', bestScore);
    localStorage.setItem('mini_best_wave', bestWave);
  } catch (e) { }
}

function drawBest() {
  ctx.fillStyle = '#9070b0';
  ctx.font = '14px monospace';
  ctx.fillText('BEST: ' + bestScore + '   BEST WAVE: ' + bestWave, 20, 52);
}

// >>> FUNCTIONS GO HERE

function update() {
  if (gameOver) return;      // when the game is over, nothing moves
  updatePlayer();
  handleShooting();
  updateBullets();
  updateEnemies();
  checkBulletHits();
  enemyShooting();
  updateEnemyBullets();
  checkInvasion();
  checkWaveClear();
  updatePowerups();
  // >>> UPDATE LINES GO HERE
}

function render() {
  ctx.clearRect(0, 0, 800, 600);   // wipe the canvas
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawScore();
  drawEnemyBullets();
  drawLives();
  if (gameOver) drawGameOver();
  drawWave();
  drawPowerups();
  if (gameOver) drawRestartHint();
  drawBest();
  // >>> DRAW LINES GO HERE
}

const STEP = 1000 / 60;   // the game always moves in 1/60-second slices
let lastTime = 0;
let accumulator = 0;

function gameLoop(time) {
  if (!lastTime) lastTime = time;
  accumulator += Math.min(100, time - lastTime);   // time since the last frame
  lastTime = time;
  let steps = 0;
  while (accumulator >= STEP && steps < 3) {       // spend the saved-up time in equal slices
    update();
    accumulator -= STEP;
    steps++;
  }
  if (accumulator > STEP) accumulator = 0;
  render();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
</script>
</body>
</html>

TECHNOPIXEL SPACE INVADERS · Baby-Step Code Walkthrough · Created by Dave Punzalan · TechNoPixel · 2026
// =============================================================================
//  TECHNOPIXEL SPACE INVADERS — game.js
//  Workshop Day 1 · TechNoPixel Web Game Development Workshop
//  Created by Dave Punzalan · TECHNOPIXEL
//
//  HOW THIS FILE IS ORGANIZED:
//   1.  Configuration & asset paths
//   2.  Asset loading
//   3.  Game state & initialization
//   4.  Keyboard & touch input
//   5.  Player movement & shooting
//   6.  Enemy formation & side enemies
//   7.  Enemy projectiles
//   8.  Collision detection
//   9.  Scoring, lives & power-ups
//  10.  Wave progression
//  11.  Update loop (game logic)
//  12.  Rendering (drawing)
//  13.  Audio (music + sound effects)
//  14.  Pause, victory, game-over & restarting
//  15.  Screen transitions & nav wiring
// =============================================================================

// WORKSHOP STEP 0: Wait for the HTML page to fully load before doing anything.
// "DOMContentLoaded" fires once the browser has built all the HTML elements.
document.addEventListener('DOMContentLoaded', function () {

  // ===========================================================================
  // SECTION 1: CONFIGURATION & ASSET PATHS
  //
  // WORKSHOP STEP 1: Keep ALL tuning values in one place.
  // Think of CONFIG as a "settings panel" — change a number here and it
  // affects the entire game. This makes tweaking the game during a workshop
  // super easy without hunting through hundreds of lines of code.
  // ===========================================================================

  const CONFIG = {
    // --- Canvas dimensions ---
    // The game is designed for a 800×600 internal coordinate space.
    // We scale it to fit the screen without distorting sprites.
    CANVAS_W: 800,
    CANVAS_H: 600,

    // --- Player ---
    PLAYER_SPEED:       4,     // Pixels the ship moves per frame
    PLAYER_LIVES:       3,     // Starting lives
    PLAYER_MAX_LIVES:   5,     // Maximum lives (heart power-up won't exceed this)
    PLAYER_W:           56,    // Player sprite render width  (px)
    PLAYER_H:           56,    // Player sprite render height (px)
    PLAYER_BULLET_COOL: 160,   // Ms between shots (140-180 feels good). TIME-based, so holding Space can't flood bullets
    MAX_PLAYER_BULLETS: 55,    // PERF: cap on active player bullets
    MAX_ENEMY_BULLETS:  55,    // PERF: cap on active enemy bullets
    MAX_PARTICLES:      120,   // PERF: cap on active particles
    INVULN_DURATION:    1500,  // Milliseconds of invulnerability after being hit

    // --- Enemies ---
    ENEMY_W:            48,    // Formation enemy sprite width
    ENEMY_H:            48,    // Formation enemy sprite height
    ENEMY_COLS:         10,    // Columns in formation
    ENEMY_ROWS:         4,     // Rows in formation
    ENEMY_X_GAP:        16,    // Horizontal gap between enemies
    ENEMY_Y_GAP:        14,    // Vertical gap between enemies
    ENEMY_DROP:         24,    // How far the formation drops when hitting a wall
    ENEMY_SHOOT_INTERVAL: 1200, // Base ms between enemy shots (decreases each wave)
    ENEMY_BULLET_SPEED: 3.5,   // Enemy bullet falling speed (px/frame)

    // --- Side enemies ---
    SIDE_ENEMY_W:        44,
    SIDE_ENEMY_H:        44,
    SIDE_ENEMY_SPEED:    2.2,  // Base speed (increases each wave)
    SIDE_ENEMY_INTERVAL: 5000, // Base ms between side enemy spawns

    // --- Power-ups ---
    POWERUP_DROP_CHANCE: [0.03, 0.05, 0.09, 0.15], // Per-kill chance by enemy type: blue, red, green, pink
    POWERUP_MAX_ACTIVE:  3,    // Never more than 3 power-ups on screen at once
    INF_MAX_SPEED_MULT:  4.0,  // Infinity Room difficulty caps (keeps it playable)
    INF_MIN_SHOOT_MULT:  0.30,
    INF_MAX_SIDE:        7,
    POWERUP_W:           36,
    POWERUP_H:           36,
    POWERUP_SPEED:       1.8,  // Falling speed (px/frame)
    POWERUP_DURATION:    8000, // Duration of timed power-ups (ms)

    // --- Bullets ---
    BULLET_W:            14,   // Normal bullet render width
    BULLET_H:            22,   // Normal bullet render height
    BULLET_SPEED:        9,    // Bullet upward speed (px/frame)
    BIG_BULLET_W:        24,
    BIG_BULLET_H:        30,

    // --- Waves ---
    TOTAL_WAVES:         5,
    WAVE_CLEAR_DELAY:    3000, // Countdown seconds × 1000
  };

  // ---------------------------------------------------------------------------
  // ASSET PATHS — all file paths live here so they're easy to update.
  // These are RELATIVE paths that work when opening index.html directly.
  // ---------------------------------------------------------------------------
  const ASSETS = {
    images: {
      background:    'techassets/Background.png',
      textLogo:      'techassets/TEXT.png',
      emblem:        'techassets/newLogo.png',
      spaceship:     'techassets/technospaceship.png',
      bullet:        'techassets/bullet.png',
      enemy1:        'techassets/enemy1.png',   // blue   10 pts
      enemy2:        'techassets/enemy2.png',   // red    20 pts
      enemy3:        'techassets/enemy3.png',   // green  50 pts
      enemy4:        'techassets/enemy4.png',   // pink  100 pts
      sidenemy1:     'techassets/sidenemy1.png',
      sidenemy2:     'techassets/sidenemy2.png',
      sidenemy3:     'techassets/sidenemy3.png',
      sidenemy4:     'techassets/sidenemy4.png',
      // Power-up images — all confirmed present in techassets/
      heart:         'techassets/heart.png',
      shield:        'techassets/shield.png',
      multishot:     'techassets/multishot.png',
      bigbullet:     'techassets/bigbullet.png', // (renamed from bigbulletmoto.png)
      rapidshot:     'techassets/rapidshot.png',
    },
    music: 'techassets/music.mp3',
  };

  // Point values for each enemy type (index matches enemy1..enemy4)
  const ENEMY_POINTS = [10, 20, 50, 100];

  // LOOT TABLES: which power-up is picked AFTER a drop succeeds (each row = 100%).
  // Index matches enemy type: 0 blue, 1 red, 2 green, 3 pink. Side enemies use the same tier.
  const LOOT_TABLES = [
    { heart: 35, rapidshot: 35, multishot: 15, shield: 10, bigbullet: 5  }, // blue
    { heart: 25, rapidshot: 30, multishot: 20, shield: 15, bigbullet: 10 }, // red
    { heart: 15, rapidshot: 20, multishot: 25, shield: 22, bigbullet: 18 }, // green
    { heart: 10, rapidshot: 15, multishot: 25, shield: 25, bigbullet: 25 }, // pink
  ];

  // Power-up type definitions
  const POWERUP_TYPES = [
    { id: 'heart',     label: '❤️',  name: 'EXTRA LIFE',  color: '#ff4444' },
    { id: 'shield',    label: '🛡️', name: 'SHIELD',      color: '#00f5ff' },
    { id: 'multishot', label: '🔱',  name: 'MULTISHOT',   color: '#ff2eff' },
    { id: 'bigbullet', label: '💥',  name: 'BIG BULLET',  color: '#ffaa00' },
    { id: 'rapidshot', label: '⚡',  name: 'RAPID SHOT',  color: '#b44fff' },
  ];

  // ===========================================================================
  // SECTION 2: ASSET LOADING
  //
  // WORKSHOP STEP 1: Load the images used by the game.
  // We can't draw anything until the image files are downloaded from disk.
  // We create a list of images to load, keep track of how many have finished,
  // and only start the game when everything is ready (or has safely failed).
  // ===========================================================================

  // This object will hold the loaded HTMLImageElement for each asset key.
  // Think of it as a shelf: we store the image here once it arrives.
  const imgs = {};

  // How many images we expect to load, and how many have finished
  let totalAssets  = 0;
  let loadedAssets = 0;

  // Reference to the progress bar and status text on the loading screen
  const loadingBarFill   = document.getElementById('loading-bar-fill');
  const loadingBarPct    = document.getElementById('loading-bar-percent');
  const loadingStatusEl  = document.getElementById('loading-status');

  // Status messages cycle through as assets load — gives the loading screen life
  const loadingMessages = [
    'INITIALIZING PIXEL UNIVERSE...',
    'CALIBRATING NEON GRID...',
    'LOADING INVADER PATTERNS...',
    'CHARGING PLASMA CANNONS...',
    'SYNCING PIXEL DRIVE...',
    'DEPLOYMENT READY.',
  ];
  let msgIndex = 0;

  /**
   * loadImage — loads a single image from a URL.
   */
  function loadImage(key, url) {
    if (!url) {
      imgs[key] = null;
      return;
    }

    const img = new Image();

    img.onload = function () {
      imgs[key] = img;
      loadedAssets++;
      updateLoadingProgress();
    };

    img.onerror = function () {
      console.warn('ASSET NOT FOUND: ' + url + ' (key: ' + key + ')');
      imgs[key] = null;
      loadedAssets++;
      updateLoadingProgress();
    };

    img.src = url;
  }

  /** Update the loading bar UI and transition when done */
  function updateLoadingProgress() {
    const percent = totalAssets > 0
      ? Math.round((loadedAssets / totalAssets) * 100)
      : 100;

    if (loadingBarFill)  loadingBarFill.style.width   = percent + '%';
    if (loadingBarPct)   loadingBarPct.textContent     = percent + '%';

    const msgIdx = Math.min(
      Math.floor((percent / 100) * (loadingMessages.length - 1)),
      loadingMessages.length - 1
    );
    if (loadingStatusEl) loadingStatusEl.textContent = loadingMessages[msgIdx];

    const loadScreen = document.getElementById('loading-screen');
    if (loadScreen) loadScreen.setAttribute('aria-valuenow', percent);

    if (loadedAssets >= totalAssets) {
      setTimeout(transitionToLanding, 800);
    }
  }

  // IMPORTANT: Count totalAssets FIRST, then start loading.
  // This prevents a race condition where cached images fire onload
  // before totalAssets has been fully counted.
  const imageEntries = Object.entries(ASSETS.images).filter(([, url]) => url !== null);
  totalAssets = imageEntries.length;

  if (totalAssets === 0) {
    // No images to load at all — go straight to landing
    setTimeout(transitionToLanding, 1200);
  } else {
    // Now start loading all images
    imageEntries.forEach(([key, url]) => loadImage(key, url));
  }

  // Hard timeout safety net — if loading stalls for any reason, proceed after 8 seconds
  setTimeout(function () {
    if (document.getElementById('loading-screen').classList.contains('active')) {
      console.warn('Loading timeout — proceeding to landing page anyway.');
      transitionToLanding();
    }
  }, 8000);

  // ===========================================================================
  // MATRIX (FALLING CODE) ANIMATION
  //
  // WORKSHOP STEP 1b: Falling katakana characters, like a retro cyberpunk effect.
  // We draw columns of characters onto a canvas, each column at a different
  // vertical position. Each frame we fade the old drawing slightly (by drawing
  // a semi-transparent black rectangle over it) then draw new characters.
  // ===========================================================================

  const matrixCanvas = document.getElementById('matrix-canvas');
  const matrixCtx    = matrixCanvas ? matrixCanvas.getContext('2d') : null;

  // Characters to use — katakana + binary
  const MATRIX_CHARS = 'テクノピクセル01テクノピクセルTECHNOPIXEL01テノピ10テクノ';

  let matrixCols   = 0;
  let matrixDrops  = [];
  let matrixRafId  = null; // We store the animation frame ID so we can stop it later

  function initMatrix() {
    if (!matrixCanvas || !matrixCtx) return;
    matrixCanvas.width  = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const fontSize = 14;
    matrixCols = Math.floor(matrixCanvas.width / fontSize);

    // Each column starts at a random vertical position
    matrixDrops = [];
    for (let i = 0; i < matrixCols; i++) {
      matrixDrops[i] = Math.random() * matrixCanvas.height;
    }

    matrixCtx.font = fontSize + 'px monospace';
  }

  function drawMatrix() {
    if (!matrixCtx) return;

    // Draw a faint black overlay — this creates the "trail" or "fading" effect
    matrixCtx.fillStyle = 'rgba(13, 0, 32, 0.12)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    for (let i = 0; i < matrixCols; i++) {
      // Pick a random character from our string
      const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];

      // Alternate between magenta and violet for color variety
      const bright = Math.random() > 0.85;
      matrixCtx.fillStyle = bright ? 'rgba(255, 46, 255, 0.8)' : 'rgba(140, 60, 220, 0.4)';

      // Draw the character at column i, at the current drop height
      matrixCtx.fillText(char, i * 14, matrixDrops[i]);

      // Move the drop down; reset to top with a small random chance
      matrixDrops[i] += 14;
      if (matrixDrops[i] > matrixCanvas.height && Math.random() > 0.975) {
        matrixDrops[i] = 0;
      }
    }

    // Schedule next frame
    matrixRafId = requestAnimationFrame(drawMatrix);
  }

  function stopMatrix() {
    if (matrixRafId) {
      cancelAnimationFrame(matrixRafId);
      matrixRafId = null;
    }
  }

  // Start the matrix animation only if reduced-motion is not preferred
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initMatrix();
    drawMatrix();
  }

  // Resize matrix canvas when window size changes
  window.addEventListener('resize', function () {
    if (matrixRafId) { initMatrix(); }
  });

  // ===========================================================================
  // SECTION 3: GAME STATE & INITIALIZATION
  //
  // WORKSHOP STEP 2: Keep the player's position and current status in variables.
  // Variables are labelled boxes that hold information.
  // When information changes (player moves, score goes up), we update the box.
  // ===========================================================================

  // --- Canvas & context ---
  // The canvas is our "painting surface" inside the browser
  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');

  // --- Game state machine ---
  // STATE controls which screen is active. It can only be ONE value at a time.
  // Possible values: 'loading' | 'menu' | 'playing' | 'paused' |
  //                  'wave-cleared' | 'victory' | 'game-over'
  let STATE = 'loading';

  // --- Player object ---
  // All information about the player lives in one object (a "bag" of data)
  const player = {
    x:          0,        // Horizontal position (updated in initGame)
    y:          0,        // Vertical position
    w:          CONFIG.PLAYER_W,
    h:          CONFIG.PLAYER_H,
    speed:      CONFIG.PLAYER_SPEED,
    lives:      CONFIG.PLAYER_LIVES,
    score:      0,
    wave:       1,
    shieldActive:   false,  // True when shield power-up is active
    multishot:      false,
    bigBullet:      false,
    rapidShot:      false,
    multishotTimer: 0,      // ms remaining on multishot
    bigBulletTimer: 0,
    rapidShotTimer: 0,
    lastShotTime:   0,      // Timestamp of last shot fired
    invulnUntil:    0,      // Timestamp when invulnerability ends (after hit)
    hitFlash:       0,      // Flash counter for visual hit feedback
  };

  // --- Arrays for game objects ---
  // Arrays are like ordered lists — we can add/remove items as the game runs
  let bullets       = [];   // Player bullets currently flying
  let enemyBullets  = [];   // Enemy bullets currently falling
  let enemies       = [];   // Formation enemies on screen
  let sideEnemies   = [];   // Side enemies sweeping across screen
  let powerups      = [];   // Power-up drops falling from sky
  let particles     = [];   // Explosion / hit visual effects

  // --- Formation movement ---
  let formationDir      = 1;     // 1 = moving right, -1 = moving left
  let formationSpeedX   = 0.5;   // Horizontal speed of the whole formation
  let lastEnemyShot     = 0;     // Timestamp of last enemy shot
  let lastSideSpawn     = 0;     // Timestamp of last side enemy spawn

  // --- Wave difficulty multipliers (increase each wave) ---
  // Wave index 0 = wave 1, index 4 = wave 5
  const WAVE_DATA = [
    { speedMult: 1.0, shootMult: 1.0, sideMax: 2, rows: 4, cols: 10 },
    { speedMult: 1.3, shootMult: 0.85, sideMax: 3, rows: 4, cols: 10 },
    { speedMult: 1.7, shootMult: 0.70, sideMax: 4, rows: 4, cols: 11 },
    { speedMult: 2.2, shootMult: 0.55, sideMax: 4, rows: 4, cols: 11 },
    { speedMult: 3.0, shootMult: 0.40, sideMax: 5, rows: 4, cols: 12 },
  ];

  // --- High score ---
  // localStorage is like a tiny notepad in the browser — data persists between visits
  let highScore = 0;
  try {
    highScore = parseInt(localStorage.getItem('tp_hiscore') || '0', 10) || 0;
  } catch (e) {
    // localStorage might be blocked (private mode or browser restrictions)
    console.warn('localStorage unavailable — high score will not persist.');
  }

  // --- Game loop ID ---
  // We store the requestAnimationFrame ID so we can stop/cancel duplicate loops
  let animFrameId = null;

  // --- UPGRADE: mode, timing & records ---
  let GAME_MODE = 'classic';          // 'classic' | 'infinity'
  let runMs     = 0;                  // Survival time of the current run (ms, only counts while playing)
  let hudKey    = '';                 // PERF: remembers what the power-up HUD last showed
  let lastFrameTime = 0;              // Timestamp of the previous animation frame
  let accumulator   = 0;              // Leftover ms waiting to be simulated
  const STEP = 1000 / 60;             // Simulation always runs in fixed 60Hz steps
  let infRec   = { wave: 0, score: 0, time: 0 };   // Saved Infinity Room records
  let infStart = { wave: 0, score: 0, time: 0 };   // Records at the START of this run (to detect new bests)

  // --- Wave countdown timer ---
  let waveCountdownVal = 3;
  let waveCountdownTimer = null;

  // ===========================================================================
  // CANVAS SIZING — Make the canvas fill available space keeping aspect ratio
  // ===========================================================================

  function resizeCanvas() {
    const isMobile     = window.innerWidth <= 600;
    const controlsH    = isMobile ? 160 : 0;
    const availW       = window.innerWidth;
    const availH       = window.innerHeight - controlsH;
    const aspect       = CONFIG.CANVAS_W / CONFIG.CANVAS_H;

    let w = availW;
    let h = w / aspect;
    if (h > availH) { h = availH; w = h * aspect; }

    if (canvas.width !== CONFIG.CANVAS_W)   canvas.width  = CONFIG.CANVAS_W; // Internal resolution (setting it clears the canvas,
    if (canvas.height !== CONFIG.CANVAS_H)  canvas.height = CONFIG.CANVAS_H; // so only touch it when it actually differs)
    canvas.style.width  = Math.floor(w) + 'px';
    canvas.style.height = Math.floor(h) + 'px';
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ===========================================================================
  // INITIALIZE / RESET GAME
  //
  // WORKSHOP STEP 2b: Reset everything to a clean starting state.
  // When the player restarts, we call this function to wipe old data.
  // ===========================================================================

  function initGame() {
    // UPGRADE: fresh run bookkeeping
    runMs = 0;
    hudKey = '';
    infStart = { wave: infRec.wave, score: infRec.score, time: infRec.time };

    // Reset player position to bottom-center
    player.x          = CONFIG.CANVAS_W / 2 - CONFIG.PLAYER_W / 2;
    player.y          = CONFIG.CANVAS_H - CONFIG.PLAYER_H - 20;
    player.lives      = CONFIG.PLAYER_LIVES;
    player.score      = 0;
    player.wave       = 1;
    player.shieldActive   = false;
    player.multishot      = false;
    player.bigBullet      = false;
    player.rapidShot      = false;
    player.multishotTimer = 0;
    player.bigBulletTimer = 0;
    player.rapidShotTimer = 0;
    player.lastShotTime   = 0;
    player.invulnUntil    = 0;
    player.hitFlash       = 0;

    // Clear all arrays — wipe bullets, enemies, side enemies, power-ups, particles
    bullets      = [];
    enemyBullets = [];
    sideEnemies  = [];
    powerups     = [];
    particles    = [];

    formationDir    = 1;
    lastEnemyShot   = 0;
    lastSideSpawn   = 0;

    // Create the initial enemy formation
    spawnFormation(player.wave - 1);
  }

  // ===========================================================================
  // SECTION 6: ENEMY FORMATION
  //
  // WORKSHOP STEP 4a: Build the enemy grid.
  // We create a 2D arrangement (rows × columns) of enemy objects.
  // Each enemy is an object (bag of data) storing its position, type, points, etc.
  // ===========================================================================

  /**
   * spawnFormation — creates enemy objects in a grid based on wave difficulty.
   * @param {number} waveIdx — 0-based wave index (0 = wave 1, 4 = wave 5)
   */
  function spawnFormation(waveIdx) {
    enemies      = [];
    formationDir = 1;

    const data   = getWaveData(waveIdx);
    const rows   = data.rows;
    const cols   = data.cols;

    // Formation starting position — centered horizontally, near top
    const totalW = cols * (CONFIG.ENEMY_W + CONFIG.ENEMY_X_GAP) - CONFIG.ENEMY_X_GAP;
    const startX = (CONFIG.CANVAS_W - totalW) / 2;
    const startY = 60;

    // Update formation speed based on wave multiplier
    formationSpeedX = 0.45 * data.speedMult;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Enemy type is determined by row:
        //   row 0 → enemy4 (100 pts, rare pink) — top row
        //   row 1 → enemy3 (50 pts, green)
        //   row 2 → enemy2 (20 pts, red)
        //   row 3 → enemy1 (10 pts, blue) — most common, bottom rows
        let typeIndex;
        if (row === 0)      typeIndex = 3; // pink  100 pts
        else if (row === 1) typeIndex = 2; // green  50 pts
        else if (row === 2) typeIndex = 1; // red    20 pts
        else                typeIndex = 0; // blue   10 pts

        enemies.push({
          x:         startX + col * (CONFIG.ENEMY_W + CONFIG.ENEMY_X_GAP),
          y:         startY + row * (CONFIG.ENEMY_H + CONFIG.ENEMY_Y_GAP),
          w:         CONFIG.ENEMY_W,
          h:         CONFIG.ENEMY_H,
          type:      typeIndex,       // 0-3 index into ENEMY_POINTS
          alive:     true,
          animFrame: 0,               // For a slight hover wobble
          animTimer: 0,
        });
      }
    }
  }

  // ===========================================================================
  // SECTION 4: KEYBOARD & TOUCH INPUT
  //
  // WORKSHOP STEP 3: Read which keyboard keys are being held.
  // We use a "keys" object — a bag where we set key to true when pressed,
  // false when released. Every frame we CHECK this bag to decide what to do.
  // ===========================================================================

  // "keys" is a dictionary: keys['ArrowLeft'] = true means left arrow is held
  const keys = {};

  // Prevent arrow keys and Space from scrolling the page during gameplay
  window.addEventListener('keydown', function (e) {
    keys[e.code] = true;

    // Only block scroll-keys when the game is actively playing or paused
    if (STATE === 'playing' || STATE === 'paused') {
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }
    }

    handleKeyAction(e.code);
  });

  window.addEventListener('keyup', function (e) {
    keys[e.code] = false;
  });

  /**
   * handleKeyAction — handles single-press actions (start, pause, fullscreen).
   * Movement and shooting are handled in the update loop instead.
   */
  function handleKeyAction(code) {
    if (code === 'Enter' || code === 'NumpadEnter') {
      if (STATE === 'menu')       { if (!infPanelOpen()) startGame(); }
      else if (STATE === 'game-over')  { restartGame(); }
      else if (STATE === 'victory')    { restartGame(); }
    }

    if (code === 'KeyP') {
      if (STATE === 'playing')  pauseGame();
      else if (STATE === 'paused') resumeGame();
    }

    if (code === 'KeyF') {
      toggleFullscreen();
    }
  }

  // ===========================================================================
  // TOUCH INPUT — Joystick and fire button for mobile
  //
  // WORKSHOP STEP 3b: Mobile controls use "pointer events" which work for both
  // touch screens and mouse. The joystick tracks where your finger starts and
  // how far it moves to determine left/right direction.
  // ===========================================================================

  const joystickBase  = document.getElementById('joystick-base');
  const joystickThumb = document.getElementById('joystick-thumb');
  const btnFire       = document.getElementById('btn-fire');
  const btnPauseMob   = document.getElementById('btn-pause-mobile');
  const mobileCtrl    = document.getElementById('mobile-controls');

  // Touch state — we track whether fire button is held
  const touch = {
    joystickActive: false,
    joystickStartX: 0,
    joystickDeltaX: 0,
    fireHeld:       false,
  };

  // Show mobile controls on touch-capable devices
  function checkMobileControls() {
    const hasTouchScreen =
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);
    if (hasTouchScreen && mobileCtrl) {
      mobileCtrl.classList.add('visible');
    }
  }

  // Joystick pointer tracking
  if (joystickBase) {
    joystickBase.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      touch.joystickActive = true;
      touch.joystickStartX = e.clientX;
      touch.joystickDeltaX = 0;
      joystickBase.setPointerCapture(e.pointerId);
    });

    joystickBase.addEventListener('pointermove', function (e) {
      if (!touch.joystickActive) return;
      e.preventDefault();
      const delta = e.clientX - touch.joystickStartX;
      const maxRange = 36; // max pixels of movement
      touch.joystickDeltaX = Math.max(-maxRange, Math.min(maxRange, delta));

      // Move the thumb visually
      if (joystickThumb) {
        joystickThumb.style.transform =
          'translate(' + touch.joystickDeltaX + 'px, 0)';
      }
    });

    joystickBase.addEventListener('pointerup', function (e) {
      touch.joystickActive = false;
      touch.joystickDeltaX = 0;
      if (joystickThumb) {
        joystickThumb.style.transform = 'translate(0, 0)';
      }
    });

    joystickBase.addEventListener('pointercancel', function () {
      touch.joystickActive = false;
      touch.joystickDeltaX = 0;
      if (joystickThumb) {
        joystickThumb.style.transform = 'translate(0, 0)';
      }
    });
  }

  // Fire button — held or tapped
  if (btnFire) {
    btnFire.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      touch.fireHeld = true;
      btnFire.classList.add('pressed');
    });
    btnFire.addEventListener('pointerup',     function () {
      touch.fireHeld = false;
      btnFire.classList.remove('pressed');
    });
    btnFire.addEventListener('pointercancel', function () {
      touch.fireHeld = false;
      btnFire.classList.remove('pressed');
    });
  }

  // Mobile pause button
  if (btnPauseMob) {
    btnPauseMob.addEventListener('click', function () {
      if (STATE === 'playing')  pauseGame();
      else if (STATE === 'paused') resumeGame();
    });
  }

  // ===========================================================================
  // SECTION 5: PLAYER MOVEMENT & SHOOTING
  //
  // WORKSHOP STEP 4: Update the player position and fire bullets.
  // "Delta time" means we measure how much time has passed since the last frame
  // and scale movements by it, so the game runs at the same speed on fast and
  // slow computers.
  // ===========================================================================

  /**
   * updatePlayer — called every frame while STATE === 'playing'.
   * @param {number} now — current timestamp in milliseconds (from requestAnimationFrame)
   */
  function updatePlayer(now) {
    // Determine movement direction from keyboard OR joystick
    let dx = 0;
    if (keys['ArrowLeft']  || keys['KeyA']) dx = -1;
    if (keys['ArrowRight'] || keys['KeyD']) dx =  1;

    // Override with joystick if significant movement detected
    if (touch.joystickActive) {
      if      (touch.joystickDeltaX < -10) dx = -1;
      else if (touch.joystickDeltaX >  10) dx =  1;
    }

    // Move the player
    player.x += dx * player.speed;

    // Keep the player inside the canvas boundaries (left and right walls)
    player.x = Math.max(0, Math.min(CONFIG.CANVAS_W - player.w, player.x));

    // Decrement hit-flash counter (used for flashing the ship when hit)
    if (player.hitFlash > 0) player.hitFlash--;

    // --- Power-up timers ---
    // Count down timed power-ups and turn them off when they expire
    if (player.multishot && player.multishotTimer > 0) {
      player.multishotTimer -= 16; // approximate ms per frame at 60fps
      if (player.multishotTimer <= 0) {
        player.multishot      = false;
        player.multishotTimer = 0;
        showPowerupExpiry('MULTISHOT');
      }
    }
    if (player.bigBullet && player.bigBulletTimer > 0) {
      player.bigBulletTimer -= 16;
      if (player.bigBulletTimer <= 0) {
        player.bigBullet      = false;
        player.bigBulletTimer = 0;
        showPowerupExpiry('BIG BULLET');
      }
    }
    if (player.rapidShot && player.rapidShotTimer > 0) {
      player.rapidShotTimer -= 16;
      if (player.rapidShotTimer <= 0) {
        player.rapidShot      = false;
        player.rapidShotTimer = 0;
        showPowerupExpiry('RAPID SHOT');
      }
    }

    // --- Shooting ---
    const shootCooldown = player.rapidShot
      ? CONFIG.PLAYER_BULLET_COOL / 2   // Rapid shot: half cooldown
      : CONFIG.PLAYER_BULLET_COOL;

    const wantsToShoot = keys['Space'] || touch.fireHeld;

    if (wantsToShoot && (now - player.lastShotTime) >= shootCooldown) {
      firePlayerBullet();
      player.lastShotTime = now;
    }

    // Update power-up HUD display
    updatePowerupHUD();
  }

  /**
   * firePlayerBullet — creates one (or three spread) bullet objects.
   * A bullet is just an object with x, y, w, h, and speed.
   */
  function firePlayerBullet() {
    if (bullets.length >= CONFIG.MAX_PLAYER_BULLETS) return; // PERF: hard cap
    playSound('shoot');

    const bulletW = player.bigBullet ? CONFIG.BIG_BULLET_W : CONFIG.BULLET_W;
    const bulletH = player.bigBullet ? CONFIG.BIG_BULLET_H : CONFIG.BULLET_H;

    // Center the bullet on the player
    const bx = player.x + player.w / 2 - bulletW / 2;
    const by = player.y - bulletH;

    if (player.multishot) {
      // Three bullets: center + two angled
      bullets.push({ x: bx,        y: by, w: bulletW, h: bulletH, angle: 0,    big: player.bigBullet });
      bullets.push({ x: bx - 18,   y: by, w: bulletW, h: bulletH, angle: -0.12, big: player.bigBullet });
      bullets.push({ x: bx + 18,   y: by, w: bulletW, h: bulletH, angle:  0.12, big: player.bigBullet });
    } else {
      bullets.push({ x: bx, y: by, w: bulletW, h: bulletH, angle: 0, big: player.bigBullet });
    }
  }

  /**
   * updateBullets — moves player bullets upward each frame.
   * Bullets that go off the top of the screen are removed.
   */
  function updateBullets() {
    // Loop backwards through the array so we can safely remove items while looping
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.y -= CONFIG.BULLET_SPEED;     // Move up
      b.x += b.angle * 5;             // Slight horizontal drift for spread shots

      // Remove bullets that fly off the top of the screen
      if (b.y + b.h < 0) {
        bullets.splice(i, 1);
      }
    }
  }

  // ===========================================================================
  // SECTION 6b: ENEMY FORMATION MOVEMENT
  //
  // WORKSHOP STEP 4b: Move the whole formation left/right like classic Space Invaders.
  // When the edge of the formation touches a side wall, we flip direction and
  // drop the entire formation down a bit.
  // ===========================================================================

  function updateEnemies(now) {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0) return; // No enemies left — wave clear handled elsewhere

    // Find the leftmost and rightmost alive enemy x-positions
    let minX = Infinity, maxX = -Infinity;
    for (const e of aliveEnemies) {
      if (e.x < minX) minX = e.x;
      if (e.x + e.w > maxX) maxX = e.x + e.w;
    }

    // Check if the formation has hit a side wall
    const hitRight = formationDir === 1  && maxX + formationSpeedX >= CONFIG.CANVAS_W - 4;
    const hitLeft  = formationDir === -1 && minX + formationSpeedX <= 4;

    if (hitRight || hitLeft) {
      // Flip the direction
      formationDir *= -1;

      // Drop all enemies down by ENEMY_DROP pixels
      for (const e of aliveEnemies) {
        e.y += CONFIG.ENEMY_DROP;
      }
    } else {
      // Move the whole formation horizontally
      for (const e of aliveEnemies) {
        e.x += formationSpeedX * formationDir;
      }
    }

    // --- Animate enemy sprites (gentle hover bob) ---
    for (const e of enemies) {
      if (!e.alive) continue;
      e.animTimer++;
      if (e.animTimer > 30) {
        e.animFrame = 1 - e.animFrame; // Toggle between 0 and 1
        e.animTimer = 0;
      }
    }

    // --- Check if enemies reached the bottom (breach) ---
    for (const e of aliveEnemies) {
      if (e.y + e.h >= player.y) {
        // Enemies have reached the player's level — lose a life and reset formation
        handlePlayerHit(now);
        spawnFormation(player.wave - 1); // Respawn enemies for this wave
        return; // Only trigger once per frame
      }
    }

    // --- Enemy shooting ---
    // Pick a random alive enemy to fire a projectile at a configurable interval
    const waveData   = getWaveData(player.wave - 1);
    const shootDelay = CONFIG.ENEMY_SHOOT_INTERVAL * waveData.shootMult;

    if (now - lastEnemyShot > shootDelay && aliveEnemies.length > 0 && enemyBullets.length < CONFIG.MAX_ENEMY_BULLETS) {
      // Choose a random alive enemy to shoot
      const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      enemyBullets.push({
        x: shooter.x + shooter.w / 2 - 4,
        y: shooter.y + shooter.h,
        w: 8,
        h: 16,
        speed: CONFIG.ENEMY_BULLET_SPEED,
      });
      lastEnemyShot = now;
      playSound('enemyShoot');
    }
  }

  // ===========================================================================
  // SECTION 6c: SIDE ENEMIES
  //
  // WORKSHOP STEP 4c: Side enemies sweep across the screen periodically.
  // They appear from one side and travel to the other.
  // ===========================================================================

  function updateSideEnemies(now) {
    const waveData = getWaveData(player.wave - 1);
    const interval = CONFIG.SIDE_ENEMY_INTERVAL / waveData.speedMult;

    // Spawn a new side enemy if enough time has passed
    if (now - lastSideSpawn > interval) {
      // Count existing side enemies — limit based on wave
      if (sideEnemies.length < waveData.sideMax) {
        spawnSideEnemy(waveData);
        lastSideSpawn = now;
      }
    }

    // Move each side enemy
    for (let i = sideEnemies.length - 1; i >= 0; i--) {
      const se = sideEnemies[i];
      se.x += se.vx; // vx is the velocity (positive = right, negative = left)

      // Remove side enemy when it exits the screen
      const offscreen = se.vx > 0
        ? se.x > CONFIG.CANVAS_W + 10
        : se.x + se.w < -10;

      if (offscreen) {
        sideEnemies.splice(i, 1);
      }
    }
  }

  /**
   * spawnSideEnemy — creates one side enemy travelling across the screen.
   * Direction is random: either left-to-right or right-to-left.
   */
  function spawnSideEnemy(waveData) {
    const goRight = Math.random() > 0.5; // True = enters from left, false = from right
    const speed   = CONFIG.SIDE_ENEMY_SPEED * waveData.speedMult;

    // Choose side enemy type randomly (higher types are rarer)
    // Weighted: type 0 = 50%, type 1 = 30%, type 2 = 15%, type 3 = 5%
    const rand = Math.random();
    let sType = 0;
    if      (rand > 0.95) sType = 3; // pink 100 pts
    else if (rand > 0.80) sType = 2; // green 50 pts
    else if (rand > 0.50) sType = 1; // red 20 pts

    // Y position: random row in upper third of screen
    const sy = 30 + Math.random() * (CONFIG.CANVAS_H * 0.25);

    sideEnemies.push({
      x:     goRight ? -CONFIG.SIDE_ENEMY_W - 10 : CONFIG.CANVAS_W + 10,
      y:     sy,
      w:     CONFIG.SIDE_ENEMY_W,
      h:     CONFIG.SIDE_ENEMY_H,
      vx:    goRight ? speed : -speed,
      type:  sType,  // 0-3 maps to sidenemy1-4
      alive: true,
    });
  }

  // ===========================================================================
  // SECTION 7: ENEMY PROJECTILES
  //
  // WORKSHOP STEP 4d: Move enemy bullets downward and remove them off-screen.
  // ===========================================================================

  function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];
      eb.y += eb.speed; // Enemy bullets fall downward

      // Remove if it goes off the bottom
      if (eb.y > CONFIG.CANVAS_H + 10) {
        enemyBullets.splice(i, 1);
      }
    }
  }

  // ===========================================================================
  // SECTION 8: COLLISION DETECTION
  //
  // WORKSHOP STEP 5: Check whether bullets overlap with enemies.
  // "Axis-Aligned Bounding Box" (AABB) collision: two rectangles are overlapping
  // if none of their sides are separated. Think of two boxes — if box A's right
  // side is past box B's left side, AND box A's bottom is past box B's top, etc.
  // ===========================================================================

  /**
   * rectsOverlap — returns true if rectangle A overlaps rectangle B.
   * Each rectangle has x (left edge), y (top edge), w (width), h (height).
   */
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw &&  // A's left is before B's right
           ax + aw > bx &&  // A's right is after B's left
           ay < by + bh &&  // A's top is before B's bottom
           ay + ah > by;    // A's bottom is after B's top
  }

  /**
   * checkCollisions — called every frame to test all bullet-vs-enemy pairs.
   * This is WORKSHOP STEP 5 — the most important collision check.
   */
  function checkCollisions(now) {
    // --- Player bullets vs. formation enemies ---
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      let bulletHit = false;

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        if (!e.alive) continue;

        if (rectsOverlap(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
          // Hit! Kill the enemy
          e.alive = false;
          bulletHit = true;

          // Award points — WORKSHOP STEP 6
          player.score += ENEMY_POINTS[e.type];
          playSound('enemyDie');
          spawnParticles(e.x + e.w / 2, e.y + e.h / 2, ENEMY_POINTS[e.type] >= 50 ? '#ff2eff' : '#b44fff', 8);

          // Roll for power-up drop (20% chance)
          tryDropLoot(e.x + e.w / 2, e.y + e.h / 2, e.type); // ONE roll per kill

          break; // One bullet hits one enemy
        }
      }

      if (bulletHit) {
        bullets.splice(bi, 1); // Remove the bullet that hit
      }
    }

    // --- Player bullets vs. side enemies ---
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      let bulletHit = false;

      for (let si = sideEnemies.length - 1; si >= 0; si--) {
        const se = sideEnemies[si];
        if (!se.alive) continue;

        if (rectsOverlap(b.x, b.y, b.w, b.h, se.x, se.y, se.w, se.h)) {
          se.alive = false;
          bulletHit = true;
          player.score += ENEMY_POINTS[se.type];
          playSound('enemyDie');
          spawnParticles(se.x + se.w / 2, se.y + se.h / 2, '#00f5ff', 10);

          tryDropLoot(se.x + se.w / 2, se.y, se.type); // same tiers as formation enemies
          break;
        }
      }

      if (bulletHit) bullets.splice(bi, 1);
    }

    // Remove dead side enemies from the array
    sideEnemies = sideEnemies.filter(se => se.alive);
    enemies = enemies.filter(e => e.alive); // PERF: dead formation enemies leave the array right away

    // --- Enemy bullets vs. player ---
    for (let ei = enemyBullets.length - 1; ei >= 0; ei--) {
      const eb = enemyBullets[ei];
      if (rectsOverlap(eb.x, eb.y, eb.w, eb.h, player.x, player.y, player.w, player.h)) {
        enemyBullets.splice(ei, 1); // Remove the enemy bullet
        handlePlayerHit(now);       // Player takes damage
      }
    }

    // --- Player vs. power-ups ---
    for (let pi = powerups.length - 1; pi >= 0; pi--) {
      const pu = powerups[pi];
      if (rectsOverlap(pu.x, pu.y, pu.w, pu.h, player.x, player.y, player.w, player.h)) {
        applyPowerup(pu.type);      // Apply the power-up effect
        powerups.splice(pi, 1);    // Remove the collected power-up
      }
    }
  }

  /**
   * handlePlayerHit — called when the player takes damage.
   * Uses an invulnerability cooldown so one event doesn't remove multiple lives.
   */
  function handlePlayerHit(now) {
    // INVULNERABILITY COOLDOWN: ignore hits during the invulnerable window
    if (now < player.invulnUntil) return;

    // If shield is active, absorb the hit instead
    if (player.shieldActive) {
      player.shieldActive = false;
      playSound('shieldBreak');
      spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#00f5ff', 12);
      player.invulnUntil = now + CONFIG.INVULN_DURATION;
      player.hitFlash    = 20;
      return;
    }

    // Lose a life
    player.lives--;
    player.hitFlash  = 30;
    player.invulnUntil = now + CONFIG.INVULN_DURATION;
    playSound('playerHit');
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff4444', 15);

    if (player.lives <= 0) {
      // No lives left — game over
      triggerGameOver();
    }
  }

  // ===========================================================================
  // SECTION 9: POWER-UPS
  //
  // WORKSHOP STEP 6: Spawn and apply power-up effects.
  // ===========================================================================

  /** spawnPowerup — creates a power-up object falling from a position. */
  function spawnPowerup(cx, cy, enemyType) {
    // Pick a random power-up type from the POWERUP_TYPES list
    const typeData = pickLootType(enemyType); // weighted by enemy rarity

    powerups.push({
      x:    cx - CONFIG.POWERUP_W / 2,
      y:    cy,
      w:    CONFIG.POWERUP_W,
      h:    CONFIG.POWERUP_H,
      type: typeData,
      vy:   CONFIG.POWERUP_SPEED,
    });
  }

  /** updatePowerups — moves power-ups downward and removes off-screen ones. */
  function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
      powerups[i].y += powerups[i].vy;
      if (powerups[i].y > CONFIG.CANVAS_H + 10) {
        powerups.splice(i, 1);
      }
    }
  }

  /** applyPowerup — applies the collected power-up to the player. */
  function applyPowerup(typeData) {
    playSound('powerup');
    showPowerupNotification(typeData.label + ' ' + typeData.name);

    // WORKSHOP STEP 6: Each power-up type has a different effect
    if (typeData.id === 'heart') {
      // Extra life — don't exceed maximum
      if (player.lives < CONFIG.PLAYER_MAX_LIVES) {
        player.lives++;
      }
    } else if (typeData.id === 'shield') {
      player.shieldActive = true;
    } else if (typeData.id === 'multishot') {
      player.multishot      = true;
      player.multishotTimer = CONFIG.POWERUP_DURATION;
    } else if (typeData.id === 'bigbullet') {
      player.bigBullet      = true;
      player.bigBulletTimer = CONFIG.POWERUP_DURATION;
    } else if (typeData.id === 'rapidshot') {
      player.rapidShot      = true;
      player.rapidShotTimer = CONFIG.POWERUP_DURATION;
    }

    updatePowerupHUD();
  }

  /** Show a temporary on-screen notification when power-up is collected. */
  function showPowerupNotification(text) {
    // We draw this directly on canvas in the render step using a shared variable
    puNotif = { text: text, timer: 120 }; // 120 frames ≈ 2 seconds
  }

  function showPowerupExpiry(name) {
    puNotif = { text: name + ' ENDED', timer: 90 };
    updatePowerupHUD();
  }

  let puNotif = null; // Shared variable for current power-up notification text

  /** Update the power-up HUD elements in the HTML overlay. */
  function updatePowerupHUD() {
    const hud = document.getElementById('powerup-hud');
    if (!hud) return;
    // PERF: only touch the DOM when the displayed text changes (timers tick once per second)
    const key = [player.shieldActive,
      player.multishot && Math.ceil(player.multishotTimer / 1000),
      player.bigBullet && Math.ceil(player.bigBulletTimer / 1000),
      player.rapidShot && Math.ceil(player.rapidShotTimer / 1000)].join('|');
    if (key === hudKey) return;
    hudKey = key;
    hud.innerHTML = '';

    if (player.shieldActive) {
      const item = document.createElement('div');
      item.className = 'powerup-hud-item';
      item.textContent = '🛡️ SHIELD';
      hud.appendChild(item);
    }
    if (player.multishot) {
      const item = document.createElement('div');
      item.className = 'powerup-hud-item';
      const secs = Math.ceil(player.multishotTimer / 1000);
      item.textContent = '🔱 MULTISHOT ' + secs + 's';
      hud.appendChild(item);
    }
    if (player.bigBullet) {
      const item = document.createElement('div');
      item.className = 'powerup-hud-item';
      const secs = Math.ceil(player.bigBulletTimer / 1000);
      item.textContent = '💥 BIG BULLET ' + secs + 's';
      hud.appendChild(item);
    }
    if (player.rapidShot) {
      const item = document.createElement('div');
      item.className = 'powerup-hud-item';
      const secs = Math.ceil(player.rapidShotTimer / 1000);
      item.textContent = '⚡ RAPID SHOT ' + secs + 's';
      hud.appendChild(item);
    }
  }

  // ===========================================================================
  // PARTICLES — visual hit/explosion effects
  // ===========================================================================

  /** spawnParticles — creates a burst of small colored squares. */
  function spawnParticles(cx, cy, color, count) {
    if (particles.length >= CONFIG.MAX_PARTICLES) return; // PERF: hard cap
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x:    cx,
        y:    cy,
        vx:   Math.cos(angle) * speed,
        vy:   Math.sin(angle) * speed,
        life: 1.0,          // 1.0 = fully visible, fades to 0
        size: 2 + Math.random() * 4,
        color: color,
      });
    }
  }

  /** updateParticles — moves particles and fades them out over time. */
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= 0.04;   // Fade speed

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // ===========================================================================
  // SECTION 10: WAVE PROGRESSION
  //
  // WORKSHOP STEP 7: Move to the next wave when the formation is empty.
  // ===========================================================================

  /**
   * checkWaveComplete — called each frame.
   * If all formation enemies are dead AND no wave transition is happening,
   * trigger the WAVE CLEARED sequence.
   */
  function checkWaveComplete() {
    // If we're already transitioning, don't re-trigger
    if (STATE !== 'playing') return;

    const aliveCount = enemies.filter(e => e.alive).length;
    if (aliveCount === 0) {
      // All enemies defeated — move to wave-cleared state
      triggerWaveCleared();
    }
  }

  /**
   * triggerWaveCleared — shows the wave-cleared overlay and counts down to the next wave.
   */
  function triggerWaveCleared() {
    STATE = 'wave-cleared';
    playSound('waveClear');

    const overlay    = document.getElementById('wave-cleared-overlay');
    const titleEl    = document.getElementById('wave-cleared-title');
    const nextEl     = document.getElementById('wave-cleared-next');
    const countEl    = document.getElementById('wave-countdown');

    if (overlay)  overlay.classList.remove('hidden');
    if (titleEl)  titleEl.textContent = 'WAVE ' + player.wave;

    if (isFinalWave()) {
      // This was the last wave
      if (nextEl)   nextEl.textContent  = 'Final wave cleared! Victory incoming...';
    } else {
      if (nextEl)   nextEl.textContent  = 'Get ready for Wave ' + (player.wave + 1) + '...';
    }

    // Countdown from 3
    waveCountdownVal = 3;
    if (countEl) countEl.textContent = waveCountdownVal;

    // Clear any existing countdown timer
    if (waveCountdownTimer) clearInterval(waveCountdownTimer);

    waveCountdownTimer = setInterval(function () {
      waveCountdownVal--;

      if (countEl) countEl.textContent = waveCountdownVal > 0 ? waveCountdownVal : '▶';

      if (waveCountdownVal <= 0) {
        clearInterval(waveCountdownTimer);
        waveCountdownTimer = null;

        if (overlay) overlay.classList.add('hidden');

        if (isFinalWave()) {
          triggerVictory(); // Last wave done — victory!
        } else {
          // Advance to next wave
          player.wave++;
          if (GAME_MODE === 'infinity') saveInfinityRecords(); // save progress once per wave (not per frame)
          sideEnemies  = [];
          bullets      = [];
          enemyBullets = [];
          powerups     = [];
          lastSideSpawn  = 0;
          lastEnemyShot  = 0;
          formationDir   = 1;
          spawnFormation(player.wave - 1);
          STATE = 'playing';
        }
      }
    }, 1000);
  }

  // ===========================================================================
  // SECTION 14a: VICTORY
  // ===========================================================================

  function triggerVictory() {
    STATE = 'victory';
    playSound('victory');
    saveHighScore();

    document.getElementById('victory-score').textContent  = player.score;
    document.getElementById('victory-hiscore').textContent = highScore;
    document.getElementById('victory-overlay').classList.remove('hidden');
  }

  // ===========================================================================
  // SECTION 14b: GAME OVER
  // ===========================================================================

  function triggerGameOver() {
    if (GAME_MODE === 'infinity') { triggerInfinityOver(); return; }
    STATE = 'game-over';
    playSound('gameOver');
    saveHighScore();

    document.getElementById('gameover-score').textContent  = player.score;
    document.getElementById('gameover-wave').textContent   = player.wave;
    document.getElementById('gameover-hiscore').textContent = highScore;
    document.getElementById('gameover-overlay').classList.remove('hidden');
  }

  // ===========================================================================
  // SECTION 11: MAIN UPDATE LOOP
  //
  // WORKSHOP STEP 4: Every frame, update all game objects.
  // This function runs 60 times per second (via requestAnimationFrame).
  // It calls each sub-system's update function in order.
  // ===========================================================================

  function update(now) {
    if (STATE !== 'playing') return; // Freeze simulation when not playing

    runMs += STEP;   // survival clock (update() is skipped while paused)
    updatePlayer(now);
    updateBullets();
    updateEnemies(now);
    updateSideEnemies(now);
    updateEnemyBullets();
    updatePowerups();
    updateParticles();
    checkCollisions(now);
    checkWaveComplete();

    // Count down power-up notification display
    if (puNotif && puNotif.timer > 0) {
      puNotif.timer--;
    }
  }

  // ===========================================================================
  // SECTION 12: RENDERING
  //
  // WORKSHOP STEP 4e: Draw the current game frame on the canvas.
  // We clear the canvas, draw the background, then draw every game object
  // (enemies, bullets, player, HUD). Order matters — things drawn later appear on top.
  // ===========================================================================

  function render() {
    // Clear the entire canvas (fill with dark color)
    ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    // Draw background image or fallback gradient
    if (imgs.background) {
      ctx.drawImage(getBgCache(), 0, 0); // PERF: background is pre-scaled once, not every frame
    } else {
      // Fallback: a deep violet gradient
      const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_H);
      grad.addColorStop(0, '#0d0020');
      grad.addColorStop(1, '#1a0035');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
    }

    // Draw a slight dark overlay to ensure sprites are always visible
    ctx.fillStyle = 'rgba(0, 0, 10, 0.35)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    // Always draw HUD (score, lives, wave)
    drawHUD();

    // Only draw gameplay elements when game is running, paused, or wave-cleared
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

  // ---- HUD (Heads-Up Display) -----------------------------------------------

  function drawHUD() {
    // Score (top center)
    ctx.save();
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE: ' + String(player.score).padStart(6, '0'), CONFIG.CANVAS_W / 2, 24);

    // Wave number (top left)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b44fff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(waveLabel(), 12, 24);

    // Lives (top right — drawn as heart icons or life count)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff2eff';
    let livesText = '♥ ×' + player.lives;
    ctx.fillText(livesText, CONFIG.CANVAS_W - 12, 24);

    // Hi-Score (top center below score)
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(180,80,255,0.7)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(hiLabel(), CONFIG.CANVAS_W / 2, 40);
    ctx.restore();
  }

  // ---- Draw Player ----------------------------------------------------------

  function drawPlayer() {
    ctx.save();

    // During invulnerability, flicker the player (skip drawing on odd hitFlash frames)
    const isInvuln = (Date.now() < player.invulnUntil);
    if (isInvuln && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.restore();
      return; // Skip drawing to create a flicker effect
    }

    // Shield glow ring — drawn behind the ship
    if (player.shieldActive) {
      ctx.beginPath();
      ctx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        player.w * 0.75,
        0, Math.PI * 2
      );
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth   = 3;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur  = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw the spaceship sprite
    if (imgs.spaceship) {
      // The spaceship has a white background — we draw it normally.
      // The dark canvas background and the sprite colors (magenta+blue) 
      // make it visually clear. We add a slight glow for game feel.
      ctx.shadowColor = '#ff2eff';
      ctx.shadowBlur  = player.hitFlash > 0 ? 30 : 10;
      ctx.drawImage(imgs.spaceship, player.x, player.y, player.w, player.h);
      ctx.shadowBlur = 0;
    } else {
      // Fallback: draw a triangle as the ship
      ctx.fillStyle = '#ff2eff';
      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.closePath();
      ctx.fill();
    }

    // Hit flash tint overlay
    if (player.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
      ctx.fillRect(player.x, player.y, player.w, player.h);
    }

    ctx.restore();
  }

  // ---- Draw Enemies ---------------------------------------------------------

  function drawEnemies() {
    for (const e of enemies) {
      if (!e.alive) continue;

      ctx.save();

      // Map enemy type index to the corresponding loaded image
      const imgKey = 'enemy' + (e.type + 1); // type 0 → 'enemy1', etc.
      const img    = imgs[imgKey];

      if (img) {
        // Slight bob animation — shifts the y position by 2px on alternate frames
        const bob = e.animFrame === 1 ? 2 : 0;
        ctx.shadowColor = ['#7ec8ff', '#ff7e7e', '#7eff9e', '#ff7eff'][e.type];
        ctx.shadowBlur  = 0; // PERF: no per-enemy glow (40+ blurred sprites per frame was costly)
        ctx.drawImage(img, e.x, e.y + bob, e.w, e.h);
        ctx.shadowBlur  = 0;
      } else {
        // Fallback: colored rectangles
        ctx.fillStyle = ['#7ec8ff', '#ff7e7e', '#7eff9e', '#ff7eff'][e.type];
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }

      ctx.restore();
    }
  }

  // ---- Draw Side Enemies ----------------------------------------------------

  function drawSideEnemies() {
    for (const se of sideEnemies) {
      if (!se.alive) continue;
      ctx.save();

      const imgKey = 'sidenemy' + (se.type + 1);
      const img    = imgs[imgKey];

      if (img) {
        ctx.shadowColor = ['#7ec8ff', '#ff7e7e', '#7eff9e', '#ff7eff'][se.type];
        ctx.shadowBlur  = 10;
        ctx.drawImage(img, se.x, se.y, se.w, se.h);
        ctx.shadowBlur  = 0;
      } else {
        ctx.fillStyle = ['#00aaff', '#ff4444', '#44ff88', '#ff44ff'][se.type];
        ctx.fillRect(se.x, se.y, se.w, se.h);
      }

      ctx.restore();
    }
  }

  // ---- Draw Player Bullets --------------------------------------------------

  function drawBullets() {
    for (const b of bullets) {
      ctx.save();

      if (imgs.bullet) {
        // Bullet has a white background — add a magenta glow so it pops
        ctx.shadowColor = '#b44fff';
        ctx.shadowBlur  = bullets.length > 12 ? 0 : (b.big ? 20 : 12); // PERF: glow only when few bullets
        ctx.drawImage(imgs.bullet, b.x, b.y, b.w, b.h);
        ctx.shadowBlur  = 0;
      } else {
        // Fallback: a glowing rectangle
        ctx.fillStyle   = b.big ? '#ffaa00' : '#b44fff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur  = 12;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur  = 0;
      }

      ctx.restore();
    }
  }

  // ---- Draw Enemy Bullets ---------------------------------------------------

  function drawEnemyBullets() {
    for (const eb of enemyBullets) {
      ctx.save();
      ctx.fillStyle   = '#ff4444';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur  = enemyBullets.length > 12 ? 0 : 10;
      ctx.fillRect(eb.x, eb.y, eb.w, eb.h);
      ctx.shadowBlur  = 0;
      ctx.restore();
    }
  }

  // ---- Draw Power-ups -------------------------------------------------------

  function drawPowerups() {
    for (const pu of powerups) {
      ctx.save();

      // Draw a glowing circle background for the power-up
      ctx.beginPath();
      ctx.arc(
        pu.x + pu.w / 2,
        pu.y + pu.h / 2,
        pu.w * 0.65,
        0, Math.PI * 2
      );
      ctx.fillStyle   = pu.type.color + '33'; // 20% opacity fill
      ctx.strokeStyle = pu.type.color;
      ctx.lineWidth   = 2;
      ctx.shadowColor = pu.type.color;
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Use the real image if loaded, otherwise fall back to emoji
      const puImg = imgs[pu.type.id];
      if (puImg) {
        // Draw the power-up sprite centered in the glow circle
        ctx.shadowColor = pu.type.color;
        ctx.shadowBlur  = 8;
        ctx.drawImage(puImg, pu.x, pu.y, pu.w, pu.h);
        ctx.shadowBlur  = 0;
      } else {
        // Emoji fallback
        ctx.font         = '18px serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = '#ffffff';
        ctx.fillText(pu.type.label, pu.x + pu.w / 2, pu.y + pu.h / 2);
      }

      ctx.restore();
    }
  }

  // ---- Draw Particles -------------------------------------------------------

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 0; // PERF: particles are tiny - glow not worth it
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // ---- Draw power-up notification text on canvas ----------------------------

  function drawPowerupNotification() {
    if (!puNotif || puNotif.timer <= 0) return;
    const alpha = Math.min(1, puNotif.timer / 40); // Fade in at start, out at end
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font        = '12px "Press Start 2P", monospace';
    ctx.fillStyle   = '#00f5ff';
    ctx.textAlign   = 'center';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur  = 16;
    ctx.fillText(puNotif.text, CONFIG.CANVAS_W / 2, CONFIG.CANVAS_H / 2 - 40);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ===========================================================================
  // SECTION 13: AUDIO
  //
  // WORKSHOP STEP 7a: Music and sound effects.
  // We use the HTML <audio> API for background music (mp3 file).
  // We use the Web Audio API to generate simple synthesized sound effects
  // so we don't need extra audio files.
  // ===========================================================================

  // --- Music ---
  const bgMusic     = new Audio(ASSETS.music);
  bgMusic.loop      = true;
  bgMusic.volume    = 0.5;
  let musicPlaying  = false;

  function startMusic() {
    if (musicPlaying) return;
    const promise = bgMusic.play();
    if (promise !== undefined) {
      promise.then(function () {
        musicPlaying = true;
        updateMusicUI(true);
      }).catch(function (err) {
        // Browser blocked autoplay — that's OK, the player can click the button
        console.info('Music autoplay blocked. Click the music button to play.');
        musicPlaying = false;
        updateMusicUI(false);
      });
    }
  }

  function toggleMusic() {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
      updateMusicUI(false);
    } else {
      startMusic();
    }
  }

  /** updateMusicUI — syncs the navbar and in-game music button states. */
  function updateMusicUI(isPlaying) {
    const musicIcon     = document.getElementById('music-icon');
    const musicLabel    = document.getElementById('music-label');
    const trackLabel    = document.getElementById('music-track-label');
    const ingameBtn     = document.getElementById('ingame-music-btn');
    const ingameIcon    = document.getElementById('ingame-music-icon');
    const navBtn        = document.getElementById('music-toggle-btn');

    if (musicIcon)  musicIcon.textContent  = isPlaying ? '🔊' : '🎵';
    if (musicLabel) musicLabel.textContent = isPlaying ? 'MUSIC ON'  : 'MUSIC OFF';
    if (trackLabel) trackLabel.classList.toggle('visible', isPlaying);
    if (ingameIcon) ingameIcon.textContent = isPlaying ? '🔊' : '🔇';
    if (navBtn)     navBtn.setAttribute('aria-pressed', String(isPlaying));
    if (ingameBtn)  ingameBtn.setAttribute('aria-pressed', String(isPlaying));
  }

  // --- Sound Effects (Web Audio API) ---
  // We create an AudioContext (a sound engine) the first time a sound is needed.
  // AudioContext must be created AFTER a user gesture (click/tap) to comply with
  // browser autoplay policy.
  let audioCtx = null;
  const sfxLast = {}; // last play time per effect (for the throttle above)

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  /**
   * playSound — plays a simple synthesized sound effect.
   * We use oscillators (tone generators) instead of audio files.
   * @param {string} type — 'shoot' | 'enemyDie' | 'playerHit' | 'powerup' |
   *                        'enemyShoot' | 'waveClear' | 'victory' | 'gameOver' | 'shieldBreak'
   */
  function playSound(type) {
    // PERF: max one instance of each effect every 70ms (spamming Space used to stack dozens of oscillators)
    const tNow = performance.now();
    if (sfxLast[type] && tNow - sfxLast[type] < 70) return;
    sfxLast[type] = tNow;
    try {
      const ac = getAudioCtx();
      const osc   = ac.createOscillator();
      const gain  = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      const now = ac.currentTime;

      // Each sound has a different frequency and envelope shape
      if (type === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);

      } else if (type === 'enemyShoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);

      } else if (type === 'enemyDie') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);

      } else if (type === 'playerHit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);

      } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(550, now + 0.08);
        osc.frequency.setValueAtTime(660, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);

      } else if (type === 'shieldBreak') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);

      } else if (type === 'waveClear') {
        // Ascending arpeggio
        const freqs = [262, 330, 392, 523];
        freqs.forEach(function (f, i) {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = 'square';
          const t = now + i * 0.1;
          o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.start(t);
          o.stop(t + 0.14);
        });
        return; // early return — we handled it above

      } else if (type === 'victory') {
        // Ascending fanfare
        const freqs = [262, 330, 392, 523, 659, 784];
        freqs.forEach(function (f, i) {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = 'square';
          const t = now + i * 0.12;
          o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.2, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.start(t);
          o.stop(t + 0.2);
        });
        return;

      } else if (type === 'gameOver') {
        // Descending sad tone
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.start(now);
        osc.stop(now + 0.85);
      }

    } catch (e) {
      // Web Audio might not be available — fail silently
    }
  }

  // ===========================================================================
  // MAIN GAME LOOP
  //
  // WORKSHOP STEP 4f: requestAnimationFrame is like asking the browser
  // "please call my function before the next screen refresh (usually 60× per second)."
  // Each call to gameLoop: 1) updates all positions/logic, 2) draws everything.
  // We pass a "timestamp" (current time in ms) so we can measure time between frames.
  // ===========================================================================

  function gameLoop(timestamp) {
    // Fixed-timestep: the simulation always advances in 1/60s steps, so speed is
    // identical on 60Hz and 144Hz monitors. Max 3 catch-up steps avoids a "spiral of death".
    if (!lastFrameTime) lastFrameTime = timestamp;
    accumulator += Math.min(100, timestamp - lastFrameTime);
    lastFrameTime = timestamp;
    let steps = 0;
    while (accumulator >= STEP && steps < 3) { update(timestamp); accumulator -= STEP; steps++; }
    if (accumulator > STEP) accumulator = 0;
    render();           // Draw the scene

    // Schedule the next frame — this creates a continuous loop
    animFrameId = requestAnimationFrame(gameLoop);
  }

  /** startGameLoop — starts the loop, making sure we don't create duplicates. */
  function startGameLoop() {
    lastFrameTime = 0; accumulator = 0; // reset timing so a restart doesn't 'catch up'
    // Cancel any existing loop before starting a new one
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ===========================================================================
  // SECTION 14: PAUSE, VICTORY, GAME-OVER & RESTARTING
  // ===========================================================================

  function pauseGame() {
    if (STATE !== 'playing') return;
    STATE = 'paused';
    document.getElementById('pause-overlay').classList.remove('hidden');
  }

  function resumeGame() {
    if (STATE !== 'paused') return;
    document.getElementById('pause-overlay').classList.add('hidden');
    STATE = 'playing';
  }

  /**
   * startGame — called when the player clicks START GAME or presses Enter on the menu.
   * Transitions from menu to playing.
   */
  function startGame(mode) {
    // Classic unless Infinity Room asked for it (click handlers pass an Event, which is ignored)
    GAME_MODE = (mode === 'infinity') ? 'infinity' : 'classic';
    // Hide all overlays
    hideAllOverlays();

    // Show game screen
    document.getElementById('landing-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    // Initialize fresh game state
    initGame();
    STATE = 'playing';

    // Resize canvas to current window
    resizeCanvas();

    // Show mobile controls if applicable
    checkMobileControls();

    // Start game loop
    startGameLoop();

    // Try to start music (requires user gesture — this button click qualifies)
    startMusic();
  }

  /**
   * restartGame — called from game-over, victory, pause screens.
   * Full reset without returning to the menu.
   */
  function restartGame() {
    // Clear any running wave countdown
    if (waveCountdownTimer) {
      clearInterval(waveCountdownTimer);
      waveCountdownTimer = null;
    }

    hideAllOverlays();
    initGame();
    STATE = 'playing';
    startGameLoop();
  }

  function goToMenu() {
    // Clear countdown
    if (waveCountdownTimer) {
      clearInterval(waveCountdownTimer);
      waveCountdownTimer = null;
    }

    // Stop the game loop
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    hideAllOverlays();
    STATE = 'menu';

    // Switch screens
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('landing-screen').classList.add('active');

    // Update high score in hero section
    updateHeroHiScore();
  }

  function hideAllOverlays() {
    ['pause-overlay', 'wave-cleared-overlay', 'victory-overlay', 'gameover-overlay', 'infinity-over-overlay', 'infinity-panel'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  // ===========================================================================
  // SECTION 15: SCREEN TRANSITIONS & NAVIGATION WIRING
  // ===========================================================================

  /** transitionToLanding — fades out the loading screen and shows the landing page. */
  let hasTransitioned = false; // guard against double-calls
  function transitionToLanding() {
    if (hasTransitioned) return;
    hasTransitioned = true;

    stopMatrix(); // Stop the matrix animation to save CPU

    const loadingScreen = document.getElementById('loading-screen');
    const landingScreen = document.getElementById('landing-screen');

    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.8s ease';
      loadingScreen.style.opacity    = '0';

      setTimeout(function () {
        loadingScreen.classList.remove('active');
        if (landingScreen) {
          landingScreen.classList.add('active');
          STATE = 'menu';
          updateHeroHiScore();
        }
      }, 850);
    } else if (landingScreen) {
      landingScreen.classList.add('active');
      STATE = 'menu';
      updateHeroHiScore();
    }
  }

  /** Update the hero section high score badge from stored value. */
  function updateHeroHiScore() {
    const el = document.getElementById('hero-hiscore-value');
    if (el) el.textContent = String(highScore).padStart(6, '0');
  }

  /** saveHighScore — compare current score with stored high score and save if higher. */
  function saveHighScore() {
    if (player.score > highScore) {
      highScore = player.score;
      try {
        localStorage.setItem('tp_hiscore', highScore);
      } catch (e) {
        // Storage unavailable — fail silently
      }
    }
  }

  /** toggleFullscreen — use the browser Fullscreen API if available. */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }

  // ===========================================================================
  // BUTTON EVENT LISTENERS
  // Wire up every button and link to its function.
  // ===========================================================================

  // Landing page — Start Game button
  const startBtn = document.getElementById('start-game-btn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  // Footer play button
  const footerBtn = document.getElementById('footer-play-btn');
  if (footerBtn) footerBtn.addEventListener('click', startGame);

  // Music toggle (navbar)
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);

  // Music toggle (in-game)
  const ingameMusicBtn = document.getElementById('ingame-music-btn');
  if (ingameMusicBtn) ingameMusicBtn.addEventListener('click', toggleMusic);

  // Back to menu (game screen)
  const btnBackMenu = document.getElementById('btn-back-menu');
  if (btnBackMenu) btnBackMenu.addEventListener('click', goToMenu);

  // Pause overlay buttons
  const resumeBtn       = document.getElementById('resume-btn');
  const pauseRestartBtn = document.getElementById('pause-restart-btn');
  const pauseMenuBtn    = document.getElementById('pause-menu-btn');
  if (resumeBtn)       resumeBtn.addEventListener('click', resumeGame);
  if (pauseRestartBtn) pauseRestartBtn.addEventListener('click', restartGame);
  if (pauseMenuBtn)    pauseMenuBtn.addEventListener('click', goToMenu);

  // Victory overlay buttons
  const victoryReplayBtn = document.getElementById('victory-replay-btn');
  const victoryMenuBtn   = document.getElementById('victory-menu-btn');
  if (victoryReplayBtn) victoryReplayBtn.addEventListener('click', restartGame);
  if (victoryMenuBtn)   victoryMenuBtn.addEventListener('click', goToMenu);

  // Game over overlay buttons
  const gameoverReplayBtn = document.getElementById('gameover-replay-btn');
  const gameoverMenuBtn   = document.getElementById('gameover-menu-btn');
  if (gameoverReplayBtn) gameoverReplayBtn.addEventListener('click', restartGame);
  if (gameoverMenuBtn)   gameoverMenuBtn.addEventListener('click', goToMenu);

  // Hamburger menu (mobile nav)
  const hamburger   = document.getElementById('nav-hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
  }

  // Close mobile menu when a link is clicked
  document.querySelectorAll('[data-close-menu]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (hamburger)  hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scroll — prevent nav links from jumping (they use href="#section")
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===========================================================================
  // INITIAL RENDER ON CANVAS (shows background even on loading screen)
  // ===========================================================================

  // Set canvas size immediately
  canvas.width  = CONFIG.CANVAS_W;
  canvas.height = CONFIG.CANVAS_H;

  // Draw a simple startup frame so canvas isn't blank
  (function drawInitialFrame() {
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_H);
    grad.addColorStop(0, '#0d0020');
    grad.addColorStop(1, '#1a0035');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
  })();
  // ===========================================================================
  // UPGRADE: PERFORMANCE HELPERS, LOOT ROLLS & INFINITY ROOM
  // ===========================================================================

  // --- PERF: pre-scaled background -------------------------------------------
  // Scaling a big PNG every frame is wasteful. We draw it ONCE onto an offscreen canvas.
  let bgCache = null;
  function getBgCache() {
    if (!bgCache) {
      bgCache = document.createElement('canvas');
      bgCache.width  = CONFIG.CANVAS_W;
      bgCache.height = CONFIG.CANVAS_H;
      bgCache.getContext('2d').drawImage(imgs.background, 0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
    }
    return bgCache;
  }

  // --- LOOT: two separate rolls ------------------------------------------------
  // Roll 1 (tryDropLoot): does this kill drop anything at all? (3% / 5% / 9% / 15%)
  // Roll 2 (pickLootType): WHICH power-up, using that enemy's LOOT_TABLES row.
  function pickLootType(enemyType) {
    const table = LOOT_TABLES[enemyType] || LOOT_TABLES[0];
    let roll = Math.random() * 100;
    for (const t of POWERUP_TYPES) {
      roll -= (table[t.id] || 0);
      if (roll < 0) return t;
    }
    return POWERUP_TYPES[0]; // safety net
  }

  function tryDropLoot(cx, cy, enemyType) {
    if (powerups.length >= CONFIG.POWERUP_MAX_ACTIVE) return;               // screen already has 3
    if (Math.random() >= CONFIG.POWERUP_DROP_CHANCE[enemyType]) return;     // no luck
    spawnPowerup(cx, cy, enemyType);
  }

  // --- ENDLESS WAVES -------------------------------------------------------------
  // Waves 1-5 use WAVE_DATA. Beyond that (Infinity Room) we extend the last row a little
  // each wave, always clamped by the INF_* caps in CONFIG so it never becomes impossible.
  function getWaveData(idx) {
    if (idx < WAVE_DATA.length) return WAVE_DATA[idx];
    const last  = WAVE_DATA[WAVE_DATA.length - 1];
    const extra = idx - (WAVE_DATA.length - 1);
    return {
      speedMult: Math.min(CONFIG.INF_MAX_SPEED_MULT, last.speedMult + extra * 0.25),
      shootMult: Math.max(CONFIG.INF_MIN_SHOOT_MULT, last.shootMult - extra * 0.03),
      sideMax:   Math.min(CONFIG.INF_MAX_SIDE, last.sideMax + Math.floor(extra / 2)),
      rows:      Math.min(5, last.rows + (extra >= 3 ? 1 : 0)),
      cols:      last.cols,
    };
  }

  // Classic ends at wave 5. Infinity Room has NO final wave.
  function isFinalWave() { return GAME_MODE === 'classic' && player.wave >= CONFIG.TOTAL_WAVES; }
  function waveLabel()   { return GAME_MODE === 'infinity' ? 'WAVE ' + player.wave + ' \u221E' : 'WAVE ' + player.wave + '/' + CONFIG.TOTAL_WAVES; }
  function hiLabel() {
    return GAME_MODE === 'infinity'
      ? '\u221E ' + fmtTime(runMs) + '  BEST W' + infRec.wave
      : 'HI: ' + String(highScore).padStart(6, '0');
  }

  // --- INFINITY ROOM RECORDS (localStorage, separate keys from Classic) ---------
  const INF_KEYS = { wave: 'tp_inf_wave', score: 'tp_inf_score', time: 'tp_inf_time' };
  let storageOK = true;
  try {
    infRec.wave  = parseInt(localStorage.getItem(INF_KEYS.wave)  || '0', 10) || 0;
    infRec.score = parseInt(localStorage.getItem(INF_KEYS.score) || '0', 10) || 0;
    infRec.time  = parseInt(localStorage.getItem(INF_KEYS.time)  || '0', 10) || 0;
  } catch (e) { storageOK = false; }

  function fmtTime(ms) {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  // Called once per wave and once at game over - only writes when a record actually improved.
  function saveInfinityRecords() {
    let changed = false;
    if (player.wave  > infRec.wave)  { infRec.wave  = player.wave;      changed = true; }
    if (player.score > infRec.score) { infRec.score = player.score;     changed = true; }
    if (runMs        > infRec.time)  { infRec.time  = Math.floor(runMs); changed = true; }
    if (!changed) return;
    try {
      localStorage.setItem(INF_KEYS.wave,  infRec.wave);
      localStorage.setItem(INF_KEYS.score, infRec.score);
      localStorage.setItem(INF_KEYS.time,  infRec.time);
    } catch (e) { storageOK = false; }
  }

  function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }

  function updateInfinityPanel() {
    setText('inf-best-wave',  infRec.wave);
    setText('inf-best-score', infRec.score);
    setText('inf-best-time',  fmtTime(infRec.time));
    setText('inf-note', storageOK
      ? 'PERSONAL RECORDS \u00B7 SAVED ON THIS BROWSER ONLY'
      : 'STORAGE BLOCKED \u00B7 RECORDS WILL NOT PERSIST');
  }

  function infPanelOpen() {
    const p = document.getElementById('infinity-panel');
    return !!p && !p.classList.contains('hidden');
  }

  function triggerInfinityOver() {
    if (STATE === 'game-over') return;
    STATE = 'game-over';
    playSound('gameOver');
    saveInfinityRecords(); // update records BEFORE showing the results
    const newRec = player.score > infStart.score || player.wave > infStart.wave || runMs > infStart.time;
    setText('inf-over-score',     player.score);
    setText('inf-over-wave',      player.wave);
    setText('inf-over-time',      fmtTime(runMs));
    setText('inf-over-bestwave',  infRec.wave);
    setText('inf-over-bestscore', infRec.score);
    const nr = document.getElementById('inf-newrec');
    if (nr) nr.hidden = !newRec;
    document.getElementById('infinity-over-overlay').classList.remove('hidden');
  }

  // --- Wiring (each listener is registered exactly once) ------------------------
  function bind(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
  bind('infinity-open-btn',  function () { updateInfinityPanel(); document.getElementById('infinity-panel').classList.remove('hidden'); });
  bind('inf-back-btn',       function () { document.getElementById('infinity-panel').classList.add('hidden'); });
  bind('start-infinity-btn', function () { document.getElementById('infinity-panel').classList.add('hidden'); startGame('infinity'); });
  bind('infinity-replay-btn', restartGame);
  bind('infinity-menu-btn',   goToMenu);

  // Auto-pause when the tab is hidden, and reset timing so there's no big time jump on return
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && STATE === 'playing') pauseGame();
    lastFrameTime = 0; accumulator = 0;
  });


  // ===========================================================================
  // END OF GAME — everything is wired up!
  // The game waits here until transitionToLanding() is called from
  // updateLoadingProgress() when all assets have loaded.
  // ===========================================================================

}); // End of DOMContentLoaded
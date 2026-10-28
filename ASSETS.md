# TECHNOPIXEL SPACE INVADERS — Asset Inventory

> All files used by the game, their roles, display notes, and fallback behavior.

---

## Present in `techassets/`

| File | Key in `ASSETS.images` | Role | Display Notes |
|------|----------------------|------|---------------|
| `Background.png` | `background` | Full-canvas game backdrop. Retrowave purple space scene with neon grid floor, planets, and stars. | Drawn via `ctx.drawImage` to fill 800×600 canvas. A 35% dark overlay is applied on top so sprites remain readable. Also used as the hero section background via CSS `background-image`. |
| `newLogo.png` | `emblem` | TechNoPixel magenta pixel emblem. Square image (480×480) with its own dark synthwave background. | Used in: loading screen (120×120, `object-fit: contain`), navbar (32×32), about section (90×90). **Not stretched** — displayed with contain sizing so the emblem is shown without cropping. |
| `TEXT.png` | `textLogo` | TECHNOPIXEL wordmark. Square image (≈1024×1024) with deep purple background and glowing star field. | Used in: loading screen (80px height, contain), hero section (72px height, contain). Displayed as a fixed-height `<img>` so the wordmark isn't distorted. |
| `Logo.png` | *(not used in game.js)* | Full TechNoPixel logo composition. | Available in `techassets/` but not referenced in current code to avoid stacking duplicate logos. Can be used for a splash card or printed materials. |
| `technospaceship.png` | `spaceship` | Player spaceship sprite. Pixel-art fighter (≈500×500) with white background, blue/gray body, magenta TechNoPixel emblem, magenta engine flames. | Drawn at 56×56px on canvas. White background is visible but unobtrusive against the dark canvas. A magenta `ctx.shadowBlur` glow is applied for visual separation. Increases to 30px glow when the player is hit. |
| `bullet.png` | `bullet` | Player projectile. Purple/lavender pixel bullet (≈500×500) with white background, upward-facing. | Drawn at 14×22px (normal) or 24×30px (big bullet power-up). Violet glow (`ctx.shadowBlur = 12`) applied. |
| `enemy1.png` | `enemy1` | Blue formation invader. Festive pixel spider with Santa hat and holiday lights, blue coloring. 10 points. | Drawn at 48×48px per enemy. Cyan-blue glow (`#7ec8ff`). Slight 2px vertical bob animation (alternates every 30 frames). |
| `enemy2.png` | `enemy2` | Red formation invader. 20 points. | Drawn at 48×48px. Red glow (`#ff7e7e`). |
| `enemy3.png` | `enemy3` | Green formation invader. 50 points. | Drawn at 48×48px. Green glow (`#7eff9e`). |
| `enemy4.png` | `enemy4` | Pink formation invader. 100 points. | Drawn at 48×48px. Pink glow (`#ff7eff`). |
| `sidenemy1.png` | `sidenemy1` | Blue side-sweeping invader. 10 points. | Drawn at 44×44px. Swoops across screen horizontally. |
| `sidenemy2.png` | `sidenemy2` | Red side-sweeping invader. 20 points. | Drawn at 44×44px. |
| `sidenemy3.png` | `sidenemy3` | Green side-sweeping invader. 50 points. | Drawn at 44×44px. |
| `sidenemy4.png` | `sidenemy4` | Pink side-sweeping invader. 100 points. | Drawn at 44×44px. |
| `music.mp3` | *(HTML Audio)* | Background soundtrack. Looping background music for the game. | Played via `new Audio('techassets/music.mp3')`. Controlled by MUSIC button in navbar and in-game. Volume set to 0.5. Requires a user gesture to start (browser autoplay policy). |

---

## Missing from `techassets/` — Fallback Assets Used

**All five power-up images are now confirmed present in `techassets/`.** The table below documents the actual filenames (one differs from the expected name):

| Expected Key | Actual File | Role | Notes |
|-------------|-------------|------|-------|
| `heart` | `heart.png` | Extra Life power-up sprite | ✅ Loaded and used |
| `shield` | `shield.png` | Shield power-up sprite | ✅ Loaded and used |
| `multishot` | `multishot.png` | Multishot power-up sprite | ✅ Loaded and used |
| `bigbullet` | `bigbulletmoto.png` | Big Bullet power-up sprite | ✅ Loaded — note: actual filename is `bigbulletmoto.png` not `bigbullet.png` |
| `rapidshot` | `rapidshot.png` | Rapid Shot power-up sprite | ✅ Loaded and used |

The `ASSETS.images` key `bigbullet` is mapped to `techassets/bigbulletmoto.png` in `game.js`.

---

## External Assets (CDN)

| Resource | Source | Used In | Notes |
|----------|--------|---------|-------|
| Press Start 2P font | Google Fonts CDN | `index.html` `<link>` | Pixel-art display font for HUD and headings. Falls back to `monospace` if offline. |
| Orbitron font | Google Fonts CDN | `index.html` `<link>` | UI labels and secondary text. Falls back to `Courier New`. |

> **Offline use:** If running the game without internet access, Google Fonts will not load. The fallback fonts (`monospace`, `Courier New`) are used automatically — the game remains fully functional, just with different typography.

---

## Asset Loading Notes

- All image loading happens in `game.js` `SECTION 2: ASSET LOADING`.
- The `loadImage(key, url)` function handles `onload` (success) and `onerror` (missing file) gracefully.
- A failed image sets `imgs[key] = null`. The rendering functions check `if (imgs.key)` before drawing and use colored shape or emoji fallbacks otherwise.
- The progress bar reflects only images listed in `ASSETS.images` where `url !== null`.
- A safety timeout ensures the game proceeds even if an asset hangs indefinitely.

---

*TECHNOPIXEL SPACE INVADERS · Asset Inventory · Created by Dave Punzalan · TechNoPixel · 2026*

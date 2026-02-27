// ============================================================
// PAC OMNICOM - A satirical Pac-Man parody
// ============================================================

// --- PIXEL PAC-MAN RENDERER ---
// Draw pac-man on a tiny canvas, then scale up with no smoothing for 8-bit look
const _pacCanvas = document.createElement('canvas');
_pacCanvas.width = 28;
_pacCanvas.height = 28;
const _pacCtx = _pacCanvas.getContext('2d');

function drawPixelPacman(ctx, x, y, radius, mouthAngle) {
    const s = 28;
    const half = s / 2;

    _pacCtx.clearRect(0, 0, s, s);

    // Fill body
    _pacCtx.fillStyle = '#222';
    _pacCtx.beginPath();
    _pacCtx.arc(half, half, half - 1, mouthAngle, Math.PI * 2 - mouthAngle);
    _pacCtx.lineTo(half, half);
    _pacCtx.closePath();
    _pacCtx.fill();

    // Crisp white outline
    _pacCtx.strokeStyle = '#fff';
    _pacCtx.lineWidth = 2;
    _pacCtx.beginPath();
    _pacCtx.arc(half, half, half - 1, mouthAngle, Math.PI * 2 - mouthAngle);
    _pacCtx.lineTo(half, half);
    _pacCtx.closePath();
    _pacCtx.stroke();

    // Blit pixelated to main canvas
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(_pacCanvas, x - radius, y - radius, radius * 2, radius * 2);
    ctx.imageSmoothingEnabled = prev;
}

// --- CONSTANTS ---
const TILE = 16;
const COLS = 28;
const ROWS = 31;
const CANVAS_W = COLS * TILE;
const CANVAS_H = ROWS * TILE;

// Speeds (tiles per second)
const PLAYER_SPEED = 5.5;
const GHOST_SPEED = 4.8;
const GHOST_FRIGHT_SPEED = 2.8;
const GHOST_TUNNEL_SPEED = 2.5;

// Game states
const STATE_INTRO = 0;
const STATE_READY = 1;
const STATE_PLAYING = 2;
const STATE_DYING = 3;
const STATE_GHOST_EAT = 4;
const STATE_WIN = 5;
const STATE_GAMEOVER = 6;

// Directions
const DIR_NONE = -1;
const DIR_UP = 0;
const DIR_RIGHT = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 3;

const DIR_VEC = [
    { x: 0, y: -1 }, // UP
    { x: 1, y: 0 },  // RIGHT
    { x: 0, y: 1 },  // DOWN
    { x: -1, y: 0 }  // LEFT
];

// Ghost types
const BLINKY = 0;
const PINKY = 1;
const INKY = 2;
const CLYDE = 3;

const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];
const GHOST_NAMES = ['BLINKY', 'PINKY', 'INKY', 'CLYDE'];

// Scatter targets (corners)
const SCATTER_TARGETS = [
    { x: 25, y: -3 },  // Blinky: top-right
    { x: 2, y: -3 },   // Pinky: top-left
    { x: 27, y: 34 },  // Inky: bottom-right
    { x: 0, y: 34 }    // Clyde: bottom-left
];

// Maze layout
// 0=wall, 1=dot, 2=power pellet, 3=empty, 4=ghost house, 5=ghost gate
const MAZE_DATA = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,2,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,0,0,5,5,0,0,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,4,4,4,4,4,4,0,3,0,0,1,0,0,0,0,0,0],
    [3,3,3,3,3,3,1,3,3,3,0,4,4,4,4,4,4,0,3,3,3,1,3,3,3,3,3,3],
    [0,0,0,0,0,0,1,0,0,3,0,4,4,4,4,4,4,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,2,1,1,0,0,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,0,0,1,1,2,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Agency names for power pellets (drawn as text logos)
const AGENCY_LOGOS = ['DDB', 'FCB', 'M·LOWE', 'C·EWALD'];

// Power pellet positions (will be set from maze)
let powerPelletPositions = [];

// --- AUDIO ENGINE ---
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }

    playTone(freq, duration, type = 'square', volume = 0.15) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    waka(alt = false) {
        this.playTone(alt ? 260 : 200, 0.08, 'square', 0.12);
    }

    powerUp() {
        const t = this.ctx ? this.ctx.currentTime : 0;
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.3);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }

    eatGhost() {
        const t = this.ctx ? this.ctx.currentTime : 0;
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(200, t + 0.4);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }

    death() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 8; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 600 - i * 60;
            gain.gain.setValueAtTime(0.12, t + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.11);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + i * 0.12);
            osc.stop(t + i * 0.12 + 0.12);
        }
    }

    siren(speed = 1) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200 * speed, t);
        osc.frequency.linearRampToValueAtTime(300 * speed, t + 0.2);
        osc.frequency.linearRampToValueAtTime(200 * speed, t + 0.4);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }

    frightened() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(350, t + 0.15);
        osc.frequency.linearRampToValueAtTime(300, t + 0.3);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    introChomp() {
        this.playTone(300, 0.06, 'square', 0.1);
        setTimeout(() => this.playTone(250, 0.06, 'square', 0.1), 80);
    }

    gameStart() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [262, 330, 392, 523, 392, 330, 262, 294, 349, 440, 523, 440, 349, 294];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, t + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.14 + 0.13);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + i * 0.14);
            osc.stop(t + i * 0.14 + 0.14);
        });
    }
}

// --- PLAYER (Omnicom O) ---
class Player {
    constructor(startTileX, startTileY) {
        this.startX = startTileX;
        this.startY = startTileY;
        this.reset();
        this.mouthAngle = 0;
        this.mouthDir = 1;
        this.mouthSpeed = 12;
    }

    reset() {
        this.tileX = this.startX;
        this.tileY = this.startY;
        this.pixelX = this.startX * TILE + TILE / 2;
        this.pixelY = this.startY * TILE + TILE / 2;
        this.dir = DIR_LEFT;
        this.nextDir = DIR_LEFT;
        this.moving = false;
        this.speed = PLAYER_SPEED;
        this.mouthAngle = 0;
    }

    update(dt, maze) {
        // Animate mouth
        this.mouthAngle += this.mouthSpeed * dt * this.mouthDir;
        if (this.mouthAngle > 0.9) { this.mouthAngle = 0.9; this.mouthDir = -1; }
        if (this.mouthAngle < 0.05) { this.mouthAngle = 0.05; this.mouthDir = 1; }

        // Try to change direction at tile center
        const cx = Math.round((this.pixelX - TILE / 2) / TILE);
        const cy = Math.round((this.pixelY - TILE / 2) / TILE);
        const atCenterX = Math.abs(this.pixelX - (cx * TILE + TILE / 2)) < 1.5;
        const atCenterY = Math.abs(this.pixelY - (cy * TILE + TILE / 2)) < 1.5;

        if (atCenterX && atCenterY) {
            this.tileX = cx;
            this.tileY = cy;

            // Try queued direction
            if (this.nextDir !== DIR_NONE && this.canMove(cx, cy, this.nextDir, maze)) {
                this.dir = this.nextDir;
                this.moving = true;
            }
            // Check if can continue current direction
            if (!this.canMove(cx, cy, this.dir, maze)) {
                this.moving = false;
                this.pixelX = cx * TILE + TILE / 2;
                this.pixelY = cy * TILE + TILE / 2;
            }
        }

        if (this.moving) {
            const v = DIR_VEC[this.dir];
            this.pixelX += v.x * this.speed * TILE * dt;
            this.pixelY += v.y * this.speed * TILE * dt;

            // Tunnel wrap
            if (this.pixelX < -TILE / 2) this.pixelX = CANVAS_W + TILE / 2;
            if (this.pixelX > CANVAS_W + TILE / 2) this.pixelX = -TILE / 2;
        }
    }

    canMove(tx, ty, dir, maze) {
        const v = DIR_VEC[dir];
        let nx = tx + v.x;
        let ny = ty + v.y;
        // Tunnel
        if (nx < 0) nx = COLS - 1;
        if (nx >= COLS) nx = 0;
        if (ny < 0 || ny >= ROWS) return false;
        const cell = maze[ny][nx];
        return cell !== 0 && cell !== 5;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pixelX, this.pixelY);

        // Rotation based on direction
        let rotation = 0;
        if (this.dir === DIR_UP) rotation = -Math.PI / 2;
        else if (this.dir === DIR_DOWN) rotation = Math.PI / 2;
        else if (this.dir === DIR_LEFT) rotation = Math.PI;
        else if (this.dir === DIR_RIGHT) rotation = 0;
        ctx.rotate(rotation);

        const r = TILE * 0.85;
        drawPixelPacman(ctx, 0, 0, r, this.mouthAngle);

        ctx.restore();
    }
}

// --- GHOST ---
class Ghost {
    constructor(type, startTileX, startTileY) {
        this.type = type;
        this.startX = startTileX;
        this.startY = startTileY;
        this.color = GHOST_COLORS[type];
        this.reset();
    }

    reset() {
        this.tileX = this.startX;
        this.tileY = this.startY;
        this.pixelX = this.startX * TILE + TILE / 2;
        this.pixelY = this.startY * TILE + TILE / 2;
        this.dir = DIR_UP;
        this.nextDir = DIR_UP;
        this.mode = 'scatter'; // scatter, chase, frightened, eaten
        this.frightTimer = 0;
        this.speed = GHOST_SPEED;
        this.inHouse = this.type !== BLINKY;
        this.houseTimer = this.type * 3; // Stagger exits
        this.blinking = false;
        this.exitingHouse = false;
        this._lastDecTileX = -1;
        this._lastDecTileY = -1;
    }

    getTarget(player, blinky) {
        if (this.mode === 'scatter') {
            return SCATTER_TARGETS[this.type];
        }
        if (this.mode === 'frightened') {
            return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        }

        // Chase mode targets
        switch (this.type) {
            case BLINKY: // Direct chase
                return { x: player.tileX, y: player.tileY };
            case PINKY: { // 4 tiles ahead
                const v = DIR_VEC[player.dir] || DIR_VEC[DIR_LEFT];
                return { x: player.tileX + v.x * 4, y: player.tileY + v.y * 4 };
            }
            case INKY: { // Complex: uses Blinky's position
                const v = DIR_VEC[player.dir] || DIR_VEC[DIR_LEFT];
                const ax = player.tileX + v.x * 2;
                const ay = player.tileY + v.y * 2;
                return {
                    x: ax + (ax - (blinky ? blinky.tileX : this.tileX)),
                    y: ay + (ay - (blinky ? blinky.tileY : this.tileY))
                };
            }
            case CLYDE: { // Chase when far, scatter when close
                const dist = Math.sqrt(
                    Math.pow(this.tileX - player.tileX, 2) +
                    Math.pow(this.tileY - player.tileY, 2)
                );
                if (dist > 8) return { x: player.tileX, y: player.tileY };
                return SCATTER_TARGETS[CLYDE];
            }
        }
        return { x: player.tileX, y: player.tileY };
    }

    update(dt, maze, player, blinky) {
        // Handle house exit
        if (this.inHouse) {
            this.houseTimer -= dt;
            if (this.houseTimer <= 0) {
                this.inHouse = false;
                // Teleport to just above ghost house, centered on tile
                this.tileX = 14;
                this.tileY = 11;
                this.pixelX = 14 * TILE + TILE / 2;
                this.pixelY = 11 * TILE + TILE / 2;
                this.dir = DIR_LEFT;
                this._lastDecTileX = -1;
                this._lastDecTileY = -1;
            } else {
                // Bob up and down in house
                this.pixelY += Math.sin(Date.now() / 200) * 0.5;
                return;
            }
        }

        // Determine speed
        let spd = this.speed;
        if (this.mode === 'frightened') spd = GHOST_FRIGHT_SPEED;
        if (this.mode === 'eaten') spd = GHOST_SPEED * 2;
        // Tunnel slowdown
        if ((this.tileX <= 5 || this.tileX >= 22) && this.tileY === 14) {
            spd = GHOST_TUNNEL_SPEED;
        }

        const cx = Math.round((this.pixelX - TILE / 2) / TILE);
        const cy = Math.round((this.pixelY - TILE / 2) / TILE);
        const atCenterX = Math.abs(this.pixelX - (cx * TILE + TILE / 2)) < 1.5;
        const atCenterY = Math.abs(this.pixelY - (cy * TILE + TILE / 2)) < 1.5;

        if (atCenterX && atCenterY && (cx !== this._lastDecTileX || cy !== this._lastDecTileY)) {
            this._lastDecTileX = cx;
            this._lastDecTileY = cy;
            this.tileX = cx;
            this.tileY = cy;
            this.pixelX = cx * TILE + TILE / 2;
            this.pixelY = cy * TILE + TILE / 2;

            // If eaten and back at house
            if (this.mode === 'eaten' && cx >= 12 && cx <= 15 && cy >= 12 && cy <= 15) {
                this.mode = 'scatter';
                this.dir = DIR_UP;
                this._lastDecTileX = -1;
                this._lastDecTileY = -1;
            }

            // Choose direction at intersection
            const target = this.getTarget(player, blinky);
            let bestDir = this.dir;
            let bestDist = Infinity;
            const reverse = (this.dir + 2) % 4;

            for (let d = 0; d < 4; d++) {
                if (d === reverse) continue; // Can't reverse
                const v = DIR_VEC[d];
                let nx = cx + v.x;
                let ny = cy + v.y;
                if (nx < 0) nx = COLS - 1;
                if (nx >= COLS) nx = 0;
                if (ny < 0 || ny >= ROWS) continue;

                const cell = maze[ny][nx];
                // Can't go through walls
                if (cell === 0) continue;
                // Only eaten ghosts can enter gate
                if (cell === 5 && this.mode !== 'eaten') continue;
                // Ghosts can't go up at certain tiles (classic rule)
                if (d === DIR_UP && this.mode !== 'eaten') {
                    if ((cx === 12 || cx === 15) && (cy === 11 || cy === 23)) continue;
                }

                const dist = Math.pow(nx - target.x, 2) + Math.pow(ny - target.y, 2);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestDir = d;
                }
            }
            this.dir = bestDir;
        }

        // Move
        const v = DIR_VEC[this.dir];
        this.pixelX += v.x * spd * TILE * dt;
        this.pixelY += v.y * spd * TILE * dt;

        // Tunnel wrap
        if (this.pixelX < -TILE / 2) this.pixelX = CANVAS_W + TILE / 2;
        if (this.pixelX > CANVAS_W + TILE / 2) this.pixelX = -TILE / 2;

        // Frightened timer
        if (this.mode === 'frightened') {
            this.frightTimer -= dt;
            this.blinking = this.frightTimer < 2;
            if (this.frightTimer <= 0) {
                this.mode = 'chase';
                this.blinking = false;
            }
        }
    }

    setFrightened(duration) {
        if (this.mode !== 'eaten') {
            this.mode = 'frightened';
            this.frightTimer = duration;
            this.blinking = false;
            // Reverse direction
            this.dir = (this.dir + 2) % 4;
            this._lastDecTileX = -1;
            this._lastDecTileY = -1;
        }
    }

    draw(ctx, tick) {
        if (this.mode === 'eaten') {
            // Just draw eyes
            this.drawEyes(ctx);
            return;
        }

        ctx.save();
        ctx.translate(this.pixelX, this.pixelY);

        const r = TILE * 0.8;
        const bodyColor = this.mode === 'frightened'
            ? (this.blinking && Math.floor(tick * 6) % 2 ? '#fff' : '#2121DE')
            : this.color;

        // Ghost body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, -r * 0.1, r, Math.PI, 0, false);
        // Wavy bottom
        ctx.lineTo(r, r * 0.7);
        for (let i = 0; i < 3; i++) {
            const waveX = r - (i * 2 + 1) * (r / 3);
            ctx.quadraticCurveTo(
                r - (i * 2 + 0.5) * (r / 3),
                r * 0.7 + ((i + Math.floor(tick * 5)) % 2 ? r * 0.3 : 0),
                waveX, r * 0.7
            );
        }
        ctx.lineTo(-r, r * 0.7);
        ctx.closePath();
        ctx.fill();

        // Eyes
        if (this.mode === 'frightened') {
            // Frightened face
            ctx.fillStyle = bodyColor === '#fff' ? '#F00' : '#fff';
            ctx.beginPath();
            ctx.arc(-r * 0.3, -r * 0.15, r * 0.15, 0, Math.PI * 2);
            ctx.arc(r * 0.3, -r * 0.15, r * 0.15, 0, Math.PI * 2);
            ctx.fill();
            // Wavy mouth
            ctx.strokeStyle = bodyColor === '#fff' ? '#F00' : '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-r * 0.45, r * 0.3);
            for (let i = 0; i < 4; i++) {
                ctx.lineTo(-r * 0.45 + (i + 1) * r * 0.225, r * 0.3 + (i % 2 ? -r * 0.12 : r * 0.12));
            }
            ctx.stroke();
        } else {
            this.drawEyesLocal(ctx, r);
        }

        ctx.restore();
    }

    drawEyesLocal(ctx, r) {
        const v = DIR_VEC[this.dir] || { x: 0, y: 0 };
        // White part
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.3, -r * 0.2, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pupils
        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(-r * 0.3 + v.x * r * 0.12, -r * 0.2 + v.y * r * 0.12, r * 0.12, 0, Math.PI * 2);
        ctx.arc(r * 0.3 + v.x * r * 0.12, -r * 0.2 + v.y * r * 0.12, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEyes(ctx) {
        ctx.save();
        ctx.translate(this.pixelX, this.pixelY);
        const r = TILE * 0.8;
        this.drawEyesLocal(ctx, r);
        ctx.restore();
    }
}

// --- MAIN GAME ---
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new AudioEngine();
        this.state = STATE_INTRO;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('pacOmnicomHigh') || '0');
        this.lives = 3;
        this.maze = [];
        this.totalDots = 0;
        this.dotsEaten = 0;
        this.tick = 0;
        this.wakaAlt = false;
        this.wakaTimer = 0;
        this.sirenTimer = 0;
        this.ghostEatCombo = 0;
        this.stateTimer = 0;
        this.modeTimer = 0;
        this.modeIndex = 0;
        this.bonusActive = false;
        this.bonusEaten = false;
        this.bonusX = 0;
        this.bonusY = 0;
        this.bonusVX = 0;
        this.bonusVY = 0;
        this.freezeTimer = 0;
        this.ghostEatScore = 0;
        this.ghostEatPos = null;

        // Mode durations: [scatter, chase, scatter, chase, ...]
        this.modeDurations = [7, 20, 7, 20, 5, 20, 5, Infinity];

        // Intro — skip straight to title screen
        this.introPhase = 3;
        this.introTimer = 0;
        this.introOX = 0;
        this.introMouth = 0;
        this.introLettersEaten = 0;

        // Input
        this.keys = {};
        this.setupInput();

        // Start
        this.initMaze();
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Init audio on first keypress
            if (!this.audio.initialized) {
                this.audio.init();
            }

            if (this.state === STATE_INTRO) {
                this.startGame();
            }

            if (this.state === STATE_GAMEOVER) {
                this.state = STATE_INTRO;
                this.introPhase = 3;
                this.score = 0;
                this.lives = 3;
            }

            e.preventDefault();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    initMaze() {
        this.maze = MAZE_DATA.map(row => [...row]);
        this.totalDots = 0;
        this.dotsEaten = 0;
        powerPelletPositions = [];
        let pelletIndex = 0;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.maze[y][x] === 1) this.totalDots++;
                if (this.maze[y][x] === 2) {
                    this.totalDots++;
                    powerPelletPositions.push({ x, y, index: pelletIndex++ });
                }
            }
        }
    }

    startGame() {
        this.state = STATE_PLAYING;
        this.initMaze();
        this.bonusEaten = false;
        this.bonusActive = false;
        this.bonusX = 0;
        this.bonusY = 0;
        this.bonusVX = 0;
        this.bonusVY = 0;

        // Show header/footer
        document.getElementById('header').style.display = 'flex';
        document.getElementById('footer').style.display = 'flex';

        // Create entities
        this.player = new Player(14, 23);
        this.ghosts = [
            new Ghost(BLINKY, 14, 11),
            new Ghost(PINKY, 14, 14),
            new Ghost(INKY, 12, 14),
            new Ghost(CLYDE, 16, 14)
        ];

        this.modeIndex = 0;
        this.modeTimer = this.modeDurations[0];
        this.ghostEatCombo = 0;

        this.audio.gameStart();
        this.updateUI();
    }

    updateUI() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('highScore').textContent = this.highScore.toLocaleString();

        // Lives
        const livesEl = document.getElementById('lives');
        livesEl.innerHTML = '';
        for (let i = 0; i < this.lives - 1; i++) {
            const c = document.createElement('canvas');
            c.width = 24; c.height = 24;
            const cx = c.getContext('2d');
            drawPixelPacman(cx, 12, 12, 9, 0.3);
            livesEl.appendChild(c);
        }
    }

    handleInput() {
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.player.nextDir = DIR_UP;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.nextDir = DIR_DOWN;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.nextDir = DIR_LEFT;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.nextDir = DIR_RIGHT;
    }

    update(dt) {
        this.tick += dt;

        switch (this.state) {
            case STATE_INTRO:
                this.updateIntro(dt);
                break;

            case STATE_READY:
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.state = STATE_PLAYING;
                }
                break;

            case STATE_PLAYING:
                this.updatePlaying(dt);
                break;

            case STATE_DYING:
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.state = STATE_GAMEOVER;
                        this.stateTimer = 3;
                    } else {
                        this.player.reset();
                        this.ghosts.forEach(g => g.reset());
                        this.state = STATE_READY;
                        this.stateTimer = 2;
                        this.updateUI();
                    }
                }
                break;

            case STATE_GHOST_EAT:
                this.freezeTimer -= dt;
                if (this.freezeTimer <= 0) {
                    this.state = STATE_PLAYING;
                }
                break;

            case STATE_WIN:
                this.stateTimer -= dt;
                // Flashing maze
                break;

            case STATE_GAMEOVER:
                this.stateTimer -= dt;
                break;
        }
    }

    updateIntro(dt) {
        this.introTimer += dt;

        switch (this.introPhase) {
            case 0: // Show PAC + OMNICOM text
                if (this.introTimer > 2.0) {
                    this.introPhase = 1;
                    this.introTimer = 0;
                    this.introOX = 0;
                }
                break;

            case 1: // O morphs to Pac-Man
                if (this.introTimer > 1.5) {
                    this.introPhase = 2;
                    this.introTimer = 0;
                    this.introLettersEaten = 0;
                }
                break;

            case 2: // O eats across
                this.introOX += dt * 250;
                if (this.introTimer > 0.15 * (this.introLettersEaten + 1)) {
                    this.introLettersEaten++;
                    this.audio.introChomp();
                }
                if (this.introTimer > 2.5) {
                    this.introPhase = 3;
                    this.introTimer = 0;
                }
                break;

            case 3: // "Press any key"
                break;
        }
    }

    updatePlaying(dt) {
        this.handleInput();
        this.player.update(dt, this.maze);

        // Ghost mode timer
        this.modeTimer -= dt;
        if (this.modeTimer <= 0 && this.modeIndex < this.modeDurations.length - 1) {
            this.modeIndex++;
            this.modeTimer = this.modeDurations[this.modeIndex];
            const newMode = this.modeIndex % 2 === 0 ? 'scatter' : 'chase';
            this.ghosts.forEach(g => {
                if (g.mode !== 'frightened' && g.mode !== 'eaten') {
                    g.mode = newMode;
                    g.dir = (g.dir + 2) % 4;
                    g._lastDecTileX = -1;
                    g._lastDecTileY = -1;
                }
            });
        }

        // Update ghosts
        const blinky = this.ghosts[0];
        this.ghosts.forEach(g => g.update(dt, this.maze, this.player, blinky));

        // Dot eating
        const px = this.player.tileX;
        const py = this.player.tileY;
        if (px >= 0 && px < COLS && py >= 0 && py < ROWS) {
            const cell = this.maze[py][px];
            if (cell === 1) {
                this.maze[py][px] = 3;
                this.score += 10;
                this.dotsEaten++;
                this.wakaTimer -= 0.08;
                if (this.wakaTimer <= 0) {
                    this.audio.waka(this.wakaAlt);
                    this.wakaAlt = !this.wakaAlt;
                    this.wakaTimer = 0.08;
                }
            } else if (cell === 2) {
                this.maze[py][px] = 3;
                this.score += 50;
                this.dotsEaten++;
                this.ghostEatCombo = 0;
                this.audio.powerUp();
                this.ghosts.forEach(g => g.setFrightened(7));
            }
        }

        // Siren sound
        this.sirenTimer -= dt;
        if (this.sirenTimer <= 0) {
            const anyFrightened = this.ghosts.some(g => g.mode === 'frightened');
            if (anyFrightened) {
                this.audio.frightened();
            } else {
                this.audio.siren(1 + this.dotsEaten / this.totalDots * 0.5);
            }
            this.sirenTimer = 0.4;
        }

        // Bonus item - bounces around until eaten
        if (!this.bonusActive && !this.bonusEaten && this.dotsEaten >= 70) {
            this.bonusActive = true;
            this.bonusX = 14 * TILE + TILE / 2;
            this.bonusY = 17 * TILE + TILE / 2;
            const angle = Math.random() * Math.PI * 2;
            this.bonusVX = Math.cos(angle) * 60;
            this.bonusVY = Math.sin(angle) * 60;
        }
        if (this.bonusActive) {
            // Move
            this.bonusX += this.bonusVX * dt;
            this.bonusY += this.bonusVY * dt;
            // Bounce off canvas edges
            if (this.bonusX < 12 || this.bonusX > CANVAS_W - 12) {
                this.bonusVX *= -1;
                this.bonusX = Math.max(12, Math.min(CANVAS_W - 12, this.bonusX));
            }
            if (this.bonusY < 12 || this.bonusY > CANVAS_H - 12) {
                this.bonusVY *= -1;
                this.bonusY = Math.max(12, Math.min(CANVAS_H - 12, this.bonusY));
            }
            // Check if player eats it (pixel distance)
            const bdist = Math.sqrt(
                Math.pow(this.player.pixelX - this.bonusX, 2) +
                Math.pow(this.player.pixelY - this.bonusY, 2)
            );
            if (bdist < TILE) {
                this.bonusActive = false;
                this.bonusEaten = true;
                this.score += 100;
            }
        }

        // Ghost collision
        for (const g of this.ghosts) {
            if (g.inHouse) continue;
            const dist = Math.sqrt(
                Math.pow(this.player.pixelX - g.pixelX, 2) +
                Math.pow(this.player.pixelY - g.pixelY, 2)
            );
            if (dist < TILE * 0.8) {
                if (g.mode === 'frightened') {
                    g.mode = 'eaten';
                    this.ghostEatCombo++;
                    const points = 200 * Math.pow(2, this.ghostEatCombo - 1);
                    this.score += points;
                    this.ghostEatScore = points;
                    this.ghostEatPos = { x: g.pixelX, y: g.pixelY };
                    this.audio.eatGhost();
                    this.state = STATE_GHOST_EAT;
                    this.freezeTimer = 0.5;
                } else if (g.mode !== 'eaten') {
                    // Player dies
                    this.state = STATE_DYING;
                    this.stateTimer = 1.5;
                    this.audio.death();
                }
            }
        }

        // Win check
        if (this.dotsEaten >= this.totalDots) {
            this.state = STATE_WIN;
            this.stateTimer = 3;
        }

        // Update score display
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('pacOmnicomHigh', this.highScore);
        }
        this.updateUI();
    }

    // --- RENDERING ---
    render() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        if (this.state === STATE_INTRO) {
            this.renderIntro(ctx);
            return;
        }

        this.renderMaze(ctx);
        this.renderDots(ctx);
        this.renderBonus(ctx);

        if (this.state !== STATE_DYING) {
            this.ghosts.forEach(g => g.draw(ctx, this.tick));
        }

        if (this.state === STATE_DYING) {
            this.renderDeath(ctx);
        } else {
            this.player.draw(ctx);
        }

        if (this.state === STATE_GHOST_EAT && this.ghostEatPos) {
            ctx.fillStyle = '#0FF';
            ctx.font = 'bold 10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('$' + this.ghostEatScore, this.ghostEatPos.x, this.ghostEatPos.y - 5);
        }

        if (this.state === STATE_READY) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('READY!', CANVAS_W / 2, CANVAS_H / 2 + 4);
        }

        if (this.state === STATE_WIN) {
            // Flash maze walls
            if (Math.floor(this.tick * 4) % 2) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            }
            ctx.fillStyle = '#FFD700';
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ACQUISITION COMPLETE!', CANVAS_W / 2, CANVAS_H / 2 - 10);
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText('ALL AGENCIES CONSUMED', CANVAS_W / 2, CANVAS_H / 2 + 10);
            ctx.fillText('PROFITS: $' + this.score.toLocaleString(), CANVAS_W / 2, CANVAS_H / 2 + 30);
        }

        if (this.state === STATE_GAMEOVER) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 10);
            ctx.fillStyle = '#FFD700';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillText('THE MARKET WINS', CANVAS_W / 2, CANVAS_H / 2 + 15);
            ctx.fillStyle = '#888';
            ctx.fillText('PRESS ANY KEY', CANVAS_W / 2, CANVAS_H / 2 + 40);
        }
    }

    renderIntro(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        const centerX = CANVAS_W / 2;
        const centerY = CANVAS_H / 2;

        switch (this.introPhase) {
            case 0: { // Show OMNICOM text
                // "OMNICOM" in 8-bit font
                ctx.fillStyle = '#fff';
                ctx.font = '28px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('OMNICOM', centerX, centerY + 10);

                // "loading..."
                const dots = '.'.repeat(Math.floor(this.introTimer * 2) % 4);
                ctx.fillStyle = '#888';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText('loading' + dots, centerX, centerY + 50);
                break;
            }

            case 1: { // O morphs to Pac-Man
                const morphProgress = Math.min(this.introTimer / 1.2, 1);

                // Draw OMNICOM in 8-bit font with O morphing
                ctx.fillStyle = '#fff';
                ctx.font = '28px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                const text = 'OMNICOM';
                const metrics = ctx.measureText(text);
                const startX = centerX - metrics.width / 2;

                // Measure just the O
                const oMetrics = ctx.measureText('O');
                const oWidth = oMetrics.width;

                // Draw MNICOM (remaining letters)
                ctx.textAlign = 'left';
                ctx.fillText('MNICOM', startX + oWidth, centerY + 10);

                // Morphing O - transitions from letter to pac-man shape
                const oX = startX + oWidth / 2;
                const oY = centerY;
                const mouthAngle = morphProgress * 0.8;
                const radius = 16;

                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(oX, oY, radius, mouthAngle, Math.PI * 2 - mouthAngle);
                ctx.lineTo(oX, oY);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // loading...
                ctx.textAlign = 'center';
                const dots2 = '.'.repeat(Math.floor((this.introTimer + 2) * 2) % 4);
                ctx.fillStyle = '#888';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText('loading' + dots2, centerX, centerY + 50);
                break;
            }

            case 2: { // O eats across through MNICOM
                const fullText = 'OMNICOM';
                ctx.fillStyle = '#fff';
                ctx.font = '28px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                const fullMetrics = ctx.measureText(fullText);
                const fStartX = centerX - fullMetrics.width / 2;

                // Measure each letter for precise positioning
                const letterWidths = [];
                let cumWidth = 0;
                for (const ch of fullText) {
                    const w = ctx.measureText(ch).width;
                    letterWidths.push({ char: ch, width: w, x: fStartX + cumWidth });
                    cumWidth += w;
                }

                // The O pac-man position (starts at O position, eats right)
                const pacX = fStartX + this.introOX;
                const pacY = centerY;

                // Draw letters that haven't been eaten yet
                ctx.fillStyle = '#fff';
                for (let i = 1; i < letterWidths.length; i++) {
                    if (letterWidths[i].x + letterWidths[i].width / 2 > pacX + 12) {
                        ctx.fillText(letterWidths[i].char, letterWidths[i].x, centerY + 10);
                    }
                }

                // Draw pac-man O chomping through
                const mouthCycle = Math.sin(this.introTimer * 15) * 0.4 + 0.4;
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(pacX, pacY, 16, mouthCycle, Math.PI * 2 - mouthCycle);
                ctx.lineTo(pacX, pacY);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // loading dots
                ctx.textAlign = 'center';
                const dots3 = '.'.repeat(Math.floor((this.introTimer + 4) * 2) % 4);
                ctx.fillStyle = '#888';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText('loading' + dots3, centerX, centerY + 50);
                break;
            }

            case 3: { // Title screen — clean & simple
                // Animated O Pac-Man + MNICOM in 8-bit font
                ctx.font = '28px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                const mnicomMetrics = ctx.measureText('MNICOM');
                const oRadius = 18;
                const oGap = 6;
                const totalWidth = oRadius * 2 + oGap + mnicomMetrics.width;
                const titleStartX = centerX - totalWidth / 2;

                // Animated O Pac-Man
                const tMouth = Math.sin(this.tick * 10) * 0.3 + 0.35;
                const titleOX = titleStartX + oRadius;
                const titleOY = centerY - 12;

                drawPixelPacman(ctx, titleOX, titleOY, oRadius, tMouth);

                // "MNICOM" in 8-bit font
                ctx.fillStyle = '#fff';
                ctx.font = '28px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                ctx.fillText('MNICOM', titleStartX + oRadius * 2 + oGap, centerY + 1);

                // Blinking "Press any key"
                if (Math.floor(this.tick * 2.5) % 2) {
                    ctx.fillStyle = '#FFD700';
                    ctx.font = '10px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('PRESS ANY KEY', centerX, centerY + 50);
                }

                // Demo animation — O eating dollar signs across the bottom
                const demoY = centerY + 90;
                const demoX = ((this.tick * 45) % (CANVAS_W + 60)) - 30;
                // Dollar dots
                for (let i = 0; i < 15; i++) {
                    const dotX = 30 + i * 28;
                    if (dotX > demoX + 10) {
                        ctx.fillStyle = '#FFD700';
                        ctx.font = '10px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('$', dotX, demoY + 4);
                    }
                }
                // Mini pac-man O
                const dMouth = Math.sin(this.tick * 15) * 0.3 + 0.35;
                drawPixelPacman(ctx, demoX, demoY, 8, dMouth);

                break;
            }
        }
    }

    renderMaze(ctx) {
        // Draw walls with inner-edge style like classic Pac-Man
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.maze[y][x] === 0) {
                    const px = x * TILE;
                    const py = y * TILE;

                    // Check neighbors
                    const up = y > 0 && this.maze[y - 1][x] === 0;
                    const down = y < ROWS - 1 && this.maze[y + 1][x] === 0;
                    const left = x > 0 && this.maze[y][x - 1] === 0;
                    const right = x < COLS - 1 && this.maze[y][x + 1] === 0;

                    // Dark fill
                    ctx.fillStyle = '#000820';
                    ctx.fillRect(px, py, TILE, TILE);

                    // Blue border on edges facing corridors
                    ctx.strokeStyle = '#2121DE';
                    ctx.lineWidth = 2;

                    if (!up) {
                        ctx.beginPath();
                        ctx.moveTo(px, py + 0.5);
                        ctx.lineTo(px + TILE, py + 0.5);
                        ctx.stroke();
                    }
                    if (!down) {
                        ctx.beginPath();
                        ctx.moveTo(px, py + TILE - 0.5);
                        ctx.lineTo(px + TILE, py + TILE - 0.5);
                        ctx.stroke();
                    }
                    if (!left) {
                        ctx.beginPath();
                        ctx.moveTo(px + 0.5, py);
                        ctx.lineTo(px + 0.5, py + TILE);
                        ctx.stroke();
                    }
                    if (!right) {
                        ctx.beginPath();
                        ctx.moveTo(px + TILE - 0.5, py);
                        ctx.lineTo(px + TILE - 0.5, py + TILE);
                        ctx.stroke();
                    }

                    // Corner highlights for non-wall neighbors
                    if (!up && !left && (y === 0 || x === 0 || this.maze[y-1] && this.maze[y-1][x-1] !== 0)) {
                        ctx.beginPath();
                        ctx.arc(px + 2, py + 2, 2, Math.PI, Math.PI * 1.5);
                        ctx.stroke();
                    }
                } else if (this.maze[y][x] === 5) {
                    // Ghost gate - pink bar
                    ctx.fillStyle = '#FFB8FF';
                    ctx.fillRect(x * TILE, y * TILE + TILE / 2 - 2, TILE, 4);
                }
            }
        }
    }

    renderDots(ctx) {
        const pulse = Math.sin(this.tick * 4) * 0.15 + 0.85;

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cell = this.maze[y][x];
                const cx = x * TILE + TILE / 2;
                const cy = y * TILE + TILE / 2;

                if (cell === 1) {
                    // Dollar sign dot
                    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
                    ctx.font = 'bold 9px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('$', cx, cy);
                } else if (cell === 2) {
                    // Power pellet - Agency logo
                    const pellet = powerPelletPositions.find(p => p.x === x && p.y === y);
                    if (pellet) {
                        const pulseSize = Math.sin(this.tick * 6) * 2 + TILE * 0.7;
                        const logoName = AGENCY_LOGOS[pellet.index % AGENCY_LOGOS.length];

                        // Glowing background
                        ctx.save();
                        ctx.shadowColor = '#FFD700';
                        ctx.shadowBlur = 8 + Math.sin(this.tick * 5) * 4;

                        // Logo circle
                        ctx.fillStyle = '#222';
                        ctx.beginPath();
                        ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Logo text
                        ctx.fillStyle = '#FFD700';
                        ctx.font = `bold ${pulseSize * 0.7}px "Arial Black", sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(logoName, cx, cy);

                        ctx.restore();
                    }
                }
            }
        }
    }

    renderBonus(ctx) {
        if (!this.bonusActive) return;

        const bob = Math.sin(this.tick * 4) * 2;

        // Cash stack
        ctx.save();
        ctx.translate(this.bonusX, this.bonusY + bob);

        // Stack of bills
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i === 2 ? '#2d8b2d' : '#1a6b1a';
            ctx.fillRect(-8, -3 - i * 3, 16, 5);
            ctx.strokeStyle = '#0a4a0a';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-8, -3 - i * 3, 16, 5);
        }
        // Dollar sign on top bill
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$$$', 0, -7);

        ctx.restore();
    }

    renderDeath(ctx) {
        const progress = 1 - (this.stateTimer / 1.5);
        const cx = this.player.pixelX;
        const cy = this.player.pixelY;
        const r = TILE * 0.85;

        if (progress < 0.8) {
            const scale = 1 - progress / 0.8;
            const angle = progress / 0.8 * Math.PI;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.PI / 2); // mouth opens upward during death
            drawPixelPacman(ctx, 0, 0, r * scale, angle);
            ctx.restore();
        } else {
            // Brief flash
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// --- START ---
window.addEventListener('load', () => {
    new Game();
});

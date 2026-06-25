import { Tile, Entity, Item, Particle } from './types';
import { GameEngine } from './game';

export class DungeonRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engine: GameEngine;
  
  // Set tileSize to 40 for large, readable characters
  private tileSize: number = 40;
  
  // Camera Viewport Dimensions in tiles (approx. 25 tiles width around player)
  private readonly viewWidth: number = 25;
  private readonly viewHeight: number = 15;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Pulse value for glowing effects
  private pulseTime: number = 0;

  constructor(canvas: HTMLCanvasElement, engine: GameEngine) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.engine = engine;
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = this.viewWidth * this.tileSize;
    this.canvas.height = this.viewHeight * this.tileSize;
  }

  start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      
      this.update(dt);
      this.draw();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private update(dt: number) {
    this.pulseTime += dt;
    this.engine.updateParticles(dt);
  }

  private draw() {
    const { tiles, width, height, player, enemies, items, particles, status } = this.engine.state;

    // 1. Calculate camera top-left tile based on player position
    let cameraX = player.x - Math.floor(this.viewWidth / 2);
    let cameraY = player.y - Math.floor(this.viewHeight / 2);

    // Keep camera within map bounds
    cameraX = Math.max(0, Math.min(cameraX, width - this.viewWidth));
    cameraY = Math.max(0, Math.min(cameraY, height - this.viewHeight));

    // Clear background
    this.ctx.fillStyle = '#090d16'; // Deep space dark background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Draw Map Tiles in view
    for (let x = cameraX; x < cameraX + this.viewWidth; x++) {
      for (let y = cameraY; y < cameraY + this.viewHeight; y++) {
        const tile = tiles[x]?.[y];
        if (!tile || !tile.explored) continue;

        this.drawTile(tile, cameraX, cameraY);
      }
    }

    // 3. Draw Items (only if visible and inside viewport)
    for (const item of items) {
      if (
        item.x >= cameraX && item.x < cameraX + this.viewWidth &&
        item.y >= cameraY && item.y < cameraY + this.viewHeight
      ) {
        const tile = tiles[item.x]?.[item.y];
        if (tile && tile.visible) {
          this.drawItem(item, cameraX, cameraY);
        }
      }
    }

    // 4. Draw Enemies (only if visible and inside viewport)
    for (const enemy of enemies) {
      if (
        enemy.x >= cameraX && enemy.x < cameraX + this.viewWidth &&
        enemy.y >= cameraY && enemy.y < cameraY + this.viewHeight
      ) {
        const tile = tiles[enemy.x]?.[enemy.y];
        if (tile && tile.visible) {
          this.drawEnemy(enemy, cameraX, cameraY);
        }
      }
    }

    // 5. Draw Player (offset by camera)
    if (status === 'playing' || status === 'victory') {
      this.drawPlayer(player, cameraX, cameraY);
    }

    // 6. Draw Fog Overlay & Lighting Vignette (anchored to player's screen position)
    this.drawLightingVignette(player, cameraX, cameraY);

    // 7. Draw Particles (offset by camera)
    this.drawParticles(particles, cameraX, cameraY);

    // Overlay states are now rendered in HTML elements rather than the canvas buffer.
  }

  private drawTile(tile: Tile, cameraX: number, cameraY: number) {
    const screenX = (tile.x - cameraX) * this.tileSize;
    const screenY = (tile.y - cameraY) * this.tileSize;
    const isVisible = tile.visible;
    const isHellTheme = this.engine.state.dungeonLevel >= 6;

    if (tile.type === 'wall') {
      if (isHellTheme) {
        // Lava-cracked Wall styling
        this.ctx.fillStyle = isVisible ? '#1c1917' : '#0c0a09'; // stone-900 / stone-950
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

        this.ctx.strokeStyle = isVisible ? '#450a0a' : '#1c1917'; // glowing dark red / stone-900
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

        // Draw glowing red/orange lava cracks
        this.ctx.fillStyle = isVisible ? '#ea580c' : '#7c2d12'; // orange / red-orange
        this.ctx.fillRect(screenX + 4, screenY + 8, 16, 2);
        this.ctx.fillRect(screenX + 18, screenY + 8, 2, 8);
        this.ctx.fillRect(screenX + 10, screenY + 18, 22, 2);
        this.ctx.fillRect(screenX + 8, screenY + 20, 2, 6);
      } else {
        // Wall styling
        this.ctx.fillStyle = isVisible ? '#1e293b' : '#0f172a'; // slate-800 visible, slate-900 shadow
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

        // Grid line border for walls
        this.ctx.strokeStyle = isVisible ? '#334155' : '#1e293b';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw stone brick detail (scaled up for bigger tile size)
        this.ctx.fillStyle = isVisible ? '#475569' : '#1e293b';
        this.ctx.fillRect(screenX + 5, screenY + 6, 12, 5);
        this.ctx.fillRect(screenX + 22, screenY + 6, 12, 5);
        this.ctx.fillRect(screenX + 10, screenY + 18, 20, 5);
        this.ctx.fillRect(screenX + 5, screenY + 28, 14, 5);
      }
    } else if (tile.type === 'floor') {
      if (isHellTheme) {
        // Ash floor styling
        this.ctx.fillStyle = isVisible ? '#180808' : '#0a0303'; // deep dark red-black
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        this.ctx.strokeStyle = isVisible ? '#3b0712' : '#100204'; // maroon floor grid
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

        // Ember dots
        this.ctx.fillStyle = isVisible ? '#f97316' : '#9a3412'; // Glowing orange/dark orange
        this.ctx.fillRect(screenX + 10, screenY + 10, 2, 2);
        this.ctx.fillRect(screenX + 28, screenY + 22, 2, 2);
      } else {
        // Floor styling
        this.ctx.fillStyle = isVisible ? '#111827' : '#030712'; // gray-900 visible, gray-950 shadow
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Thin grid lines for floor
        this.ctx.strokeStyle = isVisible ? '#1f2937' : '#0b0f19';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

        // Floor dot pattern
        this.ctx.fillStyle = isVisible ? '#374151' : '#111827';
        this.ctx.fillRect(screenX + this.tileSize / 2 - 1, screenY + this.tileSize / 2 - 1, 3, 3);
      }
    } else if (tile.type === 'stairs') {
      if (isHellTheme) {
        // Fiery Portal / Stairs
        this.ctx.fillStyle = isVisible ? '#450a0a' : '#2d060e';
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

        // Draw procedural stairs sprite with hot lava colors
        const stairsSprite = [
          [0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,1,1,1,1],
          [0,0,0,0,0,0,0,0,1,2,2,2],
          [0,0,0,0,0,1,1,1,1,2,2,2],
          [0,0,0,0,0,1,2,2,2,2,2,2],
          [0,0,1,1,1,1,2,2,2,2,2,2],
          [0,0,1,2,2,2,2,2,2,2,2,2],
          [1,1,1,2,2,2,2,2,2,2,2,2],
          [1,2,2,2,2,2,2,2,2,2,2,2],
          [1,2,2,2,2,2,2,2,2,2,2,2],
          [1,1,1,1,1,1,1,1,1,1,1,1],
          [0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = 3;
        const startX = screenX + (this.tileSize - pixelSize * 12) / 2;
        const startY = screenY + (this.tileSize - pixelSize * 12) / 2;
        
        const colors: { [key: number]: string } = {
          1: isVisible ? '#b91c1c' : '#450a0a', // Crimson red outline
          2: isVisible ? '#f97316' : '#b91c1c'  // Glowing orange step surface
        };
        
        for (let r = 0; r < 12; r++) {
          for (let c = 0; c < 12; c++) {
            const val = stairsSprite[r][c];
            if (val !== 0) {
              this.ctx.fillStyle = colors[val];
              this.ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
            }
          }
        }
        
        // Pulse animation around stairs
        if (isVisible) {
          const pulse = (Math.sin(this.pulseTime * 4) + 1) / 2;
          this.ctx.strokeStyle = `rgba(249, 115, 22, ${0.1 + pulse * 0.25})`;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
        }
      } else {
        // Stair styling
        this.ctx.fillStyle = isVisible ? '#064e3b' : '#022c22'; // Emerald green theme
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw procedural stairs sprite
        const stairsSprite = [
          [0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,1,1,1,1],
          [0,0,0,0,0,0,0,0,1,2,2,2],
          [0,0,0,0,0,1,1,1,1,2,2,2],
          [0,0,0,0,0,1,2,2,2,2,2,2],
          [0,0,1,1,1,1,2,2,2,2,2,2],
          [0,0,1,2,2,2,2,2,2,2,2,2],
          [1,1,1,2,2,2,2,2,2,2,2,2],
          [1,2,2,2,2,2,2,2,2,2,2,2],
          [1,2,2,2,2,2,2,2,2,2,2,2],
          [1,1,1,1,1,1,1,1,1,1,1,1],
          [0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        const pixelSize = 3;
        const startX = screenX + (this.tileSize - pixelSize * 12) / 2;
        const startY = screenY + (this.tileSize - pixelSize * 12) / 2;
        
        const colors: { [key: number]: string } = {
          1: isVisible ? '#047857' : '#022c22', // Green step outline
          2: isVisible ? '#10b981' : '#064e3b'  // Green step surface
        };
        
        for (let r = 0; r < 12; r++) {
          for (let c = 0; c < 12; c++) {
            const val = stairsSprite[r][c];
            if (val !== 0) {
              this.ctx.fillStyle = colors[val];
              this.ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
            }
          }
        }
        
        // Pulse animation around stairs
        if (isVisible) {
          const pulse = (Math.sin(this.pulseTime * 4) + 1) / 2;
          this.ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + pulse * 0.2})`;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
        }
      }
    }
  }

  private drawItem(item: Item, cameraX: number, cameraY: number) {
    const screenX = (item.x - cameraX) * this.tileSize;
    const screenY = (item.y - cameraY) * this.tileSize;

    // Glowing effect behind legendary item or gold
    const pulse = (Math.sin(this.pulseTime * 5) + 1) / 2;
    if (item.name.includes('秘宝') || item.type === 'gold') {
      const grad = this.ctx.createRadialGradient(
        screenX + this.tileSize / 2, screenY + this.tileSize / 2, 3,
        screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize * 1.0
      );
      grad.addColorStop(0, item.type === 'gold' ? `rgba(234, 179, 8, ${0.3 + pulse * 0.25})` : `rgba(244, 63, 94, ${0.45 + pulse * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize * 1.0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Bobbing animation for the floating item
    const bob = Math.floor(Math.sin(this.pulseTime * 3.5 + item.x) * 2);

    // Sprites dictionary for items
    let sprite: number[][] | null = null;
    let colors: { [key: number]: string } = {};

    if (item.type === 'gold') {
      sprite = [
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,1,1,2,2,2,3,1,1,0,0],
        [0,1,2,2,2,2,3,3,3,2,1,0],
        [0,1,2,2,1,1,1,1,2,2,1,0],
        [0,1,2,2,1,2,2,1,2,2,1,0],
        [0,1,2,2,1,2,2,1,2,2,1,0],
        [0,1,2,2,1,1,1,1,2,2,1,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [0,0,1,1,2,2,2,2,1,1,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      colors = {
        1: '#b45309', // Outline / shadow
        2: '#facc15', // Base Gold Yellow
        3: '#fef08a'  // Top-right metallic highlight
      };
    } else if (item.type === 'potion_heal' || item.type === 'potion_strength') {
      sprite = [
        [0,0,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,1,2,2,2,2,1,0,0,0],
        [0,0,1,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,2,3,3,2,2,2,1,0],
        [0,1,2,2,3,3,3,3,2,2,1,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [0,0,1,2,2,2,2,2,2,1,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      colors = {
        1: '#e2e8f0', // Glass border
        2: item.type === 'potion_heal' ? '#ef4444' : '#3b82f6', // Red (heal) or Blue (strength)
        3: '#ffffff'  // Shine highlight
      };
    } else if (
      item.type === 'scroll_teleport' || 
      item.type === 'scroll_fireball' || 
      item.type === 'scroll_sleep' || 
      item.type === 'scroll_thunder' || 
      item.type === 'scroll_mapping'
    ) {
      sprite = [
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,3,3,3,3,3,3,3,2,2,1],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,4,4,0,0,0,0,0,0],
        [0,0,0,0,4,4,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,3,3,3,3,3,3,3,2,2,1],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      const scrollColors: { [key: string]: { mark: string; ribbon: string } } = {
        'scroll_teleport': { mark: '#8b5cf6', ribbon: '#3b82f6' },
        'scroll_fireball': { mark: '#f97316', ribbon: '#ef4444' },
        'scroll_sleep': { mark: '#38bdf8', ribbon: '#0ea5e9' },
        'scroll_thunder': { mark: '#facc15', ribbon: '#eab308' },
        'scroll_mapping': { mark: '#10b981', ribbon: '#047857' }
      };
      const config = scrollColors[item.type] || { mark: '#8b5cf6', ribbon: '#3b82f6' };
      colors = {
        1: '#b45309', // Wooden end
        2: '#fef3c7', // Aged paper
        3: config.mark, // Custom markings
        4: config.ribbon  // Custom ribbon
      };
    } else if (item.type === 'weapon_sword') {
      sprite = [
        [0,0,0,0,0,0,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0,1,1,2,1],
        [0,0,0,0,0,0,0,1,1,2,1,0],
        [0,0,0,0,0,0,1,1,2,1,0,0],
        [0,0,0,0,0,1,1,2,1,0,0,0],
        [0,0,0,0,1,1,2,1,0,0,0,0],
        [0,0,0,1,1,2,1,0,0,0,0,0],
        [0,0,3,1,1,1,0,0,0,0,0,0],
        [0,3,3,3,1,0,0,0,0,0,0,0],
        [0,0,3,4,3,0,0,0,0,0,0,0],
        [0,0,0,0,4,4,0,0,0,0,0,0],
        [0,0,0,0,0,4,4,0,0,0,0,0]
      ];
      colors = {
        1: '#cbd5e1', // Metal blade
        2: '#ffffff', // Shine
        3: '#fbbf24', // Golden crossguard
        4: '#78350f'  // Leather hilt
      };
    } else if (item.type === 'armor_shield') {
      sprite = [
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,2,2,2,2,2,2,2,2,1,1],
        [1,1,2,3,3,3,3,3,3,2,1,1],
        [1,1,2,3,3,3,3,3,3,2,1,1],
        [1,1,2,2,2,2,2,2,2,2,1,1],
        [0,1,1,2,2,2,2,2,2,1,1,0],
        [0,1,1,1,2,2,2,2,1,1,1,0],
        [0,0,1,1,1,2,2,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0]
      ];
      colors = {
        1: '#94a3b8', // Steel rim
        2: '#0ea5e9', // Blue field
        3: '#fbbf24'  // Golden crown/emblem
      };
    }

    if (sprite) {
      const pixelSize = 3;
      const startX = screenX + (this.tileSize - pixelSize * 12) / 2;
      const startY = screenY + (this.tileSize - pixelSize * 12) / 2 + bob;

      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const val = sprite[r][c];
          if (val !== 0) {
            this.ctx.fillStyle = colors[val];
            this.ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    } else {
      // Fallback
      this.ctx.font = `bold 24px 'Outfit', 'Inter', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = item.color;
      this.ctx.fillText(item.symbol, screenX + this.tileSize / 2, screenY + this.tileSize / 2 + bob);
    }
  }

  private drawEnemy(enemy: Entity, cameraX: number, cameraY: number) {
    const screenX = (enemy.x - cameraX) * this.tileSize;
    const screenY = (enemy.y - cameraY) * this.tileSize;

    const ew = enemy.width || 1;
    const eh = enemy.height || 1;

    // Animated breathing/bouncing size based on type
    let breath = 0;
    if (enemy.type === 'slime') {
      breath = Math.floor(Math.sin(this.pulseTime * 8) * 2);
    } else {
      breath = Math.floor(Math.sin(this.pulseTime * 4.5) * 1);
    }

    // Highlight boss
    if (enemy.type === 'dragon' || enemy.type === 'demon_king') {
      this.ctx.shadowColor = enemy.color;
      this.ctx.shadowBlur = 16;
      
      const pulse = (Math.sin(this.pulseTime * 6) + 1) / 2;
      const grad = this.ctx.createRadialGradient(
        screenX + (this.tileSize * ew) / 2, screenY + (this.tileSize * eh) / 2, 8,
        screenX + (this.tileSize * ew) / 2, screenY + (this.tileSize * eh) / 2, this.tileSize * 2.2
      );
      const rgb = enemy.type === 'dragon' ? '220, 38, 38' : '192, 132, 252';
      grad.addColorStop(0, `rgba(${rgb}, ${0.35 + pulse * 0.35})`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(screenX + (this.tileSize * ew) / 2, screenY + (this.tileSize * eh) / 2, this.tileSize * 2.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Sprites dictionary for enemies
    let sprite: number[][] | null = null;
    let colors: { [key: number]: string } = {};

    if (enemy.type === 'slime') {
      sprite = [
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,2,1,1,1,1,1,2,1,1,0],
        [1,1,2,2,1,1,1,2,2,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,0]
      ];
      colors = {
        1: enemy.color, // Green / blue slime
        2: '#ffffff'    // Eyes
      };
    } else if (enemy.type === 'goblin') {
      sprite = [
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,2,1,1,1,1,2,1,1,1],
        [1,0,1,1,3,3,3,3,1,1,0,1],
        [0,0,1,1,1,3,3,1,1,1,0,0],
        [0,0,0,1,4,4,4,4,1,0,0,0],
        [0,0,0,4,4,4,4,4,4,0,0,0],
        [0,0,4,4,4,4,4,4,4,4,0,0],
        [0,0,4,4,5,4,4,5,4,4,0,0],
        [0,0,0,5,5,0,0,5,5,0,0,0],
        [0,0,5,5,0,0,0,0,5,5,0,0]
      ];
      colors = {
        1: '#84cc16', // Goblin green skin
        2: '#ef4444', // Red eye
        3: '#4d7c0f', // Mouth shadow
        4: '#78350f', // Brown tunic
        5: '#451a03'  // Dark shoes
      };
    } else if (enemy.type === 'skeleton') {
      sprite = [
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,2,2,1,1,1,1,2,2,1,0],
        [0,1,2,2,1,1,1,1,2,2,1,0],
        [0,0,1,1,1,3,3,1,1,1,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,1,0,1,1,1,1,0,1,0,0],
        [0,1,1,0,1,1,1,1,0,1,1,0],
        [0,1,0,0,1,0,0,1,0,0,1,0],
        [1,1,0,1,1,0,0,1,1,0,1,1]
      ];
      colors = {
        1: '#f1f5f9', // Skeleton white bone
        2: '#0f172a', // Eye sockets
        3: '#94a3b8'  // Teeth/details
      };
    } else if (enemy.type === 'golem') {
      sprite = [
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,2,2,1,1,1,1,2,2,1,1],
        [1,1,2,2,1,3,3,1,2,2,1,1],
        [0,1,1,1,3,3,3,3,1,1,1,0],
        [0,1,1,1,1,3,3,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,0,0,1,1,1,0,0],
        [0,1,1,1,0,0,0,0,1,1,1,0]
      ];
      colors = {
        1: '#64748b', // Golem stone body
        2: '#334155', // Shading / cracks
        3: '#06b6d4'  // Glowing core
      };
    } else if (enemy.type === 'dragon') {
      sprite = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,1,1,0],
        [1,5,5,5,5,1,1,0,1,3,3,1,1,3,3,1,0,1,1,5,5,5,5,1],
        [1,5,5,5,5,5,5,1,1,3,3,3,3,3,3,1,1,5,5,5,5,5,5,1],
        [0,1,5,5,5,5,5,1,2,2,2,2,2,2,2,2,1,5,5,5,5,5,1,0],
        [0,0,1,1,5,5,1,2,2,2,2,2,2,2,2,2,2,1,5,5,1,1,0,0],
        [0,0,0,0,1,1,1,2,2,4,2,2,2,2,4,2,2,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,1,1,1,1,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,1,5,5,5,5,5,5,1,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,1,4,5,5,5,5,4,1,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,1,1,1,1,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,2,2,3,3,3,3,3,3,3,3,2,2,2,1,0,0,0,0],
        [0,0,0,1,2,2,2,2,3,3,3,3,3,3,3,3,2,2,2,2,1,0,0,0],
        [0,0,1,2,2,1,2,2,3,3,3,3,3,3,3,3,2,2,1,2,2,1,0,0],
        [0,1,2,2,1,0,1,2,2,3,3,3,3,3,3,2,2,1,0,1,2,2,1,0],
        [1,2,2,1,0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,1,2,2,1],
        [1,4,4,1,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,1,4,4,1],
        [0,1,1,0,0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,2,1,1,1,1,2,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0]
      ];
      colors = {
        1: '#4c1d95', // Purple outline
        2: '#7c3aed', // Purple skin
        3: '#facc15', // Yellow belly / horns
        4: '#ffffff', // White eyes / claws
        5: '#f43f5e'  // Pink wing membrane / mouth
      };
    } else if (enemy.type === 'merchant') {
      sprite = [
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,2,2,2,2,2,2,1,1,0],
        [1,1,2,2,3,2,2,3,2,2,1,1],
        [1,1,2,2,2,2,2,2,2,2,1,1],
        [0,1,1,4,4,4,4,4,4,1,1,0],
        [0,0,1,4,5,4,4,5,4,1,0,0],
        [0,0,1,4,4,4,4,4,4,1,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,1,1,0,0]
      ];
      colors = {
        1: '#7c3aed', // Purple cowl/robe
        2: '#1e1b4b', // Cowl face shadow
        3: '#facc15', // Gold eyes
        4: '#fbbf24', // Gold details
        5: '#f43f5e'  // Ruby gem amulet
      };
    } else if (enemy.type === 'hellhound') {
      sprite = [
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,1,1,0],
        [0,0,0,0,1,2,2,1,1,2,2,1],
        [0,0,0,1,2,2,2,2,2,2,2,1],
        [0,0,0,1,2,3,2,2,3,2,2,1],
        [0,0,1,2,2,2,2,2,2,2,1,0],
        [0,1,2,2,2,2,1,1,1,1,0,0],
        [0,1,2,2,2,2,2,2,2,1,0,0],
        [1,2,2,2,1,2,2,2,2,1,0,0],
        [1,2,1,1,0,1,2,1,2,1,0,0],
        [1,1,0,0,0,1,1,0,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      colors = {
        1: '#7c2d12', // Dark red-orange outline
        2: '#ea580c', // Bright orange fur
        3: '#eab308'  // Yellow glowing eyes
      };
    } else if (enemy.type === 'vampire') {
      sprite = [
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [1,2,2,3,3,3,3,3,3,2,2,1],
        [1,2,3,3,4,3,3,4,3,3,2,1],
        [1,2,3,3,3,5,5,3,3,3,2,1],
        [0,1,2,3,3,3,3,3,3,2,1,0],
        [0,0,1,2,2,2,2,2,2,1,0,0],
        [0,0,1,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [0,1,2,1,1,2,2,1,1,2,1,0],
        [1,2,2,1,0,1,1,0,1,2,2,1],
        [1,1,1,0,0,0,0,0,0,1,1,1]
      ];
      colors = {
        1: '#1e1b4b', // Dark purple cape
        2: '#ef4444', // Red lining of cape
        3: '#f1f5f9', // Pale skin
        4: '#b91c1c', // Crimson eyes
        5: '#ffffff'  // Fangs / mouth
      };
    } else if (enemy.type === 'demon') {
      sprite = [
        [0,1,0,0,0,0,0,0,0,0,1,0],
        [1,1,1,0,0,0,0,0,0,1,1,1],
        [1,2,2,1,1,1,1,1,1,2,2,1],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [0,1,2,3,2,2,2,2,3,2,1,0],
        [0,1,2,2,2,4,4,2,2,2,1,0],
        [0,0,1,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [1,2,2,1,2,2,2,2,1,2,2,1],
        [1,2,1,0,1,2,2,1,0,1,2,1],
        [1,1,0,0,1,1,1,1,0,0,1,1],
        [0,0,0,0,1,1,1,1,0,0,0,0]
      ];
      colors = {
        1: '#7f1d1d', // Dark blood red outline
        2: '#dc2626', // Red skin
        3: '#fbbf24', // Yellow glowing eyes
        4: '#450a0a'  // Mouth shadow
      };
    } else if (enemy.type === 'archdemon') {
      sprite = [
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,0,0,0,0,0,0,0,0,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,2,2,2,2,2,2,2,2,1,0],
        [1,2,2,3,2,2,2,2,3,2,2,1],
        [1,2,2,2,2,4,4,2,2,2,2,1],
        [1,2,1,2,2,2,2,2,2,1,2,1],
        [0,1,0,1,2,2,2,2,1,0,1,0],
        [0,0,0,1,2,2,2,2,1,0,0,0],
        [0,0,1,2,2,1,1,2,2,1,0,0],
        [0,1,2,2,1,0,0,1,2,2,1,0],
        [0,1,1,1,0,0,0,0,1,1,1,0]
      ];
      colors = {
        1: '#4c0519', // Deep dark maroon outline
        2: '#9f1239', // Crimson skin
        3: '#fbbf24', // Gold glowing eyes
        4: '#ffffff'  // Fangs
      };
    } else if (enemy.type === 'demon_king') {
      sprite = [
        [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,1,1,1,0,0,0,0,0,0],
        [0,0,0,1,1,2,2,2,3,3,3,3,3,3,2,2,2,1,1,1,0,0,0,0],
        [0,0,1,2,2,2,3,3,3,3,3,3,3,3,3,3,2,2,2,1,1,0,0,0],
        [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,1,0,0],
        [0,1,2,3,3,3,3,3,3,4,4,4,4,4,3,3,3,3,3,2,2,1,0,0],
        [1,2,3,3,3,3,3,4,4,4,4,4,4,4,4,4,3,3,3,3,2,1,1,0],
        [1,2,3,3,3,3,4,4,4,7,7,7,7,4,4,4,4,3,3,3,3,2,1,0],
        [1,2,3,3,3,4,4,4,7,7,7,7,7,7,4,4,4,4,3,3,3,2,1,0],
        [1,2,2,3,3,4,4,7,7,7,6,6,7,7,7,4,4,4,3,3,3,2,1,0],
        [1,2,2,3,4,4,7,7,6,6,6,6,6,6,7,7,4,4,4,3,2,2,1,0],
        [1,1,2,3,4,4,7,7,6,6,5,5,6,6,7,7,4,4,4,3,2,2,1,0],
        [1,1,2,3,4,4,7,7,6,5,3,3,5,6,7,7,4,4,4,3,2,2,1,0],
        [1,1,2,3,4,4,7,7,6,5,3,3,5,6,7,7,4,4,4,3,2,2,1,0],
        [1,2,2,3,4,4,7,7,6,6,5,5,6,6,7,7,4,4,4,3,2,2,1,0],
        [1,2,2,3,3,4,4,7,7,7,6,6,7,7,7,4,4,4,3,3,3,2,1,0],
        [1,2,3,3,3,4,4,4,7,7,7,7,7,7,4,4,4,4,3,3,3,2,1,0],
        [1,2,3,3,3,3,4,4,4,7,7,7,7,4,4,4,4,3,3,3,3,2,1,0],
        [1,2,3,3,3,3,3,4,4,4,4,4,4,4,4,4,3,3,3,3,2,1,1,0],
        [0,1,2,3,3,3,3,3,3,4,4,4,4,4,3,3,3,3,3,2,2,1,0,0],
        [0,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,1,0,0],
        [0,0,1,2,2,2,3,3,3,3,3,3,3,3,3,3,2,2,2,1,1,0,0,0],
        [0,0,0,1,1,2,2,2,3,3,3,3,3,3,2,2,2,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,1,1,1,0,0,0,0,0,0]
      ];
      colors = {
        1: '#1e1b4b', // Outer dark purple shadow outline
        2: '#b91c1c', // Dark red veins / outer boundary
        3: '#f1f5f9', // Pale white sclera
        4: '#dc2626', // Crimson iris outer boundary
        5: '#facc15', // Glowing yellow inner iris reflection/glow
        6: '#0f172a', // Dark black pupil
        7: '#ea580c'  // Orange intermediate iris color
      };
    }

    if (sprite) {
      const pixelSize = 3;
      const slimeYOffset = (enemy.type === 'slime') ? breath : 0;
      const yBob = (enemy.type !== 'slime') ? breath : 0;
      const sizeLimit = (enemy.type === 'dragon' || enemy.type === 'demon_king') ? 24 : 12;

      const startX = screenX + (this.tileSize * ew - pixelSize * sizeLimit) / 2;
      const startY = screenY + (this.tileSize * eh - pixelSize * sizeLimit) / 2 + slimeYOffset + yBob;

      for (let r = 0; r < sizeLimit; r++) {
        for (let c = 0; c < sizeLimit; c++) {
          const val = sprite[r][c];
          if (val !== 0) {
            this.ctx.fillStyle = colors[val];
            let rh = pixelSize;
            if (enemy.type === 'slime' && breath > 0) {
              rh = pixelSize - 0.3; // slightly squash slime on breath down
            }
            this.ctx.fillRect(startX + c * pixelSize, startY + r * rh, pixelSize, rh);
          }
        }
      }
    } else {
      // Fallback
      this.ctx.font = `bold 24px 'Outfit', 'Inter', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillText(enemy.symbol, screenX + this.tileSize / 2, screenY + this.tileSize / 2 + breath);
    }

    // HP Mini Bar for enemies
    if (enemy.hp < enemy.maxHp) {
      const barW = this.tileSize * ew - 8;
      const barH = 4;
      const barX = screenX + 4;
      const barY = screenY + this.tileSize * eh - 7;
      const healthPct = Math.max(0, enemy.hp / enemy.maxHp);

      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(barX, barY, barW, barH);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(barX, barY, barW * healthPct, barH);
    }

    this.ctx.shadowBlur = 0;
  }

  private drawPlayer(player: Entity, cameraX: number, cameraY: number) {
    const screenX = (player.x - cameraX) * this.tileSize;
    const screenY = (player.y - cameraY) * this.tileSize;

    // Glowing aura
    const pulse = (Math.sin(this.pulseTime * 5) + 1) / 2;
    this.ctx.shadowColor = player.color;
    this.ctx.shadowBlur = 6 + pulse * 4;

    // Bouncing hero effect
    const bob = Math.floor(Math.sin(this.pulseTime * 3.5) * 1.8);

    // 12x12 Knight Pixel Art Sprite (1:skin, 2:helmet, 3:tunic, 4:eyes, 5:brown, 6:blade, 7:shield)
    const sprite = [
      [0,0,2,2,2,2,2,2,0,0,0,0],
      [0,2,2,2,2,2,2,2,2,0,0,0],
      [2,2,2,2,2,2,2,2,2,2,0,0],
      [0,0,1,1,1,1,1,1,0,0,6,0],
      [7,7,1,4,1,1,4,1,1,0,6,0],
      [7,7,1,1,1,1,1,1,1,0,6,0],
      [0,7,3,3,3,3,3,3,0,5,6,5],
      [0,0,3,3,3,3,3,3,3,0,0,0],
      [0,3,3,5,3,3,5,3,3,0,0,0],
      [0,3,3,5,5,5,5,3,3,0,0,0],
      [0,0,5,5,0,0,5,5,0,0,0,0],
      [0,5,5,0,0,0,0,5,5,0,0,0]
    ];

    const pixelSize = 3; // 12 * 3 = 36px inside 40px tile
    const startX = screenX + (this.tileSize - pixelSize * 12) / 2;
    const startY = screenY + (this.tileSize - pixelSize * 12) / 2 + bob;

    const colors: { [key: number]: string } = {
      1: '#ffedd5', // Skin tone
      2: '#94a3b8', // Steel helmet
      3: '#0ea5e9', // Blue armor/tunic
      4: '#0f172a', // Eyes
      5: '#b45309', // Leather belt/boots/hilt
      6: '#cbd5e1', // Silver sword blade
      7: '#ef4444'  // Red shield
    };

    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const val = sprite[r][c];
        if (val !== 0) {
          this.ctx.fillStyle = colors[val];
          this.ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    this.ctx.shadowBlur = 0;
  }

  private drawLightingVignette(player: Entity, cameraX: number, cameraY: number) {
    const px = (player.x - cameraX) * this.tileSize + this.tileSize / 2;
    const py = (player.y - cameraY) * this.tileSize + this.tileSize / 2;
    const radius = 6 * this.tileSize; // 6 tiles visibility range

    const gradient = this.ctx.createRadialGradient(
      px, py, this.tileSize * 1.8,
      px, py, radius
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawParticles(particles: Particle[], cameraX: number, cameraY: number) {
    this.ctx.save();
    for (const p of particles) {
      const screenX = (p.x - cameraX) * this.tileSize + this.tileSize / 2;
      const screenY = (p.y - cameraY) * this.tileSize + this.tileSize / 2;
      const opacity = p.life / p.maxLife;

      if (p.text) {
        // Floating text
        this.ctx.font = `bold ${p.size + 4}px 'Outfit', 'Inter', sans-serif`; // Scale up particle text
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, ' + opacity + ')';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(p.text, screenX, screenY);
        
        this.ctx.fillStyle = this.hexToRgba(p.color, opacity);
        this.ctx.fillText(p.text, screenX, screenY);
      } else {
        // Splash particle
        this.ctx.fillStyle = this.hexToRgba(p.color, opacity);
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, p.size + 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.restore();
  }


  private hexToRgba(hex: string, alpha: number): string {
    const hexClean = hex.replace('#', '');
    const r = parseInt(hexClean.substring(0, 2), 16);
    const g = parseInt(hexClean.substring(2, 4), 16);
    const b = parseInt(hexClean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

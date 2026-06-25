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

    if (tile.type === 'wall') {
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
    } else if (tile.type === 'floor') {
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
    } else if (tile.type === 'stairs') {
      // Stair styling
      this.ctx.fillStyle = isVisible ? '#064e3b' : '#022c22'; // Emerald green theme
      this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
      
      this.ctx.font = `bold 24px 'Outfit', 'Inter', monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = isVisible ? '#10b981' : '#047857';
      this.ctx.fillText('>', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
      
      // Pulse animation around stairs
      if (isVisible) {
        const pulse = (Math.sin(this.pulseTime * 4) + 1) / 2;
        this.ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + pulse * 0.2})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
      }
    }
  }

  private drawItem(item: Item, cameraX: number, cameraY: number) {
    const screenX = (item.x - cameraX) * this.tileSize;
    const screenY = (item.y - cameraY) * this.tileSize;

    // Glowing effect behind legendary item or gold
    const pulse = (Math.sin(this.pulseTime * 5) + 1) / 2;
    if (item.name.includes('秘宝')) {
      const grad = this.ctx.createRadialGradient(
        screenX + this.tileSize / 2, screenY + this.tileSize / 2, 3,
        screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize * 1.2
      );
      grad.addColorStop(0, `rgba(244, 63, 94, ${0.45 + pulse * 0.4})`);
      grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize * 1.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw item symbol (larger text sizing for tileSize=40)
    this.ctx.font = `bold 24px 'Outfit', 'Inter', monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.shadowColor = item.color;
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = item.color;
    
    // Animate item position slightly (bobbing up and down)
    const bob = Math.sin(this.pulseTime * 3 + item.x) * 3;
    this.ctx.fillText(item.symbol, screenX + this.tileSize / 2, screenY + this.tileSize / 2 + bob);
    
    this.ctx.shadowBlur = 0;
  }

  private drawEnemy(enemy: Entity, cameraX: number, cameraY: number) {
    const screenX = (enemy.x - cameraX) * this.tileSize;
    const screenY = (enemy.y - cameraY) * this.tileSize;

    // Animated breathing/bouncing size based on type
    let breath = 0;
    if (enemy.type === 'slime') {
      breath = Math.sin(this.pulseTime * 8) * 2.5;
    } else {
      breath = Math.sin(this.pulseTime * 4) * 0.8;
    }

    this.ctx.font = `bold 24px 'Outfit', 'Inter', monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Highlight boss
    if (enemy.type === 'dragon') {
      this.ctx.shadowColor = enemy.color;
      this.ctx.shadowBlur = 16;
      this.ctx.font = `bold 36px 'Outfit', 'Inter', monospace`;
      
      const pulse = (Math.sin(this.pulseTime * 6) + 1) / 2;
      const grad = this.ctx.createRadialGradient(
        screenX + this.tileSize / 2, screenY + this.tileSize / 2, 4,
        screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize * 1.8
      );
      grad.addColorStop(0, `rgba(220, 38, 38, ${0.35 + pulse * 0.35})`);
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize * 1.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = enemy.color;
    
    // Draw the symbol
    this.ctx.fillText(
      enemy.symbol, 
      screenX + this.tileSize / 2, 
      screenY + this.tileSize / 2 + (enemy.type === 'slime' ? breath : 0)
    );

    // HP Mini Bar for enemies
    if (enemy.hp < enemy.maxHp) {
      const barW = this.tileSize - 8;
      const barH = 4;
      const barX = screenX + 4;
      const barY = screenY + this.tileSize - 7;
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
    this.ctx.shadowBlur = 10 + pulse * 6;

    this.ctx.font = `bold 28px 'Outfit', 'Inter', monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = player.color;

    // Bouncing hero effect
    const bob = Math.sin(this.pulseTime * 3) * 1.8;
    this.ctx.fillText(player.symbol, screenX + this.tileSize / 2, screenY + this.tileSize / 2 + bob);

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

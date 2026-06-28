import { GameState, Entity, Item } from '../types';
import { generateDungeon, computeFOV } from './dungeon';
import { soundEffects } from './sound';
import { weaponNames, weaponColors, armorNames, armorColors } from '../data/items';

const DUNGEON_WIDTH = 45;
const DUNGEON_HEIGHT = 30;

export class GameEngine {
  public state!: GameState;
  
  // Track equipped items
  public equippedWeapon: Item | null = null;
  public equippedArmor: Item | null = null;
  public debugAllVisible: boolean = false;
  public currentShopItems: any[] | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    const player: Entity = {
      id: 'player',
      x: 0,
      y: 0,
      type: 'player',
      name: '勇者',
      hp: 40,
      maxHp: 40,
      att: 6,
      def: 1,
      xpValue: 0,
      level: 1,
      xp: 0,
      maxXp: 40, // Increased from 30 to make early game slightly harder
      symbol: '@',
      color: '#38bdf8' // Sky blue
    };

    this.equippedWeapon = null;
    this.equippedArmor = null;
    this.debugAllVisible = false;
    this.currentShopItems = null;

    this.state = {
      dungeonLevel: 1,
      tiles: [],
      width: DUNGEON_WIDTH,
      height: DUNGEON_HEIGHT,
      player,
      enemies: [],
      items: [],
      messages: ['サシマのシレンの世界へようこそ！', '移動: 矢印キー または WASD', '階段 (>) を探して深部へ進みましょう。'],
      status: 'start',
      particles: [],
      inventory: [],
      gold: 0,
      turn: 1
    };
  }

  revealAllMap() {
    for (let x = 0; x < this.state.width; x++) {
      for (let y = 0; y < this.state.height; y++) {
        if (this.state.tiles[x]?.[y]) {
          this.state.tiles[x][y].explored = true;
          this.state.tiles[x][y].visible = true;
        }
      }
    }
  }

  startGame() {
    this.state.status = 'playing';
    this.loadLevel(1);
    soundEffects.playHeal(); // Start sound
  }

  loadLevel(level: number) {
    this.state.dungeonLevel = level;
    this.currentShopItems = null; // Clear shop inventory for the new floor
    
    // Generate layout
    const dungeon = generateDungeon(level, this.state.width, this.state.height);
    this.state.tiles = dungeon.tiles;
    this.state.enemies = dungeon.enemies;
    this.state.items = dungeon.items;
    
    // Position player
    this.state.player.x = dungeon.playerStart.x;
    this.state.player.y = dungeon.playerStart.y;

    // Reset visible tiles
    if (this.debugAllVisible) {
      this.revealAllMap();
    } else {
      computeFOV(this.state.player.x, this.state.player.y, this.state.tiles);
    }

    this.addMessage(`地下 ${level} 階に到達した。`);
    if (level === 5) {
      this.addMessage('【警告】この階層には恐ろしいゴブリンキングが潜んでいる！気をつけて進め！');
      this.addMessage('※ゴブリンキングを倒すまで、次の階層への階段は出現しない！');
    }
    if (level === 10) {
      this.addMessage('【警告】この階層には深淵なる「邪教の心眼」が潜んでいる！死闘に備えよ！');
    }
  }

  addMessage(msg: string) {
    this.state.messages.push(msg);
    if (this.state.messages.length > 50) {
      this.state.messages.shift();
    }
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('game-log-updated'));
  }

  spawnParticle(x: number, y: number, color: string, count: number = 8, text?: string) {
    if (text) {
      // Floating text particle
      this.state.particles.push({
        x,
        y: y - 0.3,
        vx: (Math.random() - 0.5) * 0.05,
        vy: -0.05 - Math.random() * 0.05,
        life: 1.2,
        maxLife: 1.2,
        color,
        size: 16,
        text
      });
    }

    // Standard splash particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.1;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color,
        size: 3 + Math.random() * 4
      });
    }
  }

  updateParticles(dt: number) {
    this.state.particles = this.state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      // apply light gravity to standard particles
      if (!p.text) {
        p.vy += 0.005; 
      }
      p.life -= dt;
      return p.life > 0;
    });
  }

  // Combat: Player attacks Enemy
  attackEnemy(enemy: Entity) {
    // Attack calculation: damage = playerAtt - enemyDef
    const playerAtt = this.state.player.att + (this.equippedWeapon?.value || 0);
    const damage = Math.max(1, playerAtt - enemy.def);
    enemy.hp -= damage;

    this.addMessage(`${enemy.name}に ${damage} ダメージを与えた！`);
    this.spawnParticle(enemy.x, enemy.y, '#ef4444', 12, `-${damage}`);
    soundEffects.playEnemyHit();

    // Decrease weapon durability
    if (this.equippedWeapon) {
      if (this.equippedWeapon.durability !== undefined) {
        this.equippedWeapon.durability--;
        if (this.equippedWeapon.durability <= 0) {
          this.addMessage(`【破損】${this.equippedWeapon.name} が壊れて消滅してしまった！`);
          this.equippedWeapon = null;
          soundEffects.playDeath(); // play crash/shatter sound
        }
      }
    }

    if (enemy.hp <= 0) {
      this.defeatEnemy(enemy);
    }
  }

  defeatEnemy(enemy: Entity) {
    this.state.enemies = this.state.enemies.filter(e => e.id !== enemy.id);
    this.addMessage(`${enemy.name}を倒した！`);
    
    // Give XP
    const xpGained = enemy.xpValue;
    this.addMessage(`${xpGained} XP を獲得した。`);
    
    const player = this.state.player;
    if (player.xp !== undefined && player.maxXp !== undefined) {
      player.xp += xpGained;
      while (player.xp >= player.maxXp) {
        this.levelUp();
      }
    }

    // Give Gold (Adjusted to allow reasonable shopping while maintaining balance)
    let goldGained = 0;
    if (enemy.type === 'dragon' || enemy.type === 'demon_king') {
      goldGained = Math.floor(80 + Math.random() * 40); // Boss: 80-120 G
    } else if (enemy.type === 'golden_slime') {
      goldGained = Math.floor(35 + enemy.level * 5 + Math.random() * 15); // Golden Slime:相当多め (e.g. Level 1: 40-55 G)
    } else if (enemy.type === 'silver_slime') {
      goldGained = Math.floor(2 + enemy.level * 0.5 + Math.random() * 3); // Silver Slime: 経験値は多いがゴールドは少なめ
    } else {
      goldGained = Math.floor((enemy.xpValue * 0.11) + Math.random() * (enemy.xpValue * 0.11) + 1);
    }
    
    this.state.gold += goldGained;
    this.addMessage(`${goldGained} ゴールドを獲得した。`);
    this.spawnParticle(enemy.x, enemy.y, '#eab308', 8, `+${goldGained} G`);
    soundEffects.playGold();

    // Check if the defeated enemy is a Boss
    if (enemy.type === 'dragon') {
      this.addMessage('ゴブリンキングを討伐した！');
      this.spawnParticle(enemy.x, enemy.y, '#fbbf24', 30, 'キング討伐！');
      // Spawn stairs
      this.state.tiles[enemy.x][enemy.y].type = 'stairs';
      this.addMessage('ゴブリンキングが倒れ、下り階段が現れた！');
      soundEffects.playStairs();
    } else if (enemy.type === 'demon_king') {
      this.state.gold += 9999; // Add relic value to final gold/score
      this.addMessage('「邪教の心眼」を討伐した！「生成AIの秘宝」を取り戻し、ダンジョンを完全に支配した！');
      this.spawnParticle(enemy.x, enemy.y, '#f43f5e', 45, 'VICTORY!');
      this.state.status = 'victory';
      soundEffects.playLevelUp();
    }
  }

  levelUp() {
    const player = this.state.player;
    player.level += 1;
    if (player.xp !== undefined && player.maxXp !== undefined) {
      player.xp -= player.maxXp;
      player.maxXp = Math.floor(player.maxXp * 1.70); // more XP needed (was 1.55)
    }
    
    player.maxHp = Math.floor(player.maxHp * 1.15) + 4;
    const healAmt = Math.floor(player.maxHp * 0.40);
    player.hp = Math.min(player.maxHp, player.hp + healAmt);
    player.att += 1; // reduced from 2 to slow scaling
    player.def += 1;

    this.addMessage(`【レベルアップ】レベル ${player.level} に上がった！ HPが ${healAmt} 回復し、ステータスが上昇した。`);
    this.spawnParticle(player.x, player.y, '#f59e0b', 20, 'LEVEL UP!');
    soundEffects.playLevelUp();
  }

  canEnemyMoveTo(enemy: Entity, targetX: number, targetY: number): boolean {
    const w = enemy.width || 1;
    const h = enemy.height || 1;
    const player = this.state.player;

    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const tx = targetX + dx;
        const ty = targetY + dy;

        // Check bounds
        if (tx < 0 || tx >= this.state.width || ty < 0 || ty >= this.state.height) {
          return false;
        }

        // Check wall
        if (this.state.tiles[tx][ty].type === 'wall') {
          return false;
        }

        // Check player collision
        if (tx === player.x && ty === player.y) {
          return false;
        }

        // Check other enemies collision (excluding self)
        const occupiedByOther = this.state.enemies.some(e => {
          if (e.id === enemy.id) return false;
          const ew = e.width || 1;
          const eh = e.height || 1;
          return tx >= e.x && tx < e.x + ew && ty >= e.y && ty < e.y + eh;
        });
        if (occupiedByOther) {
          return false;
        }
      }
    }
    return true;
  }

  isAdjacentToPlayer(enemy: Entity): boolean {
    const w = enemy.width || 1;
    const h = enemy.height || 1;
    const player = this.state.player;

    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const tx = enemy.x + dx;
        const ty = enemy.y + dy;
        const dist = Math.max(Math.abs(tx - player.x), Math.abs(ty - player.y));
        if (dist === 1) return true;
      }
    }
    return false;
  }

  // Enemy Turn AI
  processEnemyTurns() {
    const player = this.state.player;

    for (const enemy of this.state.enemies) {
      if (enemy.type === 'merchant') continue; // Merchants don't chase or attack!
      
      // Check sleep/stun status
      if (enemy.stunTurns && enemy.stunTurns > 0) {
        enemy.stunTurns--;
        this.addMessage(`${enemy.name}は眠っている...`);
        this.spawnParticle(enemy.x + (enemy.width || 1) / 2, enemy.y + (enemy.height || 1) / 2, '#38bdf8', 2);
        continue;
      }
      
      const ew = enemy.width || 1;
      const eh = enemy.height || 1;

      // Calculate minimal Chebyshev distance to player from any occupied tile
      let dist = 9999;
      for (let dx = 0; dx < ew; dx++) {
        for (let dy = 0; dy < eh; dy++) {
          const d = Math.max(Math.abs((enemy.x + dx) - player.x), Math.abs((enemy.y + dy) - player.y));
          if (d < dist) dist = d;
        }
      }
      
      // If adjacent, attack the player
      if (this.isAdjacentToPlayer(enemy)) {
        this.attackPlayer(enemy);
      } 
      // If player is in range of sight, move towards player
      else if (dist <= 6) {
        const dx = Math.sign(player.x - enemy.x);
        const dy = Math.sign(player.y - enemy.y);
        
        // Try to move closer
        const targetX = enemy.x + dx;
        const targetY = enemy.y + dy;

        if (this.canEnemyMoveTo(enemy, targetX, targetY)) {
          enemy.x = targetX;
          enemy.y = targetY;
        } else {
          // Try horizontal only
          const targetX2 = enemy.x + dx;
          const targetY2 = enemy.y;
          if (this.canEnemyMoveTo(enemy, targetX2, targetY2)) {
            enemy.x = targetX2;
          } else {
            // Try vertical only
            const targetX3 = enemy.x;
            const targetY3 = enemy.y + dy;
            if (this.canEnemyMoveTo(enemy, targetX3, targetY3)) {
              enemy.y = targetY3;
            }
          }
        }
      }
    }
  }

  // Combat: Enemy attacks Player
  attackPlayer(enemy: Entity) {
    const player = this.state.player;
    const playerDef = player.def + (this.equippedArmor?.value || 0);
    const damage = Math.max(1, enemy.att - playerDef);
    player.hp -= damage;

    this.addMessage(`${enemy.name}から ${damage} のダメージを受けた！`);
    this.spawnParticle(player.x, player.y, '#e11d48', 8, `-${damage}`);
    soundEffects.playHit();

    // Decrease armor durability
    if (this.equippedArmor) {
      if (this.equippedArmor.durability !== undefined) {
        this.equippedArmor.durability--;
        if (this.equippedArmor.durability <= 0) {
          this.addMessage(`【破損】${this.equippedArmor.name} が壊れて消滅してしまった！`);
          this.equippedArmor = null;
          soundEffects.playDeath(); // play crash/shatter sound
        }
      }
    }

    if (player.hp <= 0) {
      player.hp = 0;
      this.state.status = 'gameover';
      this.addMessage('【ゲームオーバー】あなたは力尽きた。冒険はここで幕を閉じた。');
      this.spawnParticle(player.x, player.y, '#7f1d1d', 25, 'YOU DIED');
      soundEffects.playDeath();
    }
  }

  // Move or Attack action
  movePlayer(dx: number, dy: number) {
    if (this.state.status !== 'playing') return;

    const player = this.state.player;
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    // Check bounds
    if (targetX < 0 || targetX >= this.state.width || targetY < 0 || targetY >= this.state.height) {
      return;
    }

    const targetTile = this.state.tiles[targetX][targetY];

    // 1. Check Wall Collision
    if (targetTile.type === 'wall') {
      this.addMessage('そちらには進めない！');
      return;
    }

    // 2. Check Enemy Combat or Merchant Interaction
    const enemyAtTarget = this.state.enemies.find(e => {
      const w = e.width || 1;
      const h = e.height || 1;
      return targetX >= e.x && targetX < e.x + w && targetY >= e.y && targetY < e.y + h;
    });
    if (enemyAtTarget) {
      if (enemyAtTarget.type === 'merchant') {
        this.openShop();
        return;
      }
      this.attackEnemy(enemyAtTarget);
      
      // Progress turns
      this.state.turn++;
      this.processEnemyTurns();
      return;
    }

    // 3. Move Player
    player.x = targetX;
    player.y = targetY;

    // 4. Auto Item Pickup
    const itemIndex = this.state.items.findIndex(i => i.x === targetX && i.y === targetY);
    if (itemIndex !== -1) {
      const item = this.state.items[itemIndex];
      this.pickupItem(item, itemIndex);
    }

    // 5. Check if walking on stairs
    if (targetTile.type === 'stairs') {
      this.addMessage('足元に下り階段がある。 (「階段を下りる」ボタンを押すと下へ進めます)');
    }

    // 6. Update FOV
    if (this.debugAllVisible) {
      this.revealAllMap();
    } else {
      computeFOV(player.x, player.y, this.state.tiles);
    }

    // 7. Enemy turns
    this.state.turn++;
    this.processEnemyTurns();
  }

  pickupItem(item: Item, index: number) {
    // Gold is collected instantly
    if (item.type === 'gold') {
      this.state.gold += item.value;
      this.addMessage(`${item.value} ゴールドを拾った！`);
      this.state.items.splice(index, 1);
      soundEffects.playGold();
      this.spawnParticle(item.x, item.y, '#f59e0b', 5);
      return;
    }

    // Relic / Amulet check (Victory condition)
    if (item.name.includes('生成AIの秘宝')) {
      this.state.gold += item.value;
      this.state.items.splice(index, 1);
      this.state.status = 'victory';
      this.addMessage('【伝説の勝利】あなたは「生成AIの秘宝」を手に入れた！ダンジョンを完全に支配した！');
      this.spawnParticle(item.x, item.y, '#f43f5e', 40, 'VICTORY!');
      soundEffects.playLevelUp();
      return;
    }

    // Check Inventory limit (max 10 items)
    if (this.state.inventory.length >= 10) {
      this.addMessage(`足元に ${item.name} があるが、荷物がいっぱいで拾えない！`);
      return;
    }

    // Add to inventory
    this.state.inventory.push(item);
    this.state.items.splice(index, 1);
    this.addMessage(`${item.name} を拾った。`);
    soundEffects.playGold();
    this.spawnParticle(item.x, item.y, '#60a5fa', 5);
  }

  // Climb down stairs
  descendStairs() {
    if (this.state.status !== 'playing') return;

    const player = this.state.player;
    const tile = this.state.tiles[player.x][player.y];
    if (tile.type === 'stairs') {
      soundEffects.playStairs();
      this.loadLevel(this.state.dungeonLevel + 1);
    } else {
      this.addMessage('ここには下り階段がない！');
    }
  }

  // Inventory actions
  useInventoryItem(index: number) {
    if (this.state.status !== 'playing') return;

    const item = this.state.inventory[index];
    if (!item) return;

    const player = this.state.player;

    switch (item.type) {
      case 'potion_heal': {
        const healPct = item.value; // 40%
        const healAmt = Math.floor(player.maxHp * (healPct / 100));
        const oldHp = player.hp;
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        const actualHealed = player.hp - oldHp;
        this.addMessage(`${item.name} を使用し、HPが ${actualHealed} 回復した。`);
        this.spawnParticle(player.x, player.y, '#22c55e', 15, `+${actualHealed} HP`);
        soundEffects.playHeal();
        this.state.inventory.splice(index, 1);
        break;
      }

      case 'potion_strength':
        player.att += item.value;
        this.addMessage(`${item.name} を使用し、力が永久に ${item.value} 上昇した！`);
        this.spawnParticle(player.x, player.y, '#3b82f6', 15, `+${item.value} ATT`);
        soundEffects.playHeal();
        this.state.inventory.splice(index, 1);
        break;

      case 'weapon_sword':
        // Equip weapon
        if (this.equippedWeapon) {
          // Return old weapon to inventory
          const oldWeapon = this.equippedWeapon;
          this.state.inventory[index] = oldWeapon;
          this.addMessage(`${oldWeapon.name} を装備から外し、${item.name} を装備した。`);
        } else {
          // Remove from inventory
          this.state.inventory.splice(index, 1);
          this.addMessage(`${item.name} を装備した。`);
        }
        this.equippedWeapon = item;
        soundEffects.playGold();
        this.spawnParticle(player.x, player.y, '#a8a29e', 8, 'Equip Sword');
        break;

      case 'armor_shield':
        // Equip armor
        if (this.equippedArmor) {
          // Return old armor to inventory
          const oldArmor = this.equippedArmor;
          this.state.inventory[index] = oldArmor;
          this.addMessage(`${oldArmor.name} を装備から外し、${item.name} を装備した。`);
        } else {
          // Remove from inventory
          this.state.inventory.splice(index, 1);
          this.addMessage(`${item.name} を装備した。`);
        }
        this.equippedArmor = item;
        soundEffects.playGold();
        this.spawnParticle(player.x, player.y, '#60a5fa', 8, 'Equip Shield');
        break;

      case 'scroll_teleport': {
        // Teleport to a random floor tile
        let tx = 0;
        let ty = 0;
        let found = false;
        while (!found) {
          tx = Math.floor(Math.random() * this.state.width);
          ty = Math.floor(Math.random() * this.state.height);
          if (this.state.tiles[tx]?.[ty]?.type === 'floor') {
            found = true;
          }
        }
        player.x = tx;
        player.y = ty;
        this.addMessage(`巻物の魔力が暴走し、ダンジョンの別の場所へテレポートした！`);
        if (this.debugAllVisible) {
          this.revealAllMap();
        } else {
          computeFOV(player.x, player.y, this.state.tiles);
        }
        this.spawnParticle(player.x, player.y, '#a855f7', 20, 'Teleport!');
        soundEffects.playStairs();
        this.state.inventory.splice(index, 1);
        break;
      }

      case 'scroll_fireball': {
        // Find closest enemy in FOV
        let closestEnemy: Entity | null = null;
        let minDist = 9999;
        
        for (const enemy of this.state.enemies) {
          if (enemy.type === 'merchant') continue; // Fireball ignores merchants!
          const tile = this.state.tiles[enemy.x][enemy.y];
          if (tile.visible) {
            const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            if (dist < minDist) {
              minDist = dist;
              closestEnemy = enemy;
            }
          }
        }

        if (closestEnemy) {
          const dmg = item.value;
          closestEnemy.hp -= dmg;
          this.addMessage(`火炎球を放ち、${closestEnemy.name}に ${dmg} ダメージを与えた！`);
          this.spawnParticle(closestEnemy.x, closestEnemy.y, '#f97316', 20, `-${dmg} (火炎)`);
          soundEffects.playFireball();

          if (closestEnemy.hp <= 0) {
            this.defeatEnemy(closestEnemy);
          }
          this.state.inventory.splice(index, 1);
        } else {
          this.addMessage('視界の中に火炎球を放てる敵がいない！');
        }
        break;
      }

      case 'scroll_sleep': {
        let stunnedCount = 0;
        for (const enemy of this.state.enemies) {
          if (enemy.type === 'merchant') continue;
          const tile = this.state.tiles[enemy.x]?.[enemy.y];
          if (tile && tile.visible) {
            enemy.stunTurns = Math.floor(Math.random() * 3) + 3; // 3 to 5 turns
            stunnedCount++;
            this.spawnParticle(enemy.x + (enemy.width || 1)/2, enemy.y + (enemy.height || 1)/2, '#38bdf8', 12, 'SLEEP');
          }
        }
        if (stunnedCount > 0) {
          this.addMessage(`眠りの巻物を唱えた！周囲の敵 ${stunnedCount} 体を深い眠りに誘った。`);
          this.state.inventory.splice(index, 1);
        } else {
          this.addMessage('眠らせる敵が周囲にいない！');
        }
        break;
      }

      case 'scroll_thunder': {
        const targets: Entity[] = [];
        const thunderDmg = item.value || (15 + this.state.dungeonLevel * 3);
        for (const enemy of this.state.enemies) {
          if (enemy.type === 'merchant') continue;
          const tile = this.state.tiles[enemy.x]?.[enemy.y];
          if (tile && tile.visible) {
            targets.push(enemy);
          }
        }
        if (targets.length > 0) {
          this.addMessage(`雷光の巻物を唱えた！視界の敵 ${targets.length} 体に雷撃を落とし、それぞれ ${thunderDmg} ダメージを与えた！`);
          soundEffects.playFireball();
          this.state.inventory.splice(index, 1);

          for (const enemy of targets) {
            enemy.hp -= thunderDmg;
            this.spawnParticle(enemy.x + (enemy.width || 1)/2, enemy.y + (enemy.height || 1)/2, '#eab308', 15, `-${thunderDmg} (雷)`);
            if (enemy.hp <= 0) {
              this.defeatEnemy(enemy);
            }
          }
        } else {
          this.addMessage('周囲に雷を落とす敵がいない！');
        }
        break;
      }

      case 'scroll_repair': {
        const weapon = this.equippedWeapon;
        const armor = this.equippedArmor;
        if (!weapon && !armor) {
          this.addMessage('装備している武器や防具がない！');
          return;
        }
        
        let repaired = false;
        if (weapon && weapon.durability !== undefined && weapon.maxDurability !== undefined) {
          if (weapon.durability < weapon.maxDurability) {
            weapon.durability = Math.min(weapon.maxDurability, weapon.durability + item.value);
            repaired = true;
          }
        }
        if (armor && armor.durability !== undefined && armor.maxDurability !== undefined) {
          if (armor.durability < armor.maxDurability) {
            armor.durability = Math.min(armor.maxDurability, armor.durability + item.value);
            repaired = true;
          }
        }
        
        if (repaired) {
          this.addMessage('修復の巻物を読んだ。装備の耐久値が回復した！');
          soundEffects.playGold();
          this.spawnParticle(player.x, player.y, '#22c55e', 15, 'REPAIR');
          this.state.inventory.splice(index, 1);
        } else {
          this.addMessage('装備の耐久値はすでに最大だ！');
          return;
        }
        break;
      }

      case 'scroll_drain': {
        const targets: Entity[] = [];
        for (const enemy of this.state.enemies) {
          if (enemy.type === 'merchant') continue;
          const tile = this.state.tiles[enemy.x]?.[enemy.y];
          if (tile && tile.visible) {
            targets.push(enemy);
          }
        }
        if (targets.length > 0) {
          const drainDmg = item.value;
          let totalDrained = 0;
          this.addMessage(`吸血の巻物を唱えた！視界の敵 ${targets.length} 体から生命力を吸い取る！`);
          soundEffects.playFireball();
          this.state.inventory.splice(index, 1);

          for (const enemy of targets) {
            const actualDamage = Math.min(enemy.hp, drainDmg);
            enemy.hp -= drainDmg;
            totalDrained += actualDamage;
            
            this.spawnParticle(enemy.x + (enemy.width || 1)/2, enemy.y + (enemy.height || 1)/2, '#f43f5e', 15, `-${drainDmg} (吸血)`);
            if (enemy.hp <= 0) {
              this.defeatEnemy(enemy);
            }
          }
          
          if (totalDrained > 0 && player.hp < player.maxHp) {
            const healAmt = Math.min(player.maxHp - player.hp, totalDrained);
            player.hp += healAmt;
            this.addMessage(`敵から HP を ${healAmt} 吸収した。`);
            this.spawnParticle(player.x, player.y, '#ec4899', 15, `+${healAmt} HP`);
            soundEffects.playHeal();
          }
        } else {
          this.addMessage('視界内に生命力を吸い取れる敵がいない！');
          return;
        }
        break;
      }
    }

    // Trigger enemy turns after using an item
    this.state.turn++;
    this.processEnemyTurns();
  }

  // Drop an item to the floor
  dropInventoryItem(index: number) {
    if (this.state.status !== 'playing') return;

    const item = this.state.inventory[index];
    if (!item) return;

    const player = this.state.player;
    // Check if player standing on something
    const standingItem = this.state.items.find(i => i.x === player.x && i.y === player.y);
    if (standingItem) {
      this.addMessage('足元が埋まっていてアイテムを置けない！');
      return;
    }

    // Place on map
    item.x = player.x;
    item.y = player.y;
    this.state.items.push(item);
    
    // Remove from inventory
    this.state.inventory.splice(index, 1);
    this.addMessage(`${item.name} を足元に置いた。`);
    soundEffects.playGold();
  }

  // Swap two inventory items for sorting
  swapInventoryItems(index1: number, index2: number) {
    if (index1 < 0 || index1 >= this.state.inventory.length) return;
    if (index2 < 0 || index2 >= this.state.inventory.length) return;
    if (index1 === index2) return;

    const temp = this.state.inventory[index1];
    this.state.inventory[index1] = this.state.inventory[index2];
    this.state.inventory[index2] = temp;
    
    soundEffects.playGold();
  }

  // Shop navigation states
  public shopActiveTab: 'buy' | 'sell' = 'buy';
  public shopSelectedIndex: number = 0;

  openShop() {
    this.state.status = 'shop';
    this.shopActiveTab = 'buy';
    this.shopSelectedIndex = 0;
    this.addMessage('「おや、旅のお人。良い品を揃えているよ。何が必要だい？」');
    window.dispatchEvent(new CustomEvent('shop-opened'));
  }

  closeShop() {
    this.state.status = 'playing';
    this.addMessage('「気をつけて行くんだよ。」');
    window.dispatchEvent(new CustomEvent('shop-closed'));
  }

  getShopItems() {
    if (this.currentShopItems) {
      return this.currentShopItems;
    }

    const level = this.state.dungeonLevel;
    
    const wIdx = Math.max(0, Math.min(level - 1, 9));
    const weaponName = weaponNames[wIdx];
    const weaponColor = weaponColors[wIdx];
    const weaponValue = Math.floor(2 + level * 1.3); // Reduced power (was 2 + level * 2.0)
    const weaponDurability = 15 + level * 2;

    const aIdx = Math.max(0, Math.min(level - 1, 9));
    const armorName = armorNames[aIdx];
    const armorColor = armorColors[aIdx];
    const armorValue = Math.floor(1 + level * 0.9); // Reduced power (was 1 + level * 1.5)
    const armorDurability = 15 + level * 2;

    const items = [
      {
        id: 'shop_potion_heal',
        name: '回復薬',
        price: 60, // Increased price
        description: 'HPを最大値の40%回復する。',
        type: 'potion_heal',
        symbol: '!',
        color: '#ef4444',
        value: 40,
        stock: 2 // Stock limit
      },
      {
        id: 'shop_potion_strength',
        name: '力増強の薬',
        price: 130, // Increased price
        description: '攻撃力を永久に 1 上昇させる。',
        type: 'potion_strength',
        symbol: '!',
        color: '#3b82f6',
        value: 1,
        stock: 1 // Stock limit
      },
      {
        id: 'shop_scroll_fireball',
        name: '火炎球の巻物',
        price: 75, // Increased price
        description: `最も近い敵に ${20 + level * 5} ダメージ。`,
        type: 'scroll_fireball',
        symbol: '?',
        color: '#f97316',
        value: 20 + level * 5,
        stock: 1
      },
      {
        id: 'shop_scroll_sleep',
        name: '眠りの巻物',
        price: 60, // Increased price
        description: '周囲の敵を数ターンの間眠らせる。',
        type: 'scroll_sleep',
        symbol: '?',
        color: '#38bdf8',
        value: 0,
        stock: 1
      },
      {
        id: 'shop_scroll_repair',
        name: '修復の巻物',
        price: 60,
        description: '装備している武器と防具の耐久値を 15 回復する。',
        type: 'scroll_repair',
        symbol: '?',
        color: '#22c55e',
        value: 15,
        stock: 1
      },
      {
        id: 'shop_scroll_drain',
        name: '吸血の巻物',
        price: 80,
        description: `視界内の敵全員から生命力を ${10 + level * 2} 吸収し回復。`,
        type: 'scroll_drain',
        symbol: '?',
        color: '#ec4899',
        value: 10 + level * 2,
        stock: 1
      },
      {
        id: 'shop_weapon',
        name: weaponName,
        price: level * 75, // Increased price (was level * 50)
        description: `攻撃力が ${weaponValue} 上がる強力な武器。(耐久: ${weaponDurability}/${weaponDurability})`,
        type: 'weapon_sword',
        symbol: '/',
        color: weaponColor,
        value: weaponValue,
        durability: weaponDurability,
        maxDurability: weaponDurability,
        stock: 1
      },
      {
        id: 'shop_armor',
        name: armorName,
        price: level * 60, // Increased price (was level * 40)
        description: `防御力が ${armorValue} 上がる強力な防具。(耐久: ${armorDurability}/${armorDurability})`,
        type: 'armor_shield',
        symbol: '[',
        color: armorColor,
        value: armorValue,
        durability: armorDurability,
        maxDurability: armorDurability,
        stock: 1
      }
    ];

    this.currentShopItems = items;
    return items;
  }

  buyItem(itemId: string): boolean {
    const shopItems = this.getShopItems();
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;

    if (item.stock <= 0) {
      this.addMessage('「おっと、そいつは売り切れだよ。」');
      return false;
    }

    if (this.state.gold < item.price) {
      this.addMessage('「おっと、ゴールドが足りないよ。」');
      return false;
    }

    if (this.state.inventory.length >= 10) {
      this.addMessage('「荷物がいっぱいだよ。整理してからおいで。」');
      return false;
    }

    this.state.gold -= item.price;
    item.stock--; // Reduce stock
    
    // Add to inventory
    const mapItem: Item = {
      id: Math.random().toString(36).substring(2, 9),
      x: 0,
      y: 0,
      type: item.type as any,
      name: item.name,
      value: item.value,
      description: item.description,
      symbol: item.symbol,
      color: item.color,
      durability: item.durability,
      maxDurability: item.maxDurability
    };
    
    this.state.inventory.push(mapItem);
    this.addMessage(`【購入】${item.name} を ${item.price} G で購入した。`);
    soundEffects.playGold();
    
    window.dispatchEvent(new CustomEvent('shop-updated'));
    return true;
  }

  getSellPrice(item: Item): number {
    switch (item.type) {
      case 'potion_heal':
        return 20;
      case 'potion_strength':
        return 40;
      case 'scroll_fireball':
        return 30;
      case 'scroll_teleport':
        return 30;
      case 'scroll_sleep':
        return 25;
      case 'scroll_thunder':
        return 35;
      case 'scroll_repair':
        return 30;
      case 'scroll_drain':
        return 40;
      case 'weapon_sword':
        return item.value * 8;
      case 'armor_shield':
        return item.value * 8;
      default:
        return 5;
    }
  }

  sellItem(index: number): boolean {
    if (this.state.status !== 'shop') return false;
    const item = this.state.inventory[index];
    if (!item) return false;

    // Check if item is equipped, if so unequip it first
    if (this.equippedWeapon?.id === item.id) {
      this.equippedWeapon = null;
      this.addMessage(`${item.name} を装備から外して売却した。`);
    } else if (this.equippedArmor?.id === item.id) {
      this.equippedArmor = null;
      this.addMessage(`${item.name} を装備から外して売却した。`);
    }

    const price = this.getSellPrice(item);
    this.state.gold += price;
    
    // Remove from inventory
    this.state.inventory.splice(index, 1);
    this.addMessage(`【売却】${item.name} を ${price} G で売却した。`);
    soundEffects.playGold();

    window.dispatchEvent(new CustomEvent('shop-updated'));
    return true;
  }

  unequipItem(type: 'weapon' | 'armor'): boolean {
    if (this.state.status !== 'playing') return false;
    const item = type === 'weapon' ? this.equippedWeapon : this.equippedArmor;
    if (!item) return false;

    if (this.state.inventory.length >= 10) {
      this.addMessage('荷物がいっぱいで装備を外せない！');
      return false;
    }

    if (type === 'weapon') {
      this.equippedWeapon = null;
    } else {
      this.equippedArmor = null;
    }

    this.state.inventory.push(item);
    this.addMessage(`${item.name} を装備から外した。`);
    soundEffects.playGold();
    return true;
  }
}

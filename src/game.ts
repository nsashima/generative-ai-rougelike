import { GameState, Entity, Item } from './types';
import { generateDungeon, computeFOV } from './dungeon';
import { soundEffects } from './sound';

const DUNGEON_WIDTH = 45;
const DUNGEON_HEIGHT = 30;

export class GameEngine {
  public state!: GameState;
  
  // Track equipped items
  public equippedWeapon: Item | null = null;
  public equippedArmor: Item | null = null;

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
      maxXp: 30,
      symbol: '@',
      color: '#38bdf8' // Sky blue
    };

    this.equippedWeapon = null;
    this.equippedArmor = null;

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

  startGame() {
    this.state.status = 'playing';
    this.loadLevel(1);
    soundEffects.playHeal(); // Start sound
  }

  loadLevel(level: number) {
    this.state.dungeonLevel = level;
    
    // Generate layout
    const dungeon = generateDungeon(level, this.state.width, this.state.height);
    this.state.tiles = dungeon.tiles;
    this.state.enemies = dungeon.enemies;
    this.state.items = dungeon.items;
    
    // Position player
    this.state.player.x = dungeon.playerStart.x;
    this.state.player.y = dungeon.playerStart.y;

    // Reset visible tiles
    computeFOV(this.state.player.x, this.state.player.y, this.state.tiles);

    this.addMessage(`地下 ${level} 階に到達した。`);
    if (level === 5) {
      this.addMessage('【警告】この階層には恐ろしい邪竜が潜んでいる！気をつけて進め！');
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
      if (player.xp >= player.maxXp) {
        this.levelUp();
      }
    }

    // Give Gold
    const goldGained = enemy.type === 'dragon' 
      ? Math.floor(150 + Math.random() * 100) 
      : Math.floor((enemy.xpValue * 0.6) + Math.random() * (enemy.xpValue * 0.4) + 1);
    
    this.state.gold += goldGained;
    this.addMessage(`${goldGained} ゴールドを獲得した。`);
    this.spawnParticle(enemy.x, enemy.y, '#eab308', 8, `+${goldGained} G`);
    soundEffects.playGold();

    // Check if the defeated enemy is the Dragon (Boss)
    if (enemy.type === 'dragon') {
      this.addMessage('邪竜アルドゥインを討伐した！伝説の秘宝を手に入れろ！');
      this.spawnParticle(enemy.x, enemy.y, '#fbbf24', 30, 'ドラゴン討伐！');
    }
  }

  levelUp() {
    const player = this.state.player;
    player.level += 1;
    if (player.xp !== undefined && player.maxXp !== undefined) {
      player.xp -= player.maxXp;
      player.maxXp = Math.floor(player.maxXp * 1.55); // slightly more XP needed
    }
    
    player.maxHp = Math.floor(player.maxHp * 1.15) + 4;
    const healAmt = Math.floor(player.maxHp * 0.40);
    player.hp = Math.min(player.maxHp, player.hp + healAmt);
    player.att += 2;
    player.def += 1;

    this.addMessage(`【レベルアップ】レベル ${player.level} に上がった！ HPが ${healAmt} 回復し、ステータスが上昇した。`);
    this.spawnParticle(player.x, player.y, '#f59e0b', 20, 'LEVEL UP!');
    soundEffects.playLevelUp();
  }

  // Enemy Turn AI
  processEnemyTurns() {
    const player = this.state.player;

    for (const enemy of this.state.enemies) {
      if (enemy.type === 'merchant') continue; // Merchants don't chase or attack!
      const dist = Math.max(Math.abs(enemy.x - player.x), Math.abs(enemy.y - player.y));
      
      // If adjacent, attack the player
      if (dist === 1) {
        this.attackPlayer(enemy);
      } 
      // If player is in range of sight, move towards player
      else if (dist <= 6) {
        const dx = Math.sign(player.x - enemy.x);
        const dy = Math.sign(player.y - enemy.y);
        
        // Try to move closer
        const targetX = enemy.x + dx;
        const targetY = enemy.y + dy;

        // Verify bounds
        if (
          targetX >= 0 && targetX < this.state.width &&
          targetY >= 0 && targetY < this.state.height
        ) {
          const tile = this.state.tiles[targetX][targetY];
          const isWall = tile.type === 'wall';
          const isEnemyOccupied = this.state.enemies.some(e => e.x === targetX && e.y === targetY);
          const isPlayerOccupied = player.x === targetX && player.y === targetY;

          if (!isWall && !isEnemyOccupied && !isPlayerOccupied) {
            enemy.x = targetX;
            enemy.y = targetY;
          } else {
            // Try horizontal only
            const targetX2 = enemy.x + dx;
            const targetY2 = enemy.y;
            const isWallX = this.state.tiles[targetX2]?.[targetY2]?.type === 'wall';
            const isEnemyOccupiedX = this.state.enemies.some(e => e.x === targetX2 && e.y === targetY2);
            if (!isWallX && !isEnemyOccupiedX && (targetX2 !== player.x || targetY2 !== player.y)) {
              enemy.x = targetX2;
            } else {
              // Try vertical only
              const targetX3 = enemy.x;
              const targetY3 = enemy.y + dy;
              const isWallY = this.state.tiles[targetX3]?.[targetY3]?.type === 'wall';
              const isEnemyOccupiedY = this.state.enemies.some(e => e.x === targetX3 && e.y === targetY3);
              if (!isWallY && !isEnemyOccupiedY && (targetX3 !== player.x || targetY3 !== player.y)) {
                enemy.y = targetY3;
              }
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
    const enemyAtTarget = this.state.enemies.find(e => e.x === targetX && e.y === targetY);
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
    computeFOV(player.x, player.y, this.state.tiles);

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
      case 'potion_heal':
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

      case 'scroll_teleport':
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
        computeFOV(player.x, player.y, this.state.tiles);
        this.spawnParticle(player.x, player.y, '#a855f7', 20, 'Teleport!');
        soundEffects.playStairs();
        this.state.inventory.splice(index, 1);
        break;

      case 'scroll_fireball':
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
    const level = this.state.dungeonLevel;
    const items = [
      {
        id: 'shop_potion_heal',
        name: '回復薬',
        price: 40,
        description: 'HPを最大値の40%回復する。',
        type: 'potion_heal',
        symbol: '!',
        color: '#ef4444',
        value: 40
      },
      {
        id: 'shop_potion_strength',
        name: '力増強の薬',
        price: 80,
        description: '攻撃力を永久に 1 上昇させる。',
        type: 'potion_strength',
        symbol: '!',
        color: '#3b82f6',
        value: 1
      },
      {
        id: 'shop_scroll_fireball',
        name: '火炎球の巻物',
        price: 60,
        description: `最も近い敵に ${20 + level * 5} ダメージ。`,
        type: 'scroll_fireball',
        symbol: '?',
        color: '#f97316',
        value: 20 + level * 5
      },
      {
        id: 'shop_weapon',
        name: level === 1 ? '錆びた剣' : level === 2 ? '鉄の剣' : level === 3 ? '鋼鉄の剣' : level === 4 ? 'ルーンブレード' : 'エクスカリバー',
        price: level * 40,
        description: `攻撃力が ${Math.floor(1 + level * 1.5)} 上がる武器。`,
        type: 'weapon_sword',
        symbol: '/',
        color: '#a8a29e',
        value: Math.floor(1 + level * 1.5)
      },
      {
        id: 'shop_armor',
        name: level === 1 ? '古びた盾' : level === 2 ? '鉄の盾' : level === 3 ? '鋼鉄の盾' : level === 4 ? '騎士の盾' : 'イージスの盾',
        price: level * 30,
        description: `防御力が ${Math.floor(1 + level * 1.0)} 上がる防具。`,
        type: 'armor_shield',
        symbol: '[',
        color: '#60a5fa',
        value: Math.floor(1 + level * 1.0)
      }
    ];
    return items;
  }

  buyItem(itemId: string): boolean {
    const shopItems = this.getShopItems();
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;

    if (this.state.gold < item.price) {
      this.addMessage('「おっと、ゴールドが足りないよ。」');
      return false;
    }

    if (this.state.inventory.length >= 10) {
      this.addMessage('「荷物がいっぱいだよ。整理してからおいで。」');
      return false;
    }

    this.state.gold -= item.price;
    
    // Add to inventory
    const mapItem = {
      id: Math.random().toString(36).substring(2, 9),
      x: 0,
      y: 0,
      type: item.type as any,
      name: item.name,
      value: item.value,
      description: item.description,
      symbol: item.symbol,
      color: item.color
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
}

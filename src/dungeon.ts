import { Tile, Entity, EntityType, Item, ItemType } from './types';

// Seeded or standard random utils
function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function generateDungeon(level: number, width: number, height: number): {
  tiles: Tile[][];
  playerStart: { x: number; y: number };
  enemies: Entity[];
  items: Item[];
} {
  // 1. Initialize grid with walls
  const tiles: Tile[][] = [];
  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      tiles[x][y] = {
        x,
        y,
        type: 'wall',
        explored: false,
        visible: false
      };
    }
  }

  const rooms: Room[] = [];
  const minRoomSize = 6;
  const maxRoomSize = 15;
  const targetRooms = randomRange(4, 6);

  // 2. Generate rooms
  for (let i = 0; i < 100; i++) {
    if (rooms.length >= targetRooms) break;

    const w = randomRange(minRoomSize, maxRoomSize);
    const h = randomRange(minRoomSize, maxRoomSize);
    const x = randomRange(1, width - w - 2);
    const y = randomRange(1, height - h - 2);

    const newRoom: Room = { x, y, w, h };

    // Check overlap
    let overlap = false;
    for (const otherRoom of rooms) {
      if (
        newRoom.x < otherRoom.x + otherRoom.w &&
        newRoom.x + newRoom.w > otherRoom.x &&
        newRoom.y < otherRoom.y + otherRoom.h &&
        newRoom.y + newRoom.h > otherRoom.y
      ) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      rooms.push(newRoom);
      // Carve room
      for (let rx = x; rx < x + w; rx++) {
        for (let ry = y; ry < y + h; ry++) {
          tiles[rx][ry].type = 'floor';
        }
      }
    }
  }

  // 3. Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const prevRoom = rooms[i - 1];
    const currRoom = rooms[i];

    const prevCenterX = Math.floor(prevRoom.x + prevRoom.w / 2);
    const prevCenterY = Math.floor(prevRoom.y + prevRoom.h / 2);
    const currCenterX = Math.floor(currRoom.x + currRoom.w / 2);
    const currCenterY = Math.floor(currRoom.y + currRoom.h / 2);

    // Random choice: Horizontal then Vertical, or Vertical then Horizontal
    if (Math.random() < 0.5) {
      carveHorizontal(tiles, prevCenterX, currCenterX, prevCenterY, level === 5 || level === 10);
      carveVertical(tiles, prevCenterY, currCenterY, currCenterX, level === 5 || level === 10);
    } else {
      carveVertical(tiles, prevCenterY, currCenterY, prevCenterX, level === 5 || level === 10);
      carveHorizontal(tiles, prevCenterX, currCenterX, currCenterY, level === 5 || level === 10);
    }
  }

  // Helper to generate unique ID
  const uuid = () => Math.random().toString(36).substring(2, 9);

  // 4. Place Player Start in the first room center
  const firstRoom = rooms[0];
  const playerStart = {
    x: Math.floor(firstRoom.x + firstRoom.w / 2),
    y: Math.floor(firstRoom.y + firstRoom.h / 2)
  };

  // 5. Place Stairs Down in the last room center (except on level 5 and final level 10)
  if (level < 10 && level !== 5) {
    const lastRoom = rooms[rooms.length - 1];
    const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
    const stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
    tiles[stairsX][stairsY].type = 'stairs';
  }

  // 6. Spawn Enemies and Items
  const enemies: Entity[] = [];
  const items: Item[] = [];

  // Determine enemy spawns by dungeon level
  const enemyTypesByLevel: { [key: number]: { type: EntityType; name: string; hp: number; att: number; def: number; xp: number; symbol: string; color: string }[] } = {
    1: [
      { type: 'slime', name: 'スライム', hp: 10, att: 4, def: 1, xp: 10, symbol: 's', color: '#22c55e' },
      { type: 'goblin', name: 'ゴブリン', hp: 15, att: 6, def: 1, xp: 18, symbol: 'g', color: '#a3e635' }
    ],
    2: [
      { type: 'slime', name: 'ポイズンスライム', hp: 16, att: 7, def: 2, xp: 15, symbol: 's', color: '#a855f7' },
      { type: 'goblin', name: 'ゴブリン戦士', hp: 22, att: 9, def: 2, xp: 25, symbol: 'g', color: '#eab308' },
      { type: 'skeleton', name: 'スケルトン', hp: 20, att: 11, def: 3, xp: 30, symbol: 't', color: '#cbd5e1' }
    ],
    3: [
      { type: 'goblin', name: 'ホブゴブリン', hp: 30, att: 14, def: 3, xp: 45, symbol: 'h', color: '#ca8a04' },
      { type: 'skeleton', name: 'スケルトン剣士', hp: 28, att: 16, def: 4, xp: 50, symbol: 'T', color: '#94a3b8' },
      { type: 'golem', name: 'ストーンゴーレム', hp: 45, att: 18, def: 6, xp: 70, symbol: 'G', color: '#78716c' }
    ],
    4: [
      { type: 'skeleton', name: 'デスナイト', hp: 45, att: 22, def: 5, xp: 90, symbol: 'K', color: '#475569' },
      { type: 'golem', name: 'アイアンゴーレム', hp: 60, att: 24, def: 8, xp: 120, symbol: 'G', color: '#4b5563' }
    ],
    5: [
      { type: 'skeleton', name: 'デスナイト', hp: 45, att: 22, def: 5, xp: 90, symbol: 'K', color: '#475569' },
      { type: 'golem', name: 'アイアンゴーレム', hp: 60, att: 24, def: 8, xp: 120, symbol: 'G', color: '#4b5563' }
    ],
    6: [
      { type: 'hellhound', name: 'ヘルハウンド', hp: 40, att: 18, def: 3, xp: 80, symbol: 'f', color: '#f97316' },
      { type: 'goblin', name: 'ゴブリンロード', hp: 50, att: 22, def: 4, xp: 100, symbol: 'L', color: '#a3e635' }
    ],
    7: [
      { type: 'hellhound', name: 'ヘルハウンド', hp: 40, att: 18, def: 3, xp: 80, symbol: 'f', color: '#f97316' },
      { type: 'skeleton', name: 'スケルトンナイト', hp: 55, att: 26, def: 5, xp: 120, symbol: 'S', color: '#cbd5e1' },
      { type: 'vampire', name: 'ヴァンパイア', hp: 60, att: 28, def: 4, xp: 150, symbol: 'v', color: '#ec4899' }
    ],
    8: [
      { type: 'vampire', name: 'ヴァンパイア', hp: 60, att: 28, def: 4, xp: 150, symbol: 'v', color: '#ec4899' },
      { type: 'demon', name: 'デーモン', hp: 70, att: 32, def: 5, xp: 200, symbol: 'd', color: '#dc2626' },
      { type: 'golem', name: 'マグマゴーレム', hp: 90, att: 30, def: 10, xp: 250, symbol: 'G', color: '#ea580c' }
    ],
    9: [
      { type: 'demon', name: 'デーモン', hp: 70, att: 32, def: 5, xp: 200, symbol: 'd', color: '#dc2626' },
      { type: 'archdemon', name: 'アークデーモン', hp: 95, att: 36, def: 7, xp: 300, symbol: 'A', color: '#b91c1c' }
    ],
    10: [
      { type: 'demon', name: 'デーモン', hp: 70, att: 32, def: 5, xp: 200, symbol: 'd', color: '#dc2626' },
      { type: 'archdemon', name: 'アークデーモン', hp: 95, att: 36, def: 7, xp: 300, symbol: 'A', color: '#b91c1c' }
    ]
  };

  // Skip first room for enemies and items
  for (let r = 1; r < rooms.length; r++) {
    const room = rooms[r];

    // Spawn enemies based on room area. (Larger rooms get more enemies)
    // Area ranges from 36 (6x6) to 225 (15x15) tiles.
    // We target roughly 1 enemy per 30 tiles, clamped between 1 and 5.
    const roomArea = room.w * room.h;
    const baseEnemies = Math.floor(roomArea / 30);
    const enemyCount = Math.max(1, Math.min(5, baseEnemies + randomRange(0, 1)));
    for (let e = 0; e < enemyCount; e++) {
      // Pick random floor tile in room
      const rx = randomRange(room.x, room.x + room.w - 1);
      const ry = randomRange(room.y, room.y + room.h - 1);

      // Check if already occupied
      const occupied = enemies.some(enemy => enemy.x === rx && enemy.y === ry);
      if (!occupied && (rx !== playerStart.x || ry !== playerStart.y)) {
        const list = enemyTypesByLevel[Math.min(level, 10)];
        const template = list[randomRange(0, list.length - 1)];

        enemies.push({
          id: uuid(),
          x: rx,
          y: ry,
          type: template.type,
          name: template.name,
          hp: template.hp,
          maxHp: template.hp,
          att: template.att,
          def: template.def,
          xpValue: template.xp,
          level: level,
          symbol: template.symbol,
          color: template.color
        });
      }
    }

    // Spawn items based on room area. (Clamp between 1 and 3 items per room)
    const baseItems = Math.floor(roomArea / 60);
    const itemCount = Math.max(1, Math.min(3, baseItems + randomRange(0, 1)));
    for (let it = 0; it < itemCount; it++) {
      const rx = randomRange(room.x, room.x + room.w - 1);
      const ry = randomRange(room.y, room.y + room.h - 1);

      const occupied = items.some(item => item.x === rx && item.y === ry);
      if (!occupied) {
        const itemTypeChance = Math.random();
        let type: ItemType = 'gold';
        let name = 'ゴールド';
        let symbol = '$';
        let color = '#fbbf24';
        let value = randomRange(4, 11) * level; // adjusted gold value to balance economy
        let description = `${value}ゴールドが入っている。`;
        let itemDurability: number | undefined = undefined;

        if (itemTypeChance < 0.25) {
          // Gold (default values already set)
        } else if (itemTypeChance < 0.50) {
          type = 'potion_heal';
          name = '回復薬';
          symbol = '!';
          color = '#ef4444';
          value = 40; // 40% healing
          description = 'HPを最大値の40%回復する。';
        } else if (itemTypeChance < 0.60) {
          type = 'potion_strength';
          name = '力増強の薬';
          symbol = '!';
          color = '#3b82f6';
          value = 1; // permanent attack boost (+1)
          description = '攻撃力を永久に 1 上昇させる。';
        } else if (itemTypeChance < 0.75) {
          type = 'weapon_sword';
          const weaponNames = [
            '錆びた剣',          // level 1
            '鉄の剣',            // level 2
            '鋼鉄の剣',          // level 3
            'ルーンブレード',    // level 4
            'エクスカリバー',    // level 5
            '魔導の杖',          // level 6
            '竜殺しの大剣',      // level 7
            '魔剣レーヴァテイン',// level 8
            '光の聖剣アルテマ',  // level 9
            '創世神の剣'         // level 10
          ];
          const weaponColors = [
            '#a8a29e', // rust grey
            '#cbd5e1', // steel
            '#94a3b8', // blue steel
            '#60a5fa', // blue runic
            '#a855f7', // purple legendary
            '#34d399', // emerald green staff
            '#f43f5e', // crimson dragon slayer
            '#fb923c', // fiery orange sword
            '#facc15', // gold ultimate
            '#ec4899'  // pink divine
          ];
          const idx = Math.max(0, Math.min(level - 1, 9));
          name = weaponNames[idx];
          color = weaponColors[idx];
          symbol = '/';
          value = Math.floor(2 + level * 1.3); // reduced weapon power (was 2 + level * 2.0)
          itemDurability = randomRange(12, 20) + level * 2;
          description = `攻撃力が ${value} 上がる武器。`;
        } else if (itemTypeChance < 0.88) {
          type = 'armor_shield';
          const armorNames = [
            '古びた盾',          // level 1
            '鉄の盾',            // level 2
            '鋼鉄の盾',          // level 3
            '騎士の盾',          // level 4
            'イージスの盾',      // level 5
            '紅蓮の鎧',          // level 6
            '影の防具',          // level 7
            '魔王の盾',          // level 8
            '光の盾ソール',      // level 9
            '神の鎧ゴッドアーマー' // level 10
          ];
          const armorColors = [
            '#78716c', // rusty stone
            '#94a3b8', // steel
            '#64748b', // heavy metal
            '#3b82f6', // knight blue
            '#a855f7', // legendary purple
            '#ef4444', // crimson red
            '#312e81', // dark navy shadow
            '#581c87', // demon purple
            '#f59e0b', // gold sun shield
            '#ec4899'  // pink god armor
          ];
          const idx = Math.max(0, Math.min(level - 1, 9));
          name = armorNames[idx];
          color = armorColors[idx];
          symbol = '[';
          value = Math.floor(1 + level * 0.9); // reduced armor power (was 1 + level * 1.5)
          itemDurability = randomRange(12, 20) + level * 2;
          description = `防御力が ${value} 上がる防具。`;
        } else {
          // scrolls
          const scrollChance = Math.random();
          if (scrollChance < 0.17) {
            type = 'scroll_teleport';
            name = '瞬間移動の巻物';
            symbol = '?';
            color = '#a855f7';
            value = 0;
            description = 'ダンジョン内のランダムな位置にテレポートする。';
          } else if (scrollChance < 0.34) {
            type = 'scroll_fireball';
            name = '火炎球の巻物';
            symbol = '?';
            color = '#f97316';
            value = 20 + level * 5;
            description = `視界内の最も近い敵に${value}の火炎ダメージを与える。`;
          } else if (scrollChance < 0.50) {
            type = 'scroll_sleep';
            name = '眠りの巻物';
            symbol = '?';
            color = '#38bdf8';
            value = 0;
            description = '部屋や通路にいる周囲の敵を眠らせて数ターンの間行動不能にする。';
          } else if (scrollChance < 0.67) {
            type = 'scroll_thunder';
            name = '雷光の巻物';
            symbol = '?';
            color = '#eab308';
            value = 15 + level * 3;
            description = `視界内のすべての敵に${value}の雷ダメージを与える。`;
          } else if (scrollChance < 0.84) {
            type = 'scroll_repair';
            name = '修復の巻物';
            symbol = '?';
            color = '#22c55e';
            value = 15; // amount to repair
            description = '装備している武器と防具の耐久値を 15 回復する。';
          } else {
            type = 'scroll_drain';
            name = '吸血の巻物';
            symbol = '?';
            color = '#ec4899';
            value = 10 + level * 2; // drain damage
            description = `視界内のすべての敵からHPを${value}吸収し、自身のHPを回復する。`;
          }
        }

        items.push({
          id: uuid(),
          x: rx,
          y: ry,
          type,
          name,
          value,
          description,
          symbol,
          color,
          durability: itemDurability,
          maxDurability: itemDurability
        });
      }
    }
  }

  // 6.5 Spawn Merchant (levels 2 and deeper)
  if (level >= 2 && rooms.length > 2) {
    const merchantRoom = rooms[Math.floor(rooms.length / 2)];
    const merchantX = Math.floor(merchantRoom.x + merchantRoom.w / 2);
    const merchantY = Math.floor(merchantRoom.y + merchantRoom.h / 2);

    // Remove any items and normal enemies at that spot
    const cleanIndexE = enemies.findIndex(e => e.x === merchantX && e.y === merchantY);
    if (cleanIndexE !== -1) enemies.splice(cleanIndexE, 1);
    const cleanIndexI = items.findIndex(i => i.x === merchantX && i.y === merchantY);
    if (cleanIndexI !== -1) items.splice(cleanIndexI, 1);

    enemies.push({
      id: uuid(),
      x: merchantX,
      y: merchantY,
      type: 'merchant',
      name: '旅の商人',
      hp: 999,
      maxHp: 999,
      att: 0,
      def: 999,
      xpValue: 0,
      level,
      symbol: 'M',
      color: '#f472b6' // pink color
    });
  }

  // 7. LEVEL 5 BOSS: Goblin King
  if (level === 5) {
    const lastRoom = rooms[rooms.length - 1];
    const bossX = Math.floor(lastRoom.x + lastRoom.w / 2);
    const bossY = Math.floor(lastRoom.y + lastRoom.h / 2);

    const cleanIndexE = enemies.findIndex(e => e.x === bossX && e.y === bossY);
    if (cleanIndexE !== -1) enemies.splice(cleanIndexE, 1);
    const cleanIndexI = items.findIndex(i => i.x === bossX && i.y === bossY);
    if (cleanIndexI !== -1) items.splice(cleanIndexI, 1);

    enemies.push({
      id: uuid(),
      x: bossX,
      y: bossY,
      type: 'dragon',
      name: 'ゴブリンキング',
      hp: 160,
      maxHp: 160,
      att: 32,
      def: 10,
      xpValue: 500,
      level: 5,
      symbol: 'D',
      color: '#dc2626',
      width: 2,
      height: 2
    });

    if (Math.random() < 0.5) {
      items.push({
        id: uuid(),
        x: bossX,
        y: Math.max(1, bossY - 1),
        type: 'armor_shield',
        name: 'キングの盾 (King\'s Shield)',
        symbol: '[',
        color: '#fbbf24',
        value: 8,
        description: 'ゴブリンキングが守っていた、比類なき堅牢さを誇る金色の盾。',
        durability: 45,
        maxDurability: 45
      });
    }
  }

  // 8. LEVEL 10 FINAL BOSS: Demon King Sashima
  if (level === 10) {
    const lastRoom = rooms[rooms.length - 1];
    const bossX = Math.floor(lastRoom.x + lastRoom.w / 2);
    const bossY = Math.floor(lastRoom.y + lastRoom.h / 2);

    const cleanIndexE = enemies.findIndex(e => e.x === bossX && e.y === bossY);
    if (cleanIndexE !== -1) enemies.splice(cleanIndexE, 1);
    const cleanIndexI = items.findIndex(i => i.x === bossX && i.y === bossY);
    if (cleanIndexI !== -1) items.splice(cleanIndexI, 1);

    enemies.push({
      id: uuid(),
      x: bossX,
      y: bossY,
      type: 'demon_king',
      name: '邪教の心眼',
      hp: 350,
      maxHp: 350,
      att: 55,
      def: 18,
      xpValue: 1500,
      level: 10,
      symbol: 'E',
      color: '#f43f5e',
      width: 2,
      height: 2
    });

    items.push({
      id: uuid(),
      x: bossX,
      y: Math.max(1, bossY - 1),
      type: 'gold', // winning relic
      name: '生成AIの秘宝 (Amulet of Generative AI)',
      symbol: '*',
      color: '#ec4899',
      value: 9999,
      description: 'このダンジョンの最深部に眠る究極のアーティファクト。手に入れると勝利する。'
    });
  }

  // Guarantee at least one gold pile on each floor
  const hasGold = items.some(item => item.type === 'gold');
  if (!hasGold && rooms.length > 0) {
    let placed = false;
    for (let r = 0; r < rooms.length; r++) {
      const room = rooms[r];
      const gx = Math.floor(room.x + room.w / 2);
      const gy = Math.floor(room.y + room.h / 2);
      
      const occupiedByEnemy = enemies.some(e => e.x === gx && e.y === gy);
      const occupiedByItem = items.some(i => i.x === gx && i.y === gy);
      const isPlayerStart = gx === playerStart.x && gy === playerStart.y;
      
      if (!occupiedByEnemy && !occupiedByItem && !isPlayerStart && tiles[gx]?.[gy]?.type === 'floor') {
        const val = randomRange(5, 12) * level;
        items.push({
          id: uuid(),
          x: gx,
          y: gy,
          type: 'gold',
          name: 'ゴールド',
          symbol: '$',
          color: '#fbbf24',
          value: val,
          description: `${val}ゴールドが入っている。`
        });
        placed = true;
        break;
      }
    }
    // Fallback if center tile is blocked
    if (!placed) {
      for (const room of rooms) {
        for (let rx = room.x; rx < room.x + room.w; rx++) {
          for (let ry = room.y; ry < room.y + room.h; ry++) {
            const occupied = items.some(i => i.x === rx && i.y === ry) || enemies.some(e => e.x === rx && e.y === ry) || (rx === playerStart.x && ry === playerStart.y);
            if (!occupied && tiles[rx]?.[ry]?.type === 'floor') {
              const val = randomRange(5, 12) * level;
              items.push({
                id: uuid(),
                x: rx,
                y: ry,
                type: 'gold',
                name: 'ゴールド',
                symbol: '$',
                color: '#fbbf24',
                value: val,
                description: `${val}ゴールドが入っている。`
              });
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
    }
  }

  // Rare monster spawn (5% Golden Slime, 5% Silver Slime, max 1 per floor)
  const rareRoll = Math.random();
  if (rareRoll < 0.10) {
    const isGold = rareRoll < 0.05;
    const rareType: EntityType = isGold ? 'golden_slime' : 'silver_slime';
    const rareName = isGold ? 'ゴールデンスライム' : 'シルバースライム';
    const rareColor = isGold ? '#facc15' : '#cbd5e1'; // Gold and Silver/Slate colors
    
    // Stats: Low HP and Attack so they are easy to defeat bonus targets.
    // Golden Slime has low defense, Silver Slime has slightly higher defense but very low HP.
    const rareHp = isGold ? (6 + level * 2) : (4 + level * 1);
    const rareAtt = 1 + Math.floor(level * 0.5);
    const rareDef = isGold ? (1 + Math.floor(level * 0.5)) : (2 + level * 1);
    const rareXp = isGold ? (15 + level * 5) : (100 + level * 50); // Keep the high XP reward

    // Find a free spot on floor
    const floorTiles: { x: number; y: number }[] = [];
    const mapWidth = tiles.length;
    const mapHeight = tiles[0].length;
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        if (tiles[x][y].type === 'floor') {
          const isPlayerStart = x === playerStart.x && y === playerStart.y;
          const hasEnemy = enemies.some(e => e.x === x && e.y === y);
          const hasItem = items.some(i => i.x === x && i.y === y);
          if (!isPlayerStart && !hasEnemy && !hasItem) {
            floorTiles.push({ x, y });
          }
        }
      }
    }
    
    if (floorTiles.length > 0) {
      const spot = floorTiles[randomRange(0, floorTiles.length - 1)];
      enemies.push({
        id: uuid(),
        x: spot.x,
        y: spot.y,
        type: rareType,
        name: rareName,
        hp: rareHp,
        maxHp: rareHp,
        att: rareAtt,
        def: rareDef,
        xpValue: rareXp,
        level,
        symbol: 's',
        color: rareColor
      });
    }
  }

  return {
    tiles,
    playerStart,
    enemies,
    items
  };
}

function carveHorizontal(tiles: Tile[][], x1: number, x2: number, y: number, width2x2: boolean = false) {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  const height = tiles[0].length;
  for (let x = start; x <= end; x++) {
    tiles[x][y].type = 'floor';
    if (width2x2) {
      if (y + 1 < height) tiles[x][y + 1].type = 'floor';
      if (y - 1 >= 0) tiles[x][y - 1].type = 'floor';
    }
  }
}

function carveVertical(tiles: Tile[][], y1: number, y2: number, x: number, width2x2: boolean = false) {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  const width = tiles.length;
  for (let y = start; y <= end; y++) {
    tiles[x][y].type = 'floor';
    if (width2x2) {
      if (x + 1 < width) tiles[x + 1][y].type = 'floor';
      if (x - 1 >= 0) tiles[x - 1][y].type = 'floor';
    }
  }
}

// Simple Shadowcasting or Raycasting Field of View (FOV)
// To keep it high-performance and lightweight, we can implement recursive shadowcasting or a simple raycasting algorithm
export function computeFOV(playerX: number, playerY: number, tiles: Tile[][], range: number = 6) {
  const width = tiles.length;
  const height = tiles[0].length;

  // Reset visibility
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      tiles[x][y].visible = false;
    }
  }

  // Player position is always visible and explored
  tiles[playerX][playerY].visible = true;
  tiles[playerX][playerY].explored = true;

  // Cast rays in all directions
  const numRays = 72; // 360 degrees / 5
  for (let i = 0; i < numRays; i++) {
    const angle = (i * 2 * Math.PI) / numRays;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    let cx = playerX + 0.5;
    let cy = playerY + 0.5;

    for (let r = 0; r < range; r++) {
      cx += dx;
      cy += dy;

      const tx = Math.floor(cx);
      const ty = Math.floor(cy);

      if (tx < 0 || tx >= width || ty < 0 || ty >= height) {
        break;
      }

      tiles[tx][ty].visible = true;
      tiles[tx][ty].explored = true;

      // Wall blocks light
      if (tiles[tx][ty].type === 'wall') {
        break;
      }
    }
  }
}

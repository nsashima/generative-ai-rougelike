export type TileType = 'wall' | 'floor' | 'stairs';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  explored: boolean;
  visible: boolean;
}

export type ItemType = 
  | 'potion_heal' 
  | 'potion_strength' 
  | 'weapon_sword' 
  | 'armor_shield' 
  | 'ring_attack'
  | 'ring_defense'
  | 'ring_durability'
  | 'ring_reflect'
  | 'ring_heal'
  | 'scroll_teleport' 
  | 'scroll_fireball' 
  | 'scroll_sleep'
  | 'scroll_thunder'
  | 'scroll_repair'
  | 'scroll_drain'
  | 'gold';

export interface Item {
  id: string;
  x: number;
  y: number;
  type: ItemType;
  name: string;
  value: number;
  description: string;
  symbol: string;
  color: string;
  durability?: number;
  maxDurability?: number;
}

export type JobType = 'warrior' | 'guardian' | 'ninja';

export type EntityType = 'player' | 'slime' | 'golden_slime' | 'silver_slime' | 'goblin' | 'hobgoblin' | 'goblin_warrior' | 'goblin_lord' | 'skeleton' | 'skeleton_warrior' | 'death_knight' | 'frost_skeleton' | 'golem' | 'dragon' | 'merchant' | 'hellhound' | 'vampire' | 'demon' | 'archdemon' | 'demon_king' | 'yeti' | 'void_specter' | 'crystal_golem' | 'abyss_lord';

export interface Entity {
  id: string;
  x: number;
  y: number;
  type: EntityType;
  name: string;
  hp: number;
  maxHp: number;
  att: number;
  def: number;
  xpValue: number; // XP given to player when killed
  level: number;
  xp?: number; // Player only
  maxXp?: number; // Player only
  symbol: string;
  color: string;
  width?: number;
  height?: number;
  stunTurns?: number;
  job?: JobType;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string; // Floating text (e.g., damage numbers)
}

export type GameStatus = 'start' | 'playing' | 'gameover' | 'victory' | 'shop';

export interface GameState {
  dungeonLevel: number;
  tiles: Tile[][];
  width: number;
  height: number;
  player: Entity;
  enemies: Entity[];
  items: Item[];
  messages: string[];
  status: GameStatus;
  particles: Particle[];
  inventory: Item[];
  gold: number;
  turn: number;
}

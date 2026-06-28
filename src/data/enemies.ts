import { EntityType } from '../types';

export interface EnemyTemplate {
  type: EntityType;
  name: string;
  hp: number;
  att: number;
  def: number;
  xp: number;
  symbol: string;
  color: string;
}

export const enemyTypesByLevel: { [key: number]: EnemyTemplate[] } = {
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

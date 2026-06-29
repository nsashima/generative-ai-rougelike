import { EntityType } from '../types';

/**
 * 敵キャラクターを生成するための基本テンプレート定義
 */
export interface EnemyTemplate {
  /** 敵のキャラクタータイプ */
  type: EntityType;
  /** 敵の名前 */
  name: string;
  /** 基礎HP（出現時の最大HP） */
  hp: number;
  /** 基礎攻撃力 */
  att: number;
  /** 基礎防御力 */
  def: number;
  /** 討伐時に獲得できる基礎XP */
  xp: number;
  /** 画面上の文字記号（例: 's' はスライム、'g' はゴブリン） */
  symbol: string;
  /** 描画色（カラーコード） */
  color: string;
}

/**
 * ダンジョンの各階層ごとに出現する敵のテンプレート配列マップ
 * - キー（1〜20）がダンジョンのフロアレベルを表します。
 * - 敵はこのリストからランダムで抽選され、登場階層からの差分に応じて自動強化（スケーリング）されます。
 */
export const enemyTypesByLevel: { [key: number]: EnemyTemplate[] } = {
  // --- 通常洞窟エリア (1F 〜 5F) ---
  1: [
    { type: 'slime', name: 'スライム', hp: 10, att: 4, def: 1, xp: 10, symbol: 's', color: '#22c55e' },
    { type: 'goblin', name: 'ゴブリン', hp: 15, att: 6, def: 1, xp: 18, symbol: 'g', color: '#84cc16' }
  ],
  2: [
    { type: 'slime', name: 'ポイズンスライム', hp: 16, att: 7, def: 2, xp: 15, symbol: 's', color: '#fb923c' },
    { type: 'goblin_warrior', name: 'ゴブリン戦士', hp: 22, att: 9, def: 2, xp: 25, symbol: 'g', color: '#16a34a' },
    { type: 'skeleton', name: 'スケルトン', hp: 20, att: 11, def: 3, xp: 30, symbol: 't', color: '#cbd5e1' }
  ],
  3: [
    { type: 'hobgoblin', name: 'ホブゴブリン', hp: 30, att: 14, def: 3, xp: 45, symbol: 'h', color: '#047857' },
    { type: 'skeleton_warrior', name: 'スケルトン剣士', hp: 28, att: 16, def: 4, xp: 50, symbol: 'T', color: '#cbd5e1' },
    { type: 'golem', name: 'ストーンゴーレム', hp: 45, att: 18, def: 6, xp: 70, symbol: 'G', color: '#78716c' }
  ],
  4: [
    { type: 'death_knight', name: 'デスナイト', hp: 45, att: 22, def: 5, xp: 90, symbol: 'K', color: '#475569' },
    { type: 'golem', name: 'アイアンゴーレム', hp: 60, att: 24, def: 8, xp: 120, symbol: 'G', color: '#4b5563' }
  ],
  5: [
    // 5Fのボスフロアのモブ抽選用
    { type: 'death_knight', name: 'デスナイト', hp: 45, att: 22, def: 5, xp: 90, symbol: 'K', color: '#475569' },
    { type: 'golem', name: 'アイアンゴーレム', hp: 60, att: 24, def: 8, xp: 120, symbol: 'G', color: '#4b5563' }
  ],

  // --- 溶岩・魔界エリア (6F 〜 10F) ---
  6: [
    { type: 'hellhound', name: 'ヘルハウンド', hp: 40, att: 18, def: 3, xp: 80, symbol: 'f', color: '#f97316' },
    { type: 'goblin_lord', name: 'ゴブリンロード', hp: 50, att: 22, def: 4, xp: 100, symbol: 'L', color: '#0f766e' }
  ],
  7: [
    { type: 'hellhound', name: 'ヘルハウンド', hp: 40, att: 18, def: 3, xp: 80, symbol: 'f', color: '#f97316' },
    { type: 'skeleton_warrior', name: 'スケルトンナイト', hp: 55, att: 26, def: 5, xp: 120, symbol: 'S', color: '#cbd5e1' },
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
    // 10Fのボスフロアのモブ抽選用
    { type: 'demon', name: 'デーモン', hp: 70, att: 32, def: 5, xp: 200, symbol: 'd', color: '#dc2626' },
    { type: 'archdemon', name: 'アークデーモン', hp: 95, att: 36, def: 7, xp: 300, symbol: 'A', color: '#b91c1c' }
  ],

  // --- 氷結・氷室エリア (11F 〜 15F) ---
  11: [
    { type: 'slime', name: 'アイススライム', hp: 90, att: 30, def: 5, xp: 250, symbol: 's', color: '#67e8f9' },
    { type: 'frost_skeleton', name: 'フロストスケルトン', hp: 100, att: 36, def: 6, xp: 300, symbol: 't', color: '#93c5fd' }
  ],
  12: [
    { type: 'slime', name: 'アイススライム', hp: 90, att: 30, def: 5, xp: 250, symbol: 's', color: '#67e8f9' },
    { type: 'yeti', name: 'イエティ', hp: 120, att: 42, def: 8, xp: 400, symbol: 'Y', color: '#f1f5f9' }
  ],
  13: [
    { type: 'frost_skeleton', name: 'フロストスケルトン', hp: 100, att: 36, def: 6, xp: 300, symbol: 't', color: '#93c5fd' },
    { type: 'yeti', name: 'イエティ', hp: 120, att: 42, def: 8, xp: 400, symbol: 'Y', color: '#f1f5f9' }
  ],
  14: [
    { type: 'yeti', name: 'イエティ', hp: 120, att: 42, def: 8, xp: 400, symbol: 'Y', color: '#f1f5f9' },
    { type: 'hellhound', name: 'フロストハウンド', hp: 110, att: 45, def: 6, xp: 450, symbol: 'f', color: '#38bdf8' }
  ],
  15: [
    // 15Fのボスフロアのモブ抽選用
    { type: 'yeti', name: 'イエティ', hp: 120, att: 42, def: 8, xp: 400, symbol: 'Y', color: '#f1f5f9' },
    { type: 'hellhound', name: 'フロストハウンド', hp: 110, att: 45, def: 6, xp: 450, symbol: 'f', color: '#38bdf8' }
  ],

  // --- 宇宙・虚無エリア (16F 〜 20F) ---
  16: [
    { type: 'slime', name: 'ヴォイドスライム', hp: 140, att: 48, def: 8, xp: 500, symbol: 's', color: '#c084fc' },
    { type: 'hellhound', name: 'ネビュラハウンド', hp: 150, att: 55, def: 8, xp: 600, symbol: 'f', color: '#4c1d95' }
  ],
  17: [
    { type: 'void_specter', name: 'ヴォイドスペクター', hp: 160, att: 62, def: 10, xp: 700, symbol: 'V', color: '#1e1b4b' },
    { type: 'hellhound', name: 'ネビュラハウンド', hp: 150, att: 55, def: 8, xp: 600, symbol: 'f', color: '#4c1d95' }
  ],
  18: [
    { type: 'void_specter', name: 'ヴォイドスペクター', hp: 160, att: 62, def: 10, xp: 700, symbol: 'V', color: '#1e1b4b' },
    { type: 'demon', name: 'ヴォイドデーモン', hp: 180, att: 70, def: 12, xp: 900, symbol: 'd', color: '#7e22ce' }
  ],
  19: [
    { type: 'void_specter', name: 'ヴォイドスペクター', hp: 160, att: 62, def: 10, xp: 700, symbol: 'V', color: '#1e1b4b' },
    { type: 'demon', name: 'ヴォイドデーモン', hp: 180, att: 70, def: 12, xp: 900, symbol: 'd', color: '#7e22ce' },
    { type: 'archdemon', name: 'アビスデーモン', hp: 220, att: 78, def: 14, xp: 1200, symbol: 'A', color: '#4a044e' }
  ],
  20: [
    // 20Fのボスフロアのモブ抽選用
    { type: 'void_specter', name: 'ヴォイドスペクター', hp: 160, att: 62, def: 10, xp: 700, symbol: 'V', color: '#1e1b4b' },
    { type: 'archdemon', name: 'アビスデーモン', hp: 220, att: 78, def: 14, xp: 1200, symbol: 'A', color: '#4a044e' }
  ]
};

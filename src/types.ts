/**
 * マップ上のタイル（マス目）の種類を表す型
 * - 'wall': 移動・視界を遮る壁
 * - 'floor': 移動可能な床
 * - 'stairs': 次の階層へ進むための下り階段
 */
export type TileType = 'wall' | 'floor' | 'stairs';

/**
 * ダンジョンマップ上の1マス（タイル）の情報を保持するインターフェース
 */
export interface Tile {
  /** X座標（グリッド座標） */
  x: number;
  /** Y座標（グリッド座標） */
  y: number;
  /** タイルの種類（壁、床、階段） */
  type: TileType;
  /** プレイヤーがこれまでに探索（視界に入れた）したことがあるか */
  explored: boolean;
  /** 現在プレイヤーの視界内に入っているか */
  visible: boolean;
}

/**
 * ゲーム内に存在するアイテムの種類を表す型
 */
export type ItemType = 
  | 'potion_heal'        // 回復薬（割合回復）
  | 'potion_strength'    // 力増強の薬（攻撃力永続アップ）
  | 'weapon_sword'       // 武器（剣）
  | 'armor_shield'       // 防具（盾）
  | 'ring_attack'        // 力の指輪 / 心眼の指輪（攻撃力アップ）
  | 'ring_defense'       // 守りの指輪（防御力アップ）
  | 'ring_durability'    // 節約の指輪（耐久消費無効）
  | 'ring_reflect'       // 反撃の指輪（ダメージ反射）
  | 'ring_heal'          // 癒やしの指輪（自動回復）
  | 'scroll_teleport'    // テレポートの巻物
  | 'scroll_fireball'    // 火炎の巻物（最寄りの敵に大ダメージ）
  | 'scroll_sleep'       // 眠りの巻物（周囲の敵を眠らせる）
  | 'scroll_thunder'     // 雷光の巻物（画面内の敵全員にダメージ）
  | 'scroll_repair'      // 修復の巻物（装備の耐久値を回復）
  | 'scroll_drain'       // 吸血の巻物（周囲の敵からHP吸収）
  | 'gold';              // ゴールド（またはゲームクリア用の生成AIの秘宝）

/**
 * ゲーム内のアイテム（武器、防具、消費アイテムなど）を表すインターフェース
 */
export interface Item {
  /** ユニークID */
  id: string;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** アイテムの種類 */
  type: ItemType;
  /** アイテムの名前（装備レベルに応じて動的に決まる） */
  name: string;
  /** 効果量（攻撃力補正、防御力補正、回復パーセンテージ、または販売・売却価格の基礎値） */
  value: number;
  /** アイテムの説明文 */
  description: string;
  /** 画面上に表示する文字記号（例: '/' は武器、'[' は防具、'o' は指輪、'!' は薬） */
  symbol: string;
  /** 画面上の文字描画色（カラーコード） */
  color: string;
  /** 武器・防具の現在の耐久値（消費アイテム等の場合は undefined） */
  durability?: number;
  /** 武器・防具の最大耐久値 */
  maxDurability?: number;
  /** ショップで販売される際の在庫数 */
  stock?: number;
  /** ショップで販売される際の購入価格 */
  price?: number;
}

/**
 * プレイヤーが選択できる職業（ジョブ）の種類を表す型
 */
export type JobType = 'warrior' | 'guardian' | 'ninja';

/**
 * ゲーム内に存在するキャラクター（プレイヤー、敵、NPC商人）の種類を表す型
 */
export type EntityType = 
  | 'player' 
  | 'slime' | 'golden_slime' | 'silver_slime' // スライム系
  | 'goblin' | 'hobgoblin' | 'goblin_warrior' | 'goblin_lord' // ゴブリン系
  | 'skeleton' | 'skeleton_warrior' | 'death_knight' | 'frost_skeleton' // スケルトン系
  | 'golem' | 'dragon' | 'merchant' // 中堅モブ・ドラゴン・NPC商人
  | 'hellhound' | 'vampire' | 'demon' | 'archdemon' | 'demon_king' // 悪魔・吸血鬼・ハウンド・ボス等
  | 'yeti' | 'void_specter' | 'crystal_golem' | 'abyss_lord'; // 11F以降の新モンスター・新ボス

/**
 * キャラクター（プレイヤー、敵、NPC）のデータを表すインターフェース
 */
export interface Entity {
  /** ユニークID */
  id: string;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** キャラクターの種類 */
  type: EntityType;
  /** キャラクターの名前 */
  name: string;
  /** 現在のHP */
  hp: number;
  /** 最大HP */
  maxHp: number;
  /** 攻撃力 */
  att: number;
  /** 防御力 */
  def: number;
  /** 敵を倒した時にプレイヤーが獲得する経験値（プレイヤー自身の場合は0） */
  xpValue: number;
  /** キャラクターの現在のレベル（出現階層または敵の強さスケール基準） */
  level: number;
  /** 現在の経験値（プレイヤー専用） */
  xp?: number;
  /** 次のレベルまでに必要な経験値（プレイヤー専用） */
  maxXp?: number;
  /** 画面上の文字記号（例: '@' はプレイヤー、'D' はドラゴン等） */
  symbol: string;
  /** 画面上の文字描画色 */
  color: string;
  /** ボスなどの巨大キャラクターを描画する際の横幅（マス数） */
  width?: number;
  /** ボスなどの巨大キャラクターを描画する際の縦幅（マス数） */
  height?: number;
  /** 眠り状態などによる行動不能残りターン数 */
  stunTurns?: number;
  /** プレイヤーの選択した職業 */
  job?: JobType;
}

/**
 * ダメージ数値やエフェクトなどを画面上に散らすパーティクルの構造体
 */
export interface Particle {
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** X軸方向の移動速度 */
  vx: number;
  /** Y軸方向の移動速度 */
  vy: number;
  /** 現在の寿命（残りフレーム数） */
  life: number;
  /** 最大寿命 */
  maxLife: number;
  /** 描画色 */
  color: string;
  /** 描画サイズ */
  size: number;
  /** 画面上に浮かび上がるテキスト（例: ダメージ数値、回復値） */
  text?: string;
}

/**
 * ゲームの全体的なステータス（ゲーム進行画面の切り替え）を表す型
 * - 'start': タイトル/キャラ選択画面
 * - 'playing': ダンジョン探索中
 * - 'gameover': 死亡画面
 * - 'victory': ゲームクリア画面
 * - 'shop': 商人との取引（売買）画面
 */
export type GameStatus = 'start' | 'playing' | 'gameover' | 'victory' | 'shop';

/**
 * ゲーム全体の動的状態を保持するインターフェース
 */
export interface GameState {
  /** 現在到達しているダンジョンの階層（地下1〜20階） */
  dungeonLevel: number;
  /** マップ上のタイル全データ（2次元配列 [x][y]） */
  tiles: Tile[][];
  /** マップの横幅（マス数） */
  width: number;
  /** マップの縦幅（マス数） */
  height: number;
  /** プレイヤーのキャラクターデータ */
  player: Entity;
  /** 現在マップ上に存在する全モンスターの配列 */
  enemies: Entity[];
  /** 現在マップ上に落ちている全アイテムの配列 */
  items: Item[];
  /** 画面下部のゲームログに表示するメッセージの履歴配列 */
  messages: string[];
  /** ゲームの現在の状態（進行状況） */
  status: GameStatus;
  /** 画面上で描画中の全アクティブパーティクルの配列 */
  particles: Particle[];
  /** プレイヤーが所持しているバッグ（インベントリ）内のアイテムリスト */
  inventory: Item[];
  /** プレイヤーの所持ゴールド */
  gold: number;
  /** 経過ターン数 */
  turn: number;
}

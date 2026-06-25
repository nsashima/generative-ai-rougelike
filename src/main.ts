import { GameEngine } from './game';
import { DungeonRenderer } from './renderer';
import { soundEffects } from './sound';

// DOM elements
let canvas: HTMLCanvasElement;
let engine: GameEngine;
let renderer: DungeonRenderer;

// Top bar controls
let soundToggleBtn: HTMLButtonElement;
let restartBtn: HTMLButtonElement;

// Stats elements
let statFloor: HTMLElement;
let statGold: HTMLElement;
let statTurn: HTMLElement;
let statLevel: HTMLElement;
let hpValue: HTMLElement;
let hpBarFill: HTMLElement;
let xpValue: HTMLElement;
let xpBarFill: HTMLElement;
let statAtt: HTMLElement;
let statDef: HTMLElement;

// Equipment elements
let equipWeapon: HTMLElement;
let equipArmor: HTMLElement;

// Inventory elements
let inventoryCount: HTMLElement;
let inventoryList: HTMLElement;

// Log elements
let logFeed: HTMLElement;

// Overlay elements
let startOverlay: HTMLElement;
let startGameBtn: HTMLButtonElement;
let gameoverOverlay: HTMLElement;
let goLevel: HTMLElement;
let goFloor: HTMLElement;
let goTurn: HTMLElement;
let goGold: HTMLElement;
let goScore: HTMLElement;
let goRestartBtn: HTMLButtonElement;
let victoryOverlay: HTMLElement;
let vicLevel: HTMLElement;
let vicGold: HTMLElement;
let vicTurn: HTMLElement;
let vicScore: HTMLElement;
let vicRestartBtn: HTMLButtonElement;

// Shop elements
let shopModal: HTMLElement;
let closeShopBtn: HTMLButtonElement;
let shopGoldVal: HTMLElement;
let shopItemList: HTMLElement;
let shopSellList: HTMLElement;

// Mobile pad controls
let ctrlUp: HTMLButtonElement;
let ctrlDown: HTMLButtonElement;
let ctrlLeft: HTMLButtonElement;
let ctrlRight: HTMLButtonElement;
let ctrlDescend: HTMLButtonElement;

window.addEventListener('DOMContentLoaded', () => {
  // Initialize variables
  canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  engine = new GameEngine();
  renderer = new DungeonRenderer(canvas, engine);

  soundToggleBtn = document.getElementById('sound-toggle-btn') as HTMLButtonElement;
  restartBtn = document.getElementById('restart-btn') as HTMLButtonElement;

  statFloor = document.getElementById('stat-floor')!;
  statGold = document.getElementById('stat-gold')!;
  statTurn = document.getElementById('stat-turn')!;
  statLevel = document.getElementById('stat-level')!;
  hpValue = document.getElementById('hp-value')!;
  hpBarFill = document.getElementById('hp-bar-fill')!;
  xpValue = document.getElementById('xp-value')!;
  xpBarFill = document.getElementById('xp-bar-fill')!;
  statAtt = document.getElementById('stat-att')!;
  statDef = document.getElementById('stat-def')!;

  equipWeapon = document.getElementById('equip-weapon')!;
  equipArmor = document.getElementById('equip-armor')!;

  inventoryCount = document.getElementById('inventory-count')!;
  inventoryList = document.getElementById('inventory-list')!;

  logFeed = document.getElementById('log-feed')!;

  shopModal = document.getElementById('shop-modal')!;
  closeShopBtn = document.getElementById('close-shop-btn') as HTMLButtonElement;
  shopGoldVal = document.getElementById('shop-gold-val')!;
  shopItemList = document.getElementById('shop-item-list')!;
  shopSellList = document.getElementById('shop-sell-list')!;

  // Start overlay elements
  startOverlay = document.getElementById('start-overlay')!;
  startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;

  // Gameover overlay elements
  gameoverOverlay = document.getElementById('gameover-overlay')!;
  goLevel = document.getElementById('go-level')!;
  goFloor = document.getElementById('go-floor')!;
  goTurn = document.getElementById('go-turn')!;
  goGold = document.getElementById('go-gold')!;
  goScore = document.getElementById('go-score')!;
  goRestartBtn = document.getElementById('go-restart-btn') as HTMLButtonElement;

  // Victory overlay elements
  victoryOverlay = document.getElementById('victory-overlay')!;
  vicLevel = document.getElementById('vic-level')!;
  vicGold = document.getElementById('vic-gold')!;
  vicTurn = document.getElementById('vic-turn')!;
  vicScore = document.getElementById('vic-score')!;
  vicRestartBtn = document.getElementById('vic-restart-btn') as HTMLButtonElement;

  ctrlUp = document.getElementById('ctrl-up') as HTMLButtonElement;
  ctrlDown = document.getElementById('ctrl-down') as HTMLButtonElement;
  ctrlLeft = document.getElementById('ctrl-left') as HTMLButtonElement;
  ctrlRight = document.getElementById('ctrl-right') as HTMLButtonElement;
  ctrlDescend = document.getElementById('ctrl-descend') as HTMLButtonElement;

  // Bind Events
  setupEvents();

  // Start rendering loop (draws start overlay screen visually)
  renderer.start();

  // Initial HUD render
  updateHUD();
});

function setupEvents() {
  // Keyboard movement
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Prevent default scrolling for arrows and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
      e.preventDefault();
    }

    if (engine.state.status !== 'playing') {
      if (engine.state.status === 'shop') {
        if (e.key === 'Escape') {
          engine.closeShop();
          updateHUD();
        }
      } else {
        // If game is not active, any key restarts or starts the game
        if (e.key === 'Enter' || e.key === ' ') {
          handleRestart();
        }
      }
      return;
    }

    switch (e.key) {
      // Move / Attack
      case 'ArrowUp':
      case 'w':
      case 'W':
        engine.movePlayer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        engine.movePlayer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        engine.movePlayer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        engine.movePlayer(1, 0);
        break;
      
      // Climb down stairs
      case '>':
      case '.':
        engine.descendStairs();
        break;

      // Skip Turn (wait)
      case ' ':
        engine.addMessage('待機した。');
        engine.state.turn++;
        engine.processEnemyTurns();
        break;
    }

    updateHUD();
  });

  // Mobile pad clicks
  ctrlUp.addEventListener('click', () => { engine.movePlayer(0, -1); updateHUD(); });
  ctrlDown.addEventListener('click', () => { engine.movePlayer(0, 1); updateHUD(); });
  ctrlLeft.addEventListener('click', () => { engine.movePlayer(-1, 0); updateHUD(); });
  ctrlRight.addEventListener('click', () => { engine.movePlayer(1, 0); updateHUD(); });
  ctrlDescend.addEventListener('click', () => { engine.descendStairs(); updateHUD(); });

  // Sound toggle button
  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = soundEffects.toggle();
    if (isEnabled) {
      soundToggleBtn.classList.remove('muted');
      soundToggleBtn.innerHTML = '<span class="sound-icon">🔊</span> オン';
    } else {
      soundToggleBtn.classList.add('muted');
      soundToggleBtn.innerHTML = '<span class="sound-icon">🔇</span> オフ';
    }
  });

  // Restart button
  restartBtn.addEventListener('click', () => {
    handleRestart();
  });

  // Listen to custom logger updates
  window.addEventListener('game-log-updated', () => {
    renderLogs();
  });

  // Close shop button click
  closeShopBtn.addEventListener('click', () => {
    engine.closeShop();
    updateHUD();
  });

  // Listen to shop events
  window.addEventListener('shop-opened', () => {
    shopModal.classList.remove('hidden');
    renderShop();
  });

  window.addEventListener('shop-closed', () => {
    shopModal.classList.add('hidden');
  });

  window.addEventListener('shop-updated', () => {
    renderShop();
  });

  // Start game button click
  startGameBtn.addEventListener('click', () => {
    engine.startGame();
    updateHUD();
  });

  // Restart buttons on overlays
  goRestartBtn.addEventListener('click', () => {
    handleRestart();
  });
  vicRestartBtn.addEventListener('click', () => {
    handleRestart();
  });
}

function handleRestart() {
  renderer.stop();
  engine.reset();
  engine.startGame();
  renderer.start();
  updateHUD();
}

function updateHUD() {
  const state = engine.state;
  const player = state.player;

  // Level statistics
  statFloor.innerText = `地下 ${state.dungeonLevel} 階`;
  statGold.innerText = `${state.gold} G`;
  statTurn.innerText = `${state.turn}`;
  statLevel.innerText = `${player.level}`;

  // HP Bar & Text
  hpValue.innerText = `${player.hp} / ${player.maxHp}`;
  const hpPct = (player.hp / player.maxHp) * 100;
  hpBarFill.style.width = `${Math.max(0, hpPct)}%`;

  // XP Bar & Text
  if (player.xp !== undefined && player.maxXp !== undefined) {
    xpValue.innerText = `${player.xp} / ${player.maxXp}`;
    const xpPct = (player.xp / player.maxXp) * 100;
    xpBarFill.style.width = `${Math.min(100, xpPct)}%`;
  }

  // Combat Stats (show items additions)
  const weaponBoost = engine.equippedWeapon?.value || 0;
  const armorBoost = engine.equippedArmor?.value || 0;
  
  statAtt.innerText = `${player.att}${weaponBoost > 0 ? ` (+${weaponBoost})` : ''}`;
  statDef.innerText = `${player.def}${armorBoost > 0 ? ` (+${armorBoost})` : ''}`;

  // Equipped Items UI
  if (engine.equippedWeapon) {
    equipWeapon.innerText = `${engine.equippedWeapon.name} (+${engine.equippedWeapon.value})`;
    equipWeapon.classList.remove('empty');
    equipWeapon.style.color = engine.equippedWeapon.color;
  } else {
    equipWeapon.innerText = '未装備';
    equipWeapon.classList.add('empty');
    equipWeapon.style.color = '';
  }

  if (engine.equippedArmor) {
    equipArmor.innerText = `${engine.equippedArmor.name} (+${engine.equippedArmor.value})`;
    equipArmor.classList.remove('empty');
    equipArmor.style.color = engine.equippedArmor.color;
  } else {
    equipArmor.innerText = '未装備';
    equipArmor.classList.add('empty');
    equipArmor.style.color = '';
  }

  // Inventory UI
  inventoryCount.innerText = `${state.inventory.length} / 10`;
  inventoryList.innerHTML = '';
  
  state.inventory.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'inventory-item';
    
    // Create inner structure
    const infoDiv = document.createElement('div');
    infoDiv.className = 'item-info';
    
    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'item-symbol';
    symbolSpan.style.color = item.color;
    symbolSpan.innerText = item.symbol;
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'item-details';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.style.color = item.color;
    nameSpan.innerText = item.name;
    
    const descSpan = document.createElement('span');
    descSpan.className = 'item-desc';
    descSpan.innerText = item.description;
    
    detailsDiv.appendChild(nameSpan);
    detailsDiv.appendChild(descSpan);
    
    infoDiv.appendChild(symbolSpan);
    infoDiv.appendChild(detailsDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';
    
    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-sm btn-primary';
    
    // Check if equipment or consumable
    const isEquip = item.type === 'weapon_sword' || item.type === 'armor_shield';
    useBtn.innerText = isEquip ? '装備' : '使う';
    useBtn.addEventListener('click', () => {
      engine.useInventoryItem(index);
      updateHUD();
    });

    const dropBtn = document.createElement('button');
    dropBtn.className = 'btn btn-sm btn-danger';
    dropBtn.innerText = '置く';
    dropBtn.addEventListener('click', () => {
      engine.dropInventoryItem(index);
      updateHUD();
    });

    actionsDiv.appendChild(useBtn);
    actionsDiv.appendChild(dropBtn);

    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);
    
    inventoryList.appendChild(li);
  });

  // Synchronize overlays based on game status
  if (state.status === 'start') {
    startOverlay.classList.remove('hidden');
    gameoverOverlay.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
  } else if (state.status === 'gameover') {
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.remove('hidden');
    victoryOverlay.classList.add('hidden');

    // Sync Game Over stats
    const score = Math.max(0, (player.level * 1000) + (state.gold * 10) - (state.turn * 5));
    goLevel.innerText = `Lvl ${player.level}`;
    goFloor.innerText = `地下 ${state.dungeonLevel} 階`;
    goTurn.innerText = `${state.turn} ターン`;
    goGold.innerText = `${state.gold} G`;
    goScore.innerText = `${score} 点`;
  } else if (state.status === 'victory') {
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    victoryOverlay.classList.remove('hidden');

    // Sync Victory stats
    const score = Math.max(0, (player.level * 1000) + (state.gold * 10) - (state.turn * 5));
    vicLevel.innerText = `Lvl ${player.level}`;
    vicGold.innerText = `${state.gold} G`;
    vicTurn.innerText = `${state.turn} ターン`;
    vicScore.innerText = `${score} 点`;
  } else {
    // playing or shop
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
  }

  // Render logs
  renderLogs();
}

function renderLogs() {
  const state = engine.state;
  logFeed.innerHTML = '';
  
  state.messages.forEach(msg => {
    const div = document.createElement('div');
    
    // Colorize logs depending on keywords
    if (msg.includes('ダメージを与えた')) {
      div.className = 'damage-log';
    } else if (msg.includes('ダメージを受けた')) {
      div.className = 'damage-log';
      div.style.color = '#f43f5e';
    } else if (msg.includes('回復')) {
      div.className = 'heal-log';
    } else if (msg.includes('獲得') || msg.includes('拾った')) {
      div.className = 'system-log';
    } else if (msg.includes('レベルアップ') || msg.includes('討伐') || msg.includes('秘宝')) {
      div.className = 'victory-log';
    }
    
    div.innerText = msg;
    logFeed.appendChild(div);
  });

  // Auto-scroll to bottom of logs
  logFeed.scrollTop = logFeed.scrollHeight;
}

function renderShop() {
  const state = engine.state;
  shopGoldVal.innerText = `${state.gold} G`;
  
  // 1. Render Buy List
  shopItemList.innerHTML = '';
  const shopItems = engine.getShopItems();
  shopItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'shop-item';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'shop-item-info';

    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'shop-item-symbol';
    symbolSpan.style.color = item.color;
    symbolSpan.innerText = item.symbol;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'shop-item-details';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'shop-item-name';
    nameSpan.style.color = item.color;
    nameSpan.innerText = item.name;

    const descSpan = document.createElement('span');
    descSpan.className = 'shop-item-desc';
    descSpan.innerText = item.description;

    detailsDiv.appendChild(nameSpan);
    detailsDiv.appendChild(descSpan);
    infoDiv.appendChild(symbolSpan);
    infoDiv.appendChild(detailsDiv);

    const buyDiv = document.createElement('div');
    buyDiv.className = 'shop-item-buy';

    const priceSpan = document.createElement('span');
    priceSpan.className = 'shop-item-price';
    priceSpan.innerText = `${item.price} G`;

    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-sm btn-primary';
    buyBtn.innerText = '購入';
    
    if (state.gold < item.price) {
      buyBtn.disabled = true;
      buyBtn.classList.remove('btn-primary');
      buyBtn.classList.add('btn-secondary');
      buyBtn.style.opacity = '0.5';
    }

    buyBtn.addEventListener('click', () => {
      engine.buyItem(item.id);
      updateHUD();
    });

    buyDiv.appendChild(priceSpan);
    buyDiv.appendChild(buyBtn);
    li.appendChild(infoDiv);
    li.appendChild(buyDiv);
    shopItemList.appendChild(li);
  });

  // 2. Render Sell List
  shopSellList.innerHTML = '';
  if (state.inventory.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.textAlign = 'center';
    emptyDiv.style.fontSize = '0.75rem';
    emptyDiv.style.color = 'var(--text-secondary)';
    emptyDiv.style.padding = '0.5rem';
    emptyDiv.innerText = '売却できるアイテムがありません。';
    shopSellList.appendChild(emptyDiv);
  } else {
    state.inventory.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'shop-item';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'shop-item-info';

      const symbolSpan = document.createElement('span');
      symbolSpan.className = 'shop-item-symbol';
      symbolSpan.style.color = item.color;
      symbolSpan.innerText = item.symbol;

      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'shop-item-details';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'shop-item-name';
      nameSpan.style.color = item.color;
      nameSpan.innerText = item.name;

      const descSpan = document.createElement('span');
      descSpan.className = 'shop-item-desc';
      descSpan.innerText = item.description;

      detailsDiv.appendChild(nameSpan);
      detailsDiv.appendChild(descSpan);
      infoDiv.appendChild(symbolSpan);
      infoDiv.appendChild(detailsDiv);

      const sellDiv = document.createElement('div');
      sellDiv.className = 'shop-item-buy';

      const sellPrice = engine.getSellPrice(item);
      const priceSpan = document.createElement('span');
      priceSpan.className = 'shop-item-price';
      priceSpan.innerText = `${sellPrice} G`;

      const sellBtn = document.createElement('button');
      sellBtn.className = 'btn btn-sm btn-danger';
      sellBtn.innerText = '売却';
      sellBtn.addEventListener('click', () => {
        engine.sellItem(index);
        updateHUD();
      });

      sellDiv.appendChild(priceSpan);
      sellDiv.appendChild(sellBtn);
      li.appendChild(infoDiv);
      li.appendChild(sellDiv);
      shopSellList.appendChild(li);
    });
  }
}

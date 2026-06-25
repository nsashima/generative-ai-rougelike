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

// Debug elements
let debugPanel: HTMLElement;
let dbWarpBtn: HTMLButtonElement;
let dbWarp10Btn: HTMLButtonElement;
let dbGodBtn: HTMLButtonElement;
let dbMapBtn: HTMLButtonElement;
let dbGoldBtn: HTMLButtonElement;
let dbCloseBtn: HTMLButtonElement;

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
let shopTabBuy: HTMLButtonElement;
let shopTabSell: HTMLButtonElement;
let shopBuyPanel: HTMLElement;
let shopSellPanel: HTMLElement;

// Mobile pad controls
let ctrlUp: HTMLButtonElement;
let ctrlDown: HTMLButtonElement;
let ctrlLeft: HTMLButtonElement;
let ctrlRight: HTMLButtonElement;
let ctrlDescend: HTMLButtonElement;

// Item Detail elements
let itemDetailModal: HTMLElement;
let closeItemDetailBtn: HTMLButtonElement;
let itemDetailCloseBtn: HTMLButtonElement;
let itemDetailUseBtn: HTMLButtonElement;
let itemDetailDropBtn: HTMLButtonElement;
let itemDetailSymbol: HTMLElement;
let itemDetailName: HTMLElement;
let itemDetailType: HTMLElement;
let itemDetailValue: HTMLElement;
let itemDetailPrice: HTMLElement;
let itemDetailDesc: HTMLElement;
let selectedInventoryIndex: number = -1;

// Help elements
let helpBtn: HTMLButtonElement;
let helpModal: HTMLElement;
let closeHelpBtn: HTMLButtonElement;

// Prologue elements
let prologueText: HTMLElement;
let skipPrologueBtn: HTMLButtonElement;
let prologueTimer: ReturnType<typeof setTimeout> | null = null;
let isPrologueActive: boolean = false;

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
  shopTabBuy = document.getElementById('shop-tab-buy') as HTMLButtonElement;
  shopTabSell = document.getElementById('shop-tab-sell') as HTMLButtonElement;
  shopBuyPanel = document.getElementById('shop-buy-panel')!;
  shopSellPanel = document.getElementById('shop-sell-panel')!;

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

  // Debug elements
  debugPanel = document.getElementById('debug-panel')!;
  dbWarpBtn = document.getElementById('db-warp-btn') as HTMLButtonElement;
  dbWarp10Btn = document.getElementById('db-warp10-btn') as HTMLButtonElement;
  dbGodBtn = document.getElementById('db-god-btn') as HTMLButtonElement;
  dbMapBtn = document.getElementById('db-map-btn') as HTMLButtonElement;
  dbGoldBtn = document.getElementById('db-gold-btn') as HTMLButtonElement;
  dbCloseBtn = document.getElementById('db-close-btn') as HTMLButtonElement;

  // Item Detail elements
  itemDetailModal = document.getElementById('item-detail-modal')!;
  closeItemDetailBtn = document.getElementById('close-item-detail-btn') as HTMLButtonElement;
  itemDetailCloseBtn = document.getElementById('item-detail-close-btn') as HTMLButtonElement;
  itemDetailUseBtn = document.getElementById('item-detail-use-btn') as HTMLButtonElement;
  itemDetailDropBtn = document.getElementById('item-detail-drop-btn') as HTMLButtonElement;
  itemDetailSymbol = document.getElementById('item-detail-symbol')!;
  itemDetailName = document.getElementById('item-detail-name')!;
  itemDetailType = document.getElementById('item-detail-type')!;
  itemDetailValue = document.getElementById('item-detail-value')!;
  itemDetailPrice = document.getElementById('item-detail-price')!;
  itemDetailDesc = document.getElementById('item-detail-desc')!;

  // Help elements
  helpBtn = document.getElementById('help-btn') as HTMLButtonElement;
  helpModal = document.getElementById('help-modal')!;
  closeHelpBtn = document.getElementById('close-help-btn') as HTMLButtonElement;

  // Prologue elements
  prologueText = document.getElementById('prologue-text')!;
  skipPrologueBtn = document.getElementById('skip-prologue-btn') as HTMLButtonElement;

  // Bind Events
  setupEvents();

  // Start rendering loop (draws start overlay screen visually)
  renderer.start();

  // Initial HUD render
  updateHUD();

  // Start the typing prologue intro
  startPrologue();
});

function setupEvents() {
  // Keyboard movement and actions
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // If Prologue is active, Space or Enter skips it
    if (isPrologueActive) {
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        skipPrologue();
        return;
      }
    }

    // If Help Modal is open, handle its keyboard commands first
    if (!helpModal.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.code === 'KeyH') {
        e.preventDefault();
        closeHelp();
        return;
      }
      // Block any other key input while help modal is active
      e.preventDefault();
      return;
    }

    // If Item Detail Modal is open, handle its keyboard commands first
    if (!itemDetailModal.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.code === 'KeyC') {
        e.preventDefault();
        closeItemDetail();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedInventoryIndex !== -1) {
          engine.useInventoryItem(selectedInventoryIndex);
          closeItemDetail();
          updateHUD();
        }
        return;
      }
      if (e.code === 'KeyD' || e.key === 'Delete') {
        e.preventDefault();
        if (selectedInventoryIndex !== -1) {
          engine.dropInventoryItem(selectedInventoryIndex);
          closeItemDetail();
          updateHUD();
        }
        return;
      }
      // Block any other key input while modal is active
      e.preventDefault();
      return;
    }

    // Debug toggle shortcut: Ctrl + Shift + D
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      e.preventDefault();
      const pw = prompt('デバッグパスワードを入力してください:');
      if (pw === 'sashima') {
        debugPanel.classList.remove('hidden-debug');
        engine.addMessage('【デバッグ】デバッグモードが有効になりました。');
        updateHUD();
      } else if (pw !== null) {
        alert('パスワードが正しくありません。');
      }
      return;
    }

    // Prevent default scrolling for arrows and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
      e.preventDefault();
    }

    // Prevent digit defaults to avoid unexpected browser shortcut conflicts
    if (e.code.startsWith('Digit')) {
      e.preventDefault();
    }

    // Global keys (work in any status)
    if (e.code === 'KeyM') {
      const isEnabled = soundEffects.toggle();
      if (isEnabled) {
        soundToggleBtn.classList.remove('muted');
        soundToggleBtn.innerHTML = '<span class="sound-icon">🔊</span> オン <kbd class="key-hint">M</kbd>';
      } else {
        soundToggleBtn.classList.add('muted');
        soundToggleBtn.innerHTML = '<span class="sound-icon">🔇</span> オフ <kbd class="key-hint">M</kbd>';
      }
      return;
    }
    if (e.code === 'KeyR') {
      handleRestart();
      return;
    }
    if (e.code === 'KeyH') {
      e.preventDefault();
      toggleHelp();
      return;
    }

    if (engine.state.status !== 'playing') {
      if (engine.state.status === 'shop') {
        if (e.key === 'Escape') {
          engine.closeShop();
          updateHUD();
          return;
        }

        // Tab, or ArrowLeft/ArrowRight or A/D to switch tabs
        if (e.key === 'Tab' || e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'KeyA' || e.code === 'KeyD') {
          e.preventDefault();
          engine.shopActiveTab = engine.shopActiveTab === 'buy' ? 'sell' : 'buy';
          engine.shopSelectedIndex = 0;
          updateHUD();
          scrollSelectedShopItemIntoView();
          return;
        }

        // ArrowUp or KeyW to move selection up
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          const itemsCount = engine.shopActiveTab === 'buy' 
            ? engine.getShopItems().length 
            : engine.state.inventory.length;
          if (itemsCount > 0) {
            engine.shopSelectedIndex = (engine.shopSelectedIndex - 1 + itemsCount) % itemsCount;
            updateHUD();
            scrollSelectedShopItemIntoView();
          }
          return;
        }

        // ArrowDown or KeyS to move selection down
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          const itemsCount = engine.shopActiveTab === 'buy' 
            ? engine.getShopItems().length 
            : engine.state.inventory.length;
          if (itemsCount > 0) {
            engine.shopSelectedIndex = (engine.shopSelectedIndex + 1) % itemsCount;
            updateHUD();
            scrollSelectedShopItemIntoView();
          }
          return;
        }

        // Enter or Space to execute transaction
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (engine.shopActiveTab === 'buy') {
            const shopItems = engine.getShopItems();
            const selectedItem = shopItems[engine.shopSelectedIndex];
            if (selectedItem) {
              engine.buyItem(selectedItem.id);
              const newItemsCount = engine.getShopItems().length;
              if (engine.shopSelectedIndex >= newItemsCount) {
                engine.shopSelectedIndex = Math.max(0, newItemsCount - 1);
              }
              updateHUD();
              scrollSelectedShopItemIntoView();
            }
          } else {
            const inventory = engine.state.inventory;
            if (inventory.length > 0) {
              engine.sellItem(engine.shopSelectedIndex);
              const newItemsCount = engine.state.inventory.length;
              if (engine.shopSelectedIndex >= newItemsCount) {
                engine.shopSelectedIndex = Math.max(0, newItemsCount - 1);
              }
              updateHUD();
              scrollSelectedShopItemIntoView();
            }
          }
          return;
        }
      } else {
        // If game is not active, Enter or Space restarts or starts the game
        if (e.key === 'Enter' || e.key === ' ') {
          if (!startOverlay.classList.contains('hidden')) {
            if (!startGameBtn.classList.contains('hidden')) {
              soundEffects.playFanfare();
              engine.startGame();
              updateHUD();
            }
          } else {
            handleRestart();
          }
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

    // Inventory interactions: Digit1 to Digit0
    const digitMatch = e.code.match(/^Digit([0-9])$/);
    if (digitMatch) {
      const digit = digitMatch[1];
      const slotNum = digit === '0' ? 9 : parseInt(digit) - 1;
      if (slotNum < engine.state.inventory.length) {
        if (e.altKey) {
          e.preventDefault();
          openItemDetail(slotNum);
        } else if (e.shiftKey) {
          // Drop item
          engine.dropInventoryItem(slotNum);
        } else {
          // Use / Equip item
          engine.useInventoryItem(slotNum);
        }
        updateHUD();
      }
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
      soundToggleBtn.innerHTML = '<span class="sound-icon">🔊</span> オン <kbd class="key-hint">M</kbd>';
    } else {
      soundToggleBtn.classList.add('muted');
      soundToggleBtn.innerHTML = '<span class="sound-icon">🔇</span> オフ <kbd class="key-hint">M</kbd>';
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

  // Shop tab click events
  shopTabBuy.addEventListener('click', () => {
    engine.shopActiveTab = 'buy';
    engine.shopSelectedIndex = 0;
    updateHUD();
  });

  shopTabSell.addEventListener('click', () => {
    engine.shopActiveTab = 'sell';
    engine.shopSelectedIndex = 0;
    updateHUD();
  });

  // Listen to shop events
  window.addEventListener('shop-opened', () => {
    shopModal.classList.remove('hidden');
    renderShop();
    scrollSelectedShopItemIntoView();
  });

  window.addEventListener('shop-closed', () => {
    shopModal.classList.add('hidden');
  });

  window.addEventListener('shop-updated', () => {
    renderShop();
  });

  // Start game button click
  startGameBtn.addEventListener('click', () => {
    soundEffects.playFanfare();
    engine.startGame();
    updateHUD();
  });

  // Skip prologue button click
  skipPrologueBtn.addEventListener('click', () => {
    skipPrologue();
  });

  // Restart buttons on overlays
  goRestartBtn.addEventListener('click', () => {
    handleRestart();
  });
  vicRestartBtn.addEventListener('click', () => {
    handleRestart();
  });

  // Debug Panel Buttons
  dbWarpBtn.addEventListener('click', () => {
    engine.loadLevel(5);
    engine.addMessage('【デバッグ】地下5階にワープしました。');
    updateHUD();
  });

  dbWarp10Btn.addEventListener('click', () => {
    engine.loadLevel(10);
    engine.addMessage('【デバッグ】地下10階にワープしました。');
    updateHUD();
  });

  dbGodBtn.addEventListener('click', () => {
    const player = engine.state.player;
    player.hp = 9999;
    player.maxHp = 9999;
    player.att = 999;
    engine.addMessage('【デバッグ】プレイヤーを無敵化（HP 9999 / ATT 999）にしました。');
    updateHUD();
  });

  dbMapBtn.addEventListener('click', () => {
    engine.debugAllVisible = !engine.debugAllVisible;
    if (engine.debugAllVisible) {
      engine.revealAllMap();
      engine.addMessage('【デバッグ】マップ全開モードをONにしました。');
    } else {
      engine.addMessage('【デバッグ】マップ全開モードをOFFにしました。');
    }
    updateHUD();
  });

  dbGoldBtn.addEventListener('click', () => {
    engine.state.gold += 1000;
    engine.addMessage('【デバッグ】ゴールド +1000 G');
    updateHUD();
  });

  dbCloseBtn.addEventListener('click', () => {
    debugPanel.classList.add('hidden-debug');
  });

  // Item Detail click listeners
  closeItemDetailBtn.addEventListener('click', closeItemDetail);
  itemDetailCloseBtn.addEventListener('click', closeItemDetail);

  itemDetailUseBtn.addEventListener('click', () => {
    if (selectedInventoryIndex !== -1) {
      engine.useInventoryItem(selectedInventoryIndex);
      closeItemDetail();
      updateHUD();
    }
  });

  itemDetailDropBtn.addEventListener('click', () => {
    if (selectedInventoryIndex !== -1) {
      engine.dropInventoryItem(selectedInventoryIndex);
      closeItemDetail();
      updateHUD();
    }
  });

  // Help Modal click listeners
  helpBtn.addEventListener('click', toggleHelp);
  closeHelpBtn.addEventListener('click', closeHelp);
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
    
    detailsDiv.appendChild(nameSpan);
    
    infoDiv.appendChild(symbolSpan);
    infoDiv.appendChild(detailsDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';
    
    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-sm btn-primary';
    
    const keyNum = index === 9 ? '0' : (index + 1).toString();
    
    // Check if equipment or consumable
    const isEquip = item.type === 'weapon_sword' || item.type === 'armor_shield';
    useBtn.innerHTML = `${isEquip ? '装備' : '使う'} <kbd class="key-hint">${keyNum}</kbd>`;
    useBtn.addEventListener('click', () => {
      engine.useInventoryItem(index);
      updateHUD();
    });

    const inspectBtn = document.createElement('button');
    inspectBtn.className = 'btn btn-sm btn-secondary';
    inspectBtn.innerHTML = `詳細 <kbd class="key-hint">Alt+${keyNum}</kbd>`;
    inspectBtn.addEventListener('click', () => {
      openItemDetail(index);
    });

    const dropBtn = document.createElement('button');
    dropBtn.className = 'btn btn-sm btn-danger';
    dropBtn.innerHTML = `置く <kbd class="key-hint">Shift+${keyNum}</kbd>`;
    dropBtn.addEventListener('click', () => {
      engine.dropInventoryItem(index);
      updateHUD();
    });

    actionsDiv.appendChild(useBtn);
    actionsDiv.appendChild(inspectBtn);
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
    if (state.status === 'shop') {
      renderShop();
    }
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

function scrollSelectedShopItemIntoView() {
  setTimeout(() => {
    const selectedEl = document.querySelector('.shop-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, 10);
}

function renderShop() {
  const state = engine.state;
  shopGoldVal.innerText = `${state.gold} G`;

  // Update tabs active state
  if (engine.shopActiveTab === 'buy') {
    shopTabBuy.classList.add('active');
    shopTabSell.classList.remove('active');
    shopBuyPanel.classList.remove('hidden');
    shopSellPanel.classList.add('hidden');
  } else {
    shopTabBuy.classList.remove('active');
    shopTabSell.classList.add('active');
    shopBuyPanel.classList.add('hidden');
    shopSellPanel.classList.remove('hidden');
  }
  
  // 1. Render Buy List
  shopItemList.innerHTML = '';
  const shopItems = engine.getShopItems();
  shopItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'shop-item';
    if (engine.shopActiveTab === 'buy' && index === engine.shopSelectedIndex) {
      li.classList.add('selected');
    }
    
    li.addEventListener('click', () => {
      engine.shopActiveTab = 'buy';
      engine.shopSelectedIndex = index;
      updateHUD();
    });

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
    
    if (engine.shopActiveTab === 'buy' && index === engine.shopSelectedIndex) {
      buyBtn.innerHTML = `購入 <kbd class="key-hint">Enter</kbd>`;
    } else {
      buyBtn.innerText = `購入`;
    }
    
    if (state.gold < item.price) {
      buyBtn.disabled = true;
      buyBtn.classList.remove('btn-primary');
      buyBtn.classList.add('btn-secondary');
      buyBtn.style.opacity = '0.5';
    }

    buyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      engine.shopActiveTab = 'buy';
      engine.shopSelectedIndex = index;
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
    emptyDiv.style.padding = '1rem';
    emptyDiv.innerText = '売却できるアイテムがありません。';
    shopSellList.appendChild(emptyDiv);
  } else {
    state.inventory.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'shop-item';
      if (engine.shopActiveTab === 'sell' && index === engine.shopSelectedIndex) {
        li.classList.add('selected');
      }

      li.addEventListener('click', () => {
        engine.shopActiveTab = 'sell';
        engine.shopSelectedIndex = index;
        updateHUD();
      });

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
      if (engine.shopActiveTab === 'sell' && index === engine.shopSelectedIndex) {
        sellBtn.innerHTML = `売却 <kbd class="key-hint">Enter</kbd>`;
      } else {
        sellBtn.innerText = `売却`;
      }
      
      sellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        engine.shopActiveTab = 'sell';
        engine.shopSelectedIndex = index;
        engine.sellItem(index);
        
        const newItemsCount = engine.state.inventory.length;
        if (engine.shopSelectedIndex >= newItemsCount) {
          engine.shopSelectedIndex = Math.max(0, newItemsCount - 1);
        }
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

function openItemDetail(index: number) {
  const item = engine.state.inventory[index];
  if (!item) return;
  
  selectedInventoryIndex = index;
  
  // Set content
  itemDetailSymbol.innerText = item.symbol;
  itemDetailSymbol.style.color = item.color;
  
  itemDetailName.innerText = item.name;
  itemDetailName.style.color = item.color;
  
  // Determine type string
  let typeStr = 'その他';
  if (item.type === 'weapon_sword') typeStr = '武器';
  else if (item.type === 'armor_shield') typeStr = '防具';
  else if (item.type.startsWith('potion')) typeStr = '薬';
  else if (item.type.startsWith('scroll')) typeStr = '巻物';
  
  itemDetailType.innerText = typeStr;
  
  // Determine value string
  let valStr = item.value.toString();
  if (item.type === 'weapon_sword' || item.type === 'armor_shield') {
    valStr = `+${item.value}`;
  } else if (item.type === 'potion_heal') {
    valStr = `最大HPの ${item.value}% 回復`;
  } else if (item.type === 'potion_strength') {
    valStr = `力 +${item.value}`;
  } else if (item.type === 'scroll_fireball' || item.type === 'scroll_thunder') {
    valStr = `${item.value} ダメージ`;
  } else {
    valStr = 'なし / 特殊';
  }
  itemDetailValue.innerText = valStr;
  
  // Get sell price
  const sellPrice = engine.getSellPrice(item);
  itemDetailPrice.innerText = `${sellPrice} G`;
  
  itemDetailDesc.innerText = item.description;
  
  // Set use button text
  const isEquip = item.type === 'weapon_sword' || item.type === 'armor_shield';
  itemDetailUseBtn.innerText = isEquip ? '装備する' : '使う';
  
  // Show modal
  itemDetailModal.classList.remove('hidden');
}

function closeItemDetail() {
  itemDetailModal.classList.add('hidden');
  selectedInventoryIndex = -1;
}

function openHelp() {
  helpModal.classList.remove('hidden');
}

function closeHelp() {
  helpModal.classList.add('hidden');
}

function toggleHelp() {
  if (helpModal.classList.contains('hidden')) {
    openHelp();
  } else {
    closeHelp();
  }
}

const prologueStoryText = `―― 人類の英知を超えた生成AIが創り出せし深淵の迷宮。
その地下10階の底には、世界のすべてを知るという
伝説の「生成AIの秘宝」が眠ると伝えられている。

多くの冒険者たちが秘宝を求めて迷宮に挑むも、
凶悪なモンスターと「邪教の心眼」の前に散っていった。

いま、一人の勇者が覚悟を決め、迷宮の扉を開く ――`;

function startPrologue() {
  if (prologueText) {
    prologueText.innerHTML = '';
  }
  isPrologueActive = true;
  startGameBtn.classList.add('hidden');
  skipPrologueBtn.classList.remove('hidden');
  
  let charIndex = 0;
  
  function typeNextChar() {
    if (!isPrologueActive) return;
    if (charIndex < prologueStoryText.length) {
      const char = prologueStoryText[charIndex];
      if (char === '\n') {
        prologueText.innerHTML += '<br>';
      } else {
        prologueText.innerHTML += char;
      }
      charIndex++;
      
      // Play a short retro beep for letters, ignoring spaces and linebreaks
      if (char !== ' ' && char !== '\n' && char !== '　') {
        soundEffects.playTyping();
      }
      
      // Pacing delay (shorter for letters, longer for punctuation/newlines)
      let delay = 50;
      if (char === '。' || char === '！' || char === '？') {
        delay = 450;
      } else if (char === '、' || char === 'ー' || char === '\n') {
        delay = 250;
      }
      
      prologueTimer = setTimeout(typeNextChar, delay);
    } else {
      finishPrologue();
    }
  }
  
  typeNextChar();
}

function finishPrologue() {
  isPrologueActive = false;
  if (prologueTimer) {
    clearTimeout(prologueTimer);
    prologueTimer = null;
  }
  // Replace line breaks with HTML line breaks
  prologueText.innerHTML = prologueStoryText.replace(/\n/g, '<br>');
  
  startGameBtn.classList.remove('hidden');
  skipPrologueBtn.classList.add('hidden');
  
  // Focus the start game button so that pressing Enter acts immediately
  startGameBtn.focus();
}

function skipPrologue() {
  finishPrologue();
}



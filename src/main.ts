import { GameEngine } from './logic/game';
import { DungeonRenderer } from './renderer';
import { soundEffects } from './logic/sound';
import { Item } from './types';

// DOM elements
let canvas: HTMLCanvasElement;
let engine: GameEngine;
let renderer: DungeonRenderer;

// Mobile Tab UI elements
let tabLog: HTMLElement | null = null;
let tabInventory: HTMLElement | null = null;
let tabStatus: HTMLElement | null = null;
let contentLog: HTMLElement | null = null;
let contentInventory: HTMLElement | null = null;
let contentStatus: HTMLElement | null = null;

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
let equipRing: HTMLElement;

// Inventory elements
let inventoryCount: HTMLElement;
let inventoryList: HTMLElement;

// Log elements
let logFeed: HTMLElement;

const GAME_VERSION = __APP_VERSION__;
let saveBtn: HTMLButtonElement;
let resumeGameBtn: HTMLButtonElement;

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
let ctrlWait: HTMLButtonElement;
let ctrlDescend: HTMLButtonElement;

// Item Detail elements
let itemDetailModal: HTMLElement;
let closeItemDetailBtn: HTMLButtonElement;
let itemDetailCloseBtn: HTMLButtonElement;
let itemDetailUseBtn: HTMLButtonElement;
let itemDetailDropBtn: HTMLButtonElement;
let itemDetailName: HTMLElement;
let itemDetailType: HTMLElement;
let itemDetailValue: HTMLElement;
let itemDetailPrice: HTMLElement;
let itemDetailDesc: HTMLElement;
let selectedInventoryIndex: number = -1;
let selectedSortIndex: number = -1;
let selectedItemDetailType: 'inventory' | 'weapon' | 'armor' | 'ring' = 'inventory';

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
  saveBtn = document.getElementById('save-btn') as HTMLButtonElement;

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
  equipRing = document.getElementById('equip-ring')!;

  inventoryCount = document.getElementById('inventory-count')!;
  inventoryList = document.getElementById('inventory-list')!;

  logFeed = document.getElementById('log-feed')!;

  // Mobile Tab elements binding
  tabLog = document.getElementById('tab-btn-log');
  tabInventory = document.getElementById('tab-btn-inventory');
  tabStatus = document.getElementById('tab-btn-status');

  contentLog = document.getElementById('logs-card-el');
  contentInventory = document.getElementById('inventory-card-el');
  contentStatus = document.getElementById('character-card-el');

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
  resumeGameBtn = document.getElementById('resume-game-btn') as HTMLButtonElement;

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
  ctrlWait = document.getElementById('ctrl-wait') as HTMLButtonElement;
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

  // Load saved D-pad layout (default: right)
  const savedDpadLayout = localStorage.getItem('dpad-right-layout');
  const pcControlsEl = document.getElementById('pc-controls-el');
  if (savedDpadLayout === 'false') {
    pcControlsEl?.classList.remove('dpad-right');
  } else {
    pcControlsEl?.classList.add('dpad-right');
  }

  // Initialize responsive layouts
  adjustLayoutForDevice();
  renderer.resizeCanvas();
  window.addEventListener('resize', () => {
    adjustLayoutForDevice();
    renderer.resizeCanvas();
  });

  // Start the typing prologue intro
  window.focus();
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
      if (e.key === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        itemDetailUseBtn.click();
        return;
      }
      if (e.code === 'KeyD' || e.key === 'Delete') {
        e.preventDefault();
        if (!itemDetailDropBtn.disabled) {
          itemDetailDropBtn.click();
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
      updateSoundButtonUI(isEnabled);
      return;
    }
    if (e.code === 'KeyR' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      handleRestart();
      return;
    }
    if (e.code === 'KeyH') {
      e.preventDefault();
      toggleHelp();
      return;
    }

    // Shift + S to save and suspend game
    if (e.shiftKey && e.code === 'KeyS' && (engine.state.status === 'playing' || engine.state.status === 'shop')) {
      e.preventDefault();
      saveGame();
      return;
    }

    // KeyN to start new game when on title screen
    if ((e.code === 'KeyN' || e.key === 'n' || e.key === 'N') && !startOverlay.classList.contains('hidden')) {
      if (!startGameBtn.classList.contains('hidden')) {
        e.preventDefault();
        const hasSave = localStorage.getItem('generative-ai-roguelike-save') !== null;
        if (hasSave) {
          if (confirm('前回のセーブデータを消去して、最初から冒険を始めますか？')) {
            startGameBtn.click();
          }
        } else {
          startGameBtn.click();
        }
        return;
      }
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
            if (!resumeGameBtn.classList.contains('hidden')) {
              e.preventDefault();
              resumeGameBtn.click();
            } else if (!startGameBtn.classList.contains('hidden')) {
              e.preventDefault();
              startGameBtn.click();
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

    // Inspect equipped items using Alt+W (weapon), Alt+A (armor), and Alt+R (ring)
    if (e.altKey) {
      if (e.code === 'KeyW') {
        e.preventDefault();
        if (engine.equippedWeapon) {
          openItemDetail(0, 'weapon');
        } else {
          engine.addMessage('武器を装備していません。');
        }
        return;
      }
      if (e.code === 'KeyA') {
        e.preventDefault();
        if (engine.equippedArmor) {
          openItemDetail(0, 'armor');
        } else {
          engine.addMessage('防具を装備していません。');
        }
        return;
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        if (engine.equippedRing) {
          openItemDetail(0, 'ring');
        } else {
          engine.addMessage('指輪を装備していません。');
        }
        return;
      }
    }

    // Inventory interactions: Digit1 to Digit0
    const digitMatch = e.code.match(/^Digit([0-9])$/);
    if (digitMatch) {
      const digit = digitMatch[1];
      const slotNum = digit === '0' ? 9 : parseInt(digit) - 1;
      if (slotNum < engine.state.inventory.length) {
        if (e.ctrlKey) {
          e.preventDefault();
          if (selectedSortIndex === slotNum) {
            selectedSortIndex = -1;
            engine.addMessage('並べ替えの選択を解除した。');
          } else if (selectedSortIndex !== -1) {
            engine.swapInventoryItems(selectedSortIndex, slotNum);
            engine.addMessage('アイテムを並べ替えた。');
            selectedSortIndex = -1;
          } else {
            selectedSortIndex = slotNum;
            engine.addMessage(`${slotNum + 1}番目のアイテムを選択した。並び替え先を Ctrl + 数字キー で選択してください。`);
          }
        } else if (e.altKey) {
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

  // Mobile pad clicks and touches (latency-free touch handlers)
  const bindTouchOrClick = (btn: HTMLButtonElement, action: () => void) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      action();
      updateHUD();
    });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      action();
      updateHUD();
    });
  };

  bindTouchOrClick(ctrlUp, () => engine.movePlayer(0, -1));
  bindTouchOrClick(ctrlDown, () => engine.movePlayer(0, 1));
  bindTouchOrClick(ctrlLeft, () => engine.movePlayer(-1, 0));
  bindTouchOrClick(ctrlRight, () => engine.movePlayer(1, 0));
  bindTouchOrClick(ctrlWait, () => {
    engine.addMessage('待機した。');
    engine.state.turn++;
    engine.processEnemyTurns();
  });
  bindTouchOrClick(ctrlDescend, () => engine.descendStairs());

  // Mobile Tab switching logic
  tabLog?.addEventListener('click', (e) => { e.preventDefault(); switchTab('log'); });
  tabInventory?.addEventListener('click', (e) => { e.preventDefault(); switchTab('inventory'); });
  tabStatus?.addEventListener('click', (e) => { e.preventDefault(); switchTab('status'); });

  tabLog?.addEventListener('touchstart', (e) => { e.preventDefault(); switchTab('log'); });
  tabInventory?.addEventListener('touchstart', (e) => { e.preventDefault(); switchTab('inventory'); });
  tabStatus?.addEventListener('touchstart', (e) => { e.preventDefault(); switchTab('status'); });

  // Mobile HUD Modal triggers and close button
  const closeMobileHudBtn = document.getElementById('close-mobile-hud-btn');
  const mobileHudModal = document.getElementById('mobile-hud-container');

  closeMobileHudBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    mobileHudModal?.classList.remove('active');
  });
  closeMobileHudBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileHudModal?.classList.remove('active');
  });

  const bindTrigger = (id: string, targetTab: 'log' | 'inventory' | 'status') => {
    const btn = document.getElementById(id);
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(targetTab);
      mobileHudModal?.classList.add('active');
    });
    btn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      switchTab(targetTab);
      mobileHudModal?.classList.add('active');
    });
  };

  bindTrigger('trigger-btn-log', 'log');
  bindTrigger('trigger-btn-inventory', 'inventory');
  bindTrigger('trigger-btn-status', 'status');

  // Layout reverse toggle
  const layoutToggleBtn = document.getElementById('trigger-btn-layout');
  const controlsEl = document.getElementById('pc-controls-el');
  const toggleLayout = () => {
    if (controlsEl) {
      const isRight = controlsEl.classList.toggle('dpad-right');
      localStorage.setItem('dpad-right-layout', isRight ? 'true' : 'false');
    }
  };
  layoutToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLayout();
  });
  layoutToggleBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleLayout();
  });

  // Prevent contextmenu, double-tap zoom and touch-drag selections inside mobile HUD modal
  if (mobileHudModal) {
    mobileHudModal.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Prevent double-tap to zoom behavior programmatically for older webviews
    let lastTouchTime = 0;
    mobileHudModal.addEventListener('touchstart', (e) => {
      const currentTime = performance.now();
      const timeDiff = currentTime - lastTouchTime;
      if (timeDiff > 0 && timeDiff < 300) {
        // Double-tap detected
        e.preventDefault();
      }
      lastTouchTime = currentTime;
    }, { passive: false });
    
    // Disable text selection drag behavior during touches inside the modal
    mobileHudModal.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
  }

  // Sound toggle button
  const mSoundToggleBtn = document.getElementById('m-sound-toggle-btn');
  const mHelpBtn = document.getElementById('m-help-btn');

  const updateSoundButtonUI = (isEnabled: boolean) => {
    if (isEnabled) {
      soundToggleBtn.classList.remove('muted');
      soundToggleBtn.innerHTML = '<span class="sound-icon">🔊</span> オン <kbd class="key-hint">M</kbd>';
      if (mSoundToggleBtn) mSoundToggleBtn.innerHTML = '🔊 サウンドオン';
    } else {
      soundToggleBtn.classList.add('muted');
      soundToggleBtn.innerHTML = '<span class="sound-icon">🔇</span> オフ <kbd class="key-hint">M</kbd>';
      if (mSoundToggleBtn) mSoundToggleBtn.innerHTML = '🔇 サウンドオフ';
    }
  };

  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = soundEffects.toggle();
    updateSoundButtonUI(isEnabled);
  });

  mSoundToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const isEnabled = soundEffects.toggle();
    updateSoundButtonUI(isEnabled);
  });
  mSoundToggleBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const isEnabled = soundEffects.toggle();
    updateSoundButtonUI(isEnabled);
  });

  mHelpBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleHelp();
  });
  mHelpBtn?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    toggleHelp();
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
    localStorage.removeItem('generative-ai-roguelike-save');
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
    if (selectedItemDetailType === 'inventory' && selectedInventoryIndex !== -1) {
      engine.useInventoryItem(selectedInventoryIndex);
      closeItemDetail();
      updateHUD();
      
      // Close mobile HUD modal if on mobile screen
      if (window.innerWidth <= 768) {
        document.getElementById('mobile-hud-container')?.classList.remove('active');
      }
    } else if (selectedItemDetailType === 'weapon') {
      const ok = engine.unequipItem('weapon');
      if (ok) {
        closeItemDetail();
        updateHUD();
        
        // Close mobile HUD modal if on mobile screen
        if (window.innerWidth <= 768) {
          document.getElementById('mobile-hud-container')?.classList.remove('active');
        }
      }
    } else if (selectedItemDetailType === 'armor') {
      const ok = engine.unequipItem('armor');
      if (ok) {
        closeItemDetail();
        updateHUD();
        
        // Close mobile HUD modal if on mobile screen
        if (window.innerWidth <= 768) {
          document.getElementById('mobile-hud-container')?.classList.remove('active');
        }
      }
    } else if (selectedItemDetailType === 'ring') {
      const ok = engine.unequipItem('ring');
      if (ok) {
        closeItemDetail();
        updateHUD();
        
        // Close mobile HUD modal if on mobile screen
        if (window.innerWidth <= 768) {
          document.getElementById('mobile-hud-container')?.classList.remove('active');
        }
      }
    }
  });

  itemDetailDropBtn.addEventListener('click', () => {
    if (selectedItemDetailType === 'inventory' && selectedInventoryIndex !== -1) {
      engine.dropInventoryItem(selectedInventoryIndex);
      closeItemDetail();
      updateHUD();
    }
  });

  // Help Modal click listeners
  helpBtn.addEventListener('click', toggleHelp);
  closeHelpBtn.addEventListener('click', closeHelp);

  // Equipment click listeners to inspect details
  equipWeapon.addEventListener('click', () => {
    if (engine.equippedWeapon) {
      openItemDetail(0, 'weapon');
    }
  });
  equipArmor.addEventListener('click', () => {
    if (engine.equippedArmor) {
      openItemDetail(0, 'armor');
    }
  });
  equipRing.addEventListener('click', () => {
    if (engine.equippedRing) {
      openItemDetail(0, 'ring');
    }
  });

  // Save suspension click listener
  saveBtn.addEventListener('click', () => {
    saveGame();
  });

  // Resume game click listener
  resumeGameBtn.addEventListener('click', () => {
    const ok = loadGame();
    if (ok) {
      startOverlay.classList.add('hidden');
      soundEffects.playFanfare();
      renderer.start();
      updateHUD();
    }
  });
}

function handleRestart() {
  localStorage.removeItem('generative-ai-roguelike-save');
  renderer.stop();
  engine.reset();
  engine.startGame();
  renderer.start();
  updateHUD();
}

function updateHUD() {
  const state = engine.state;
  const player = state.player;

  // Show save button only when actively playing or inside shop
  if (saveBtn) {
    if (state.status === 'playing' || state.status === 'shop') {
      saveBtn.classList.remove('hidden');
    } else {
      saveBtn.classList.add('hidden');
    }
  }

  // Level statistics
  statFloor.innerText = `地下 ${state.dungeonLevel} 階`;
  statGold.innerText = `${state.gold} G`;
  statTurn.innerText = `${state.turn}`;
  statLevel.innerText = `${player.level}`;

  // HP Bar & Text
  hpValue.innerText = `${player.hp} / ${player.maxHp}`;
  const hpPct = (player.hp / player.maxHp) * 100;
  hpBarFill.style.width = `${Math.max(0, hpPct)}%`;

  // Mobile status bar sync
  const mHpBarFill = document.getElementById('m-hp-bar-fill');
  const mHpVal = document.getElementById('m-hp-val');
  const mFloorVal = document.getElementById('m-floor-val');
  const mGoldVal = document.getElementById('m-gold-val');
  const mLevelVal = document.getElementById('m-level-val');

  if (mHpBarFill) mHpBarFill.style.width = `${Math.max(0, hpPct)}%`;
  if (mHpVal) mHpVal.innerText = `${player.hp} / ${player.maxHp}`;
  if (mFloorVal) mFloorVal.innerText = `地下 ${state.dungeonLevel} 階`;
  if (mGoldVal) mGoldVal.innerText = `${state.gold} G`;
  if (mLevelVal) mLevelVal.innerText = `${player.level}`;

  // XP Bar & Text
  if (player.xp !== undefined && player.maxXp !== undefined) {
    xpValue.innerText = `${player.xp} / ${player.maxXp}`;
    const xpPct = (player.xp / player.maxXp) * 100;
    xpBarFill.style.width = `${Math.min(100, xpPct)}%`;
  }

  // Combat Stats (show items additions)
  const isGuardian = player.job === 'guardian';
  const weaponBoost = engine.equippedWeapon?.value || 0;
  const armorBoost = engine.equippedArmor?.value || 0;
  const ringAttBoost = (engine.equippedRing && engine.equippedRing.type === 'ring_attack') ? engine.equippedRing.value : 0;
  const ringDefBoost = (engine.equippedRing && engine.equippedRing.type === 'ring_defense') ? engine.equippedRing.value : 0;
  
  if (isGuardian) {
    statAtt.innerText = `${player.att}${ringAttBoost > 0 ? ` (+${ringAttBoost})` : ''}`;
    const totalDefBoost = armorBoost + weaponBoost + ringDefBoost;
    statDef.innerText = `${player.def}${totalDefBoost > 0 ? ` (+${totalDefBoost})` : ''}`;
  } else {
    const totalAttBoost = weaponBoost + ringAttBoost;
    const totalDefBoost = armorBoost + ringDefBoost;
    statAtt.innerText = `${player.att}${totalAttBoost > 0 ? ` (+${totalAttBoost})` : ''}`;
    statDef.innerText = `${player.def}${totalDefBoost > 0 ? ` (+${totalDefBoost})` : ''}`;
  }

  // Dynamically change equipment labels based on job (without bracket symbols)
  const weaponLabel = document.getElementById('equip-weapon-label');
  const armorLabel = document.getElementById('equip-armor-label');
  if (weaponLabel && armorLabel) {
    if (isGuardian) {
      weaponLabel.innerHTML = `盾(副) <kbd class="key-hint">Alt+W</kbd> :`;
      armorLabel.innerHTML = `盾(主) <kbd class="key-hint">Alt+A</kbd> :`;
    } else {
      weaponLabel.innerHTML = `武器 <kbd class="key-hint">Alt+W</kbd> :`;
      armorLabel.innerHTML = `防具 <kbd class="key-hint">Alt+A</kbd> :`;
    }
  }

  // Equipped Items UI
  if (engine.equippedWeapon) {
    const durText = engine.equippedWeapon.durability !== undefined ? ` [耐久:${engine.equippedWeapon.durability}/${engine.equippedWeapon.maxDurability}]` : '';
    equipWeapon.innerText = `${engine.equippedWeapon.name} (+${engine.equippedWeapon.value})${durText}`;
    equipWeapon.classList.remove('empty');
    equipWeapon.style.color = engine.equippedWeapon.color;
    equipWeapon.style.cursor = 'pointer';
    equipWeapon.style.textDecoration = 'underline';
  } else {
    equipWeapon.innerText = '未装備';
    equipWeapon.classList.add('empty');
    equipWeapon.style.color = '';
    equipWeapon.style.cursor = '';
    equipWeapon.style.textDecoration = '';
  }

  if (engine.equippedArmor) {
    const durText = engine.equippedArmor.durability !== undefined ? ` [耐久:${engine.equippedArmor.durability}/${engine.equippedArmor.maxDurability}]` : '';
    equipArmor.innerText = `${engine.equippedArmor.name} (+${engine.equippedArmor.value})${durText}`;
    equipArmor.classList.remove('empty');
    equipArmor.style.color = engine.equippedArmor.color;
    equipArmor.style.cursor = 'pointer';
    equipArmor.style.textDecoration = 'underline';
  } else {
    equipArmor.innerText = '未装備';
    equipArmor.classList.add('empty');
    equipArmor.style.color = '';
    equipArmor.style.cursor = '';
    equipArmor.style.textDecoration = '';
  }

  if (engine.equippedRing) {
    equipRing.innerText = `${engine.equippedRing.name}`;
    equipRing.classList.remove('empty');
    equipRing.style.color = engine.equippedRing.color;
    equipRing.style.cursor = 'pointer';
    equipRing.style.textDecoration = 'underline';
  } else {
    equipRing.innerText = '未装備';
    equipRing.classList.add('empty');
    equipRing.style.color = '';
    equipRing.style.cursor = '';
    equipRing.style.textDecoration = '';
  }

  // Inventory UI
  inventoryCount.innerText = `${state.inventory.length} / 10`;
  inventoryList.innerHTML = '';
  
  state.inventory.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'inventory-item';
    
    // Highlight selection during sorting
    if (index === selectedSortIndex) {
      li.style.border = '1px dashed #eab308';
      li.style.backgroundColor = 'rgba(234, 179, 8, 0.15)';
      li.style.boxShadow = '0 0 8px rgba(234, 179, 8, 0.2)';
    }

    // Move Up/Down buttons for sorting (mouse controls)
    const sortControls = document.createElement('div');
    sortControls.className = 'item-sort-controls';
    sortControls.style.display = 'flex';
    sortControls.style.flexDirection = 'column';
    sortControls.style.marginRight = '0.35rem';
    sortControls.style.gap = '2px';

    const sortUpBtn = document.createElement('button');
    sortUpBtn.style.padding = '0';
    sortUpBtn.style.width = '16px';
    sortUpBtn.style.height = '14px';
    sortUpBtn.style.fontSize = '8px';
    sortUpBtn.style.lineHeight = '1';
    sortUpBtn.style.border = '1px solid rgba(255,255,255,0.08)';
    sortUpBtn.style.backgroundColor = 'rgba(255,255,255,0.04)';
    sortUpBtn.style.color = 'var(--text-muted)';
    sortUpBtn.style.cursor = 'pointer';
    sortUpBtn.style.borderRadius = '2px';
    sortUpBtn.innerText = '▲';
    sortUpBtn.disabled = index === 0;
    sortUpBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      engine.swapInventoryItems(index, index - 1);
      updateHUD();
    });

    const sortDownBtn = document.createElement('button');
    sortDownBtn.style.padding = '0';
    sortDownBtn.style.width = '16px';
    sortDownBtn.style.height = '14px';
    sortDownBtn.style.fontSize = '8px';
    sortDownBtn.style.lineHeight = '1';
    sortDownBtn.style.border = '1px solid rgba(255,255,255,0.08)';
    sortDownBtn.style.backgroundColor = 'rgba(255,255,255,0.04)';
    sortDownBtn.style.color = 'var(--text-muted)';
    sortDownBtn.style.cursor = 'pointer';
    sortDownBtn.style.borderRadius = '2px';
    sortDownBtn.innerText = '▼';
    sortDownBtn.disabled = index === state.inventory.length - 1;
    sortDownBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      engine.swapInventoryItems(index, index + 1);
      updateHUD();
    });

    sortControls.appendChild(sortUpBtn);
    sortControls.appendChild(sortDownBtn);
    
    // Create inner structure
    const infoDiv = document.createElement('div');
    infoDiv.className = 'item-info';
    infoDiv.style.cursor = 'pointer';
    infoDiv.addEventListener('click', () => {
      if (window.innerWidth > 768) {
        openItemDetail(index);
      }
    });
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'item-details';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    nameSpan.style.color = item.color;
    nameSpan.innerText = item.name;
    
    detailsDiv.appendChild(nameSpan);
    
    infoDiv.appendChild(detailsDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';
    
    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-sm btn-primary';
    
    const keyNum = index === 9 ? '0' : (index + 1).toString();
    
    // Check if equipment or consumable
    const isRing = item.type.startsWith('ring_');
    const isEquip = item.type === 'weapon_sword' || item.type === 'armor_shield' || isRing;
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

    li.appendChild(sortControls);
    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);
    
    // Click on item row opens details on mobile screen
    li.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        openItemDetail(index);
      }
    });

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

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'shop-item-details';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'shop-item-name';
    nameSpan.style.color = item.color;
    nameSpan.innerText = item.name + (item.stock !== undefined ? ` (残:${item.stock})` : '');

    const descSpan = document.createElement('span');
    descSpan.className = 'shop-item-desc';
    descSpan.innerText = item.description;

    detailsDiv.appendChild(nameSpan);
    detailsDiv.appendChild(descSpan);
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
    
    if (item.stock !== undefined && item.stock <= 0) {
      buyBtn.disabled = true;
      buyBtn.innerText = '売り切れ';
      buyBtn.classList.remove('btn-primary');
      buyBtn.classList.add('btn-secondary');
      buyBtn.style.opacity = '0.5';
    } else if (state.gold < item.price) {
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

function openItemDetail(index: number, type: 'inventory' | 'weapon' | 'armor' | 'ring' = 'inventory') {
  let item: Item | null = null;
  selectedItemDetailType = type;

  if (type === 'inventory') {
    item = engine.state.inventory[index];
    selectedInventoryIndex = index;
  } else if (type === 'weapon') {
    item = engine.equippedWeapon;
    selectedInventoryIndex = -1;
  } else if (type === 'armor') {
    item = engine.equippedArmor;
    selectedInventoryIndex = -1;
  } else if (type === 'ring') {
    item = engine.equippedRing;
    selectedInventoryIndex = -1;
  }

  if (!item) return;
  
  // Set content
  itemDetailName.innerText = item.name;
  itemDetailName.style.color = item.color;
  
  // Determine type string
  let typeStr = 'その他';
  if (item.type === 'weapon_sword') typeStr = '武器';
  else if (item.type === 'armor_shield') typeStr = '防具';
  else if (
    item.type === 'ring_attack' ||
    item.type === 'ring_defense' ||
    item.type === 'ring_durability' ||
    item.type === 'ring_reflect' ||
    item.type === 'ring_heal'
  ) typeStr = '指輪';
  else if (item.type.startsWith('potion')) typeStr = '薬';
  else if (item.type.startsWith('scroll')) typeStr = '巻物';
  
  itemDetailType.innerText = typeStr;
  
  // Determine value string
  let valStr = item.value.toString();
  if (item.type === 'weapon_sword' || item.type === 'armor_shield') {
    const durStr = item.durability !== undefined ? ` (耐久:${item.durability}/${item.maxDurability})` : '';
    valStr = `+${item.value}${durStr}`;
  } else if (item.type === 'ring_attack' || item.type === 'ring_defense') {
    valStr = `効果量 +${item.value}`;
  } else if (item.type === 'ring_durability') {
    valStr = `耐久節約確率 ${item.value}%`;
  } else if (item.type === 'ring_reflect') {
    valStr = `反射割合 ${item.value}%`;
  } else if (item.type === 'ring_heal') {
    valStr = `${item.value}ターン毎にHP1回復`;
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
  const isRing = item.type.startsWith('ring_');
  const isEquip = item.type === 'weapon_sword' || item.type === 'armor_shield' || isRing;
  if (type === 'weapon' || type === 'armor' || type === 'ring') {
    itemDetailUseBtn.innerHTML = `装備を外す <kbd class="key-hint">Enter/E</kbd>`;
    itemDetailDropBtn.disabled = true;
    itemDetailDropBtn.style.opacity = '0.5';
  } else {
    itemDetailUseBtn.innerHTML = `${isEquip ? '装備する' : '使う'} <kbd class="key-hint">Enter/E</kbd>`;
    itemDetailDropBtn.disabled = false;
    itemDetailDropBtn.style.opacity = '1';
  }
  
  // Show modal
  itemDetailModal.classList.remove('hidden');
}

function closeItemDetail() {
  itemDetailModal.classList.add('hidden');
  selectedInventoryIndex = -1;
  selectedItemDetailType = 'inventory';
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

いま、新たな冒険者が覚悟を決め、迷宮の扉を開く ――`;

function startPrologue() {
  if (prologueText) {
    prologueText.innerHTML = '';
  }
  isPrologueActive = true;
  startGameBtn.classList.add('hidden');
  resumeGameBtn.classList.add('hidden');
  skipPrologueBtn.classList.remove('hidden');
  skipPrologueBtn.focus();
  
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
  
  // Show resume button if save data exists
  const hasSave = localStorage.getItem('generative-ai-roguelike-save') !== null;
  if (hasSave) {
    resumeGameBtn.classList.remove('hidden');
  }
  
  // Focus the start game button so that pressing Enter acts immediately
  startGameBtn.focus();
}

function skipPrologue() {
  finishPrologue();
}

let isMobileLayout = false;

function adjustLayoutForDevice() {
  const width = window.innerWidth;
  const tabContentArea = document.getElementById('mobile-tab-content-area');
  const pcHUD = document.getElementById('pc-hud-el');
  const pcBottomBar = document.getElementById('pc-bottom-bar');
  const gameContainer = document.querySelector('.game-container');

  const logsCard = document.getElementById('logs-card-el');
  const characterCard = document.getElementById('character-card-el');
  const inventoryCard = document.getElementById('inventory-card-el');
  const controlsEl = document.getElementById('pc-controls-el');

  if (!logsCard || !characterCard || !inventoryCard || !controlsEl) return;

  if (width <= 768) {
    if (!isMobileLayout) {
      // Move cards to Mobile Tab Content Area
      tabContentArea?.appendChild(logsCard);
      tabContentArea?.appendChild(characterCard);
      tabContentArea?.appendChild(inventoryCard);

      // Create a mobile controls container in game-container if not exists
      let mobileControlsContainer = document.getElementById('mobile-controls-container');
      if (!mobileControlsContainer) {
        mobileControlsContainer = document.createElement('section');
        mobileControlsContainer.id = 'mobile-controls-container';
        mobileControlsContainer.className = 'game-controls';
        gameContainer?.appendChild(mobileControlsContainer);
      }
      mobileControlsContainer.appendChild(controlsEl);

      isMobileLayout = true;
      
      // Default tab on mobile setup
      switchTab('log');
    }
  } else {
    if (isMobileLayout) {
      // Restore cards to original PC HUD
      pcHUD?.appendChild(characterCard);
      pcHUD?.appendChild(inventoryCard);

      // Restore logs to PC Bottom Bar
      pcBottomBar?.insertBefore(logsCard, controlsEl);

      // Restore controls to PC Bottom Bar
      pcBottomBar?.appendChild(controlsEl);

      // Remove mobile controls container if exists
      const mobileControlsContainer = document.getElementById('mobile-controls-container');
      if (mobileControlsContainer) {
        mobileControlsContainer.remove();
      }

      // Restore PC styles by removing display styles or active class side effects
      [logsCard, characterCard, inventoryCard].forEach(card => {
        card.style.display = '';
      });

      isMobileLayout = false;
    }
  }
}

function switchTab(target: 'log' | 'inventory' | 'status') {
  [tabLog, tabInventory, tabStatus].forEach(btn => btn?.classList.remove('active'));
  [contentLog, contentInventory, contentStatus].forEach(content => {
    content?.classList.remove('active');
  });

  if (target === 'log') {
    tabLog?.classList.add('active');
    contentLog?.classList.add('active');
  } else if (target === 'inventory') {
    tabInventory?.classList.add('active');
    contentInventory?.classList.add('active');
  } else if (target === 'status') {
    tabStatus?.classList.add('active');
    contentStatus?.classList.add('active');
  }
}

function saveGame() {
  if (engine.state.status !== 'playing' && engine.state.status !== 'shop') return;

  engine.addMessage('【記録】冒険の記録（セーブ）を保存し、一時中断しました。');

  const saveData = {
    version: GAME_VERSION,
    timestamp: Date.now(),
    gameState: {
      status: engine.state.status,
      dungeonLevel: engine.state.dungeonLevel,
      tiles: engine.state.tiles,
      width: engine.state.width,
      height: engine.state.height,
      player: engine.state.player,
      enemies: engine.state.enemies,
      items: engine.state.items,
      messages: engine.state.messages,
      inventory: engine.state.inventory,
      gold: engine.state.gold,
      turn: engine.state.turn
    },
    equippedWeapon: engine.equippedWeapon,
    equippedArmor: engine.equippedArmor,
    equippedRing: engine.equippedRing,
    currentShopItems: engine.currentShopItems
  };

  try {
    localStorage.setItem('generative-ai-roguelike-save', JSON.stringify(saveData));
    alert('セーブが完了しました。タイトル画面に戻ります。');
    
    // Stop renderer, reset game engine state, show start overlay and trigger prologue to maintain active focus without full page reload
    renderer.stop();
    engine.reset();
    startOverlay.classList.remove('hidden');
    startPrologue();
    updateHUD();
  } catch (error) {
    console.error('セーブデータの保存に失敗しました:', error);
    alert('セーブに失敗しました。');
  }
}

function loadGame(): boolean {
  const rawData = localStorage.getItem('generative-ai-roguelike-save');
  if (!rawData) return false;

  try {
    let saveData = JSON.parse(rawData);
    
    // Version check and migration
    if (saveData.version !== GAME_VERSION) {
      console.warn(`古いバージョンのセーブデータ (${saveData.version}) を検出しました。`);
      saveData = migrateSaveData(saveData, saveData.version, GAME_VERSION);
    }

    // Apply to engine
    const state = saveData.gameState;
    engine.state.status = state.status;
    engine.state.dungeonLevel = state.dungeonLevel;
    engine.state.tiles = state.tiles;
    engine.state.width = state.width;
    engine.state.height = state.height;
    engine.state.player = state.player;
    engine.state.enemies = state.enemies;
    engine.state.items = state.items;
    engine.state.messages = state.messages;
    engine.state.inventory = state.inventory;
    engine.state.gold = state.gold;
    engine.state.turn = state.turn;

    engine.equippedWeapon = saveData.equippedWeapon;
    engine.equippedArmor = saveData.equippedArmor;
    engine.equippedRing = saveData.equippedRing || null;
    engine.currentShopItems = saveData.currentShopItems;

    // Delete save data immediately upon load (Roguelike suspend-resume rule)
    localStorage.removeItem('generative-ai-roguelike-save');
    return true;
  } catch (error) {
    console.error('ロード処理中にエラーが発生しました:', error);
    alert('セーブデータの読み込みに失敗しました。');
    return false;
  }
}

function migrateSaveData(saveData: any, fromVersion: string, toVersion: string): any {
  // Migration steps for schema changes
  console.log(`Migrating save data from version ${fromVersion} to ${toVersion}`);
  saveData.version = toVersion;
  return saveData;
}



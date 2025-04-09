const { app, BrowserWindow, ipcMain, Menu, dialog, globalShortcut } = require('electron');
const path = require('path');
const Store = require('electron-store');
const TwitchChatClient = require('./twitchClient');
const config = new Store();

let mainWindow = null;
let overlayWindow = null;
let twitchClient = null;
let isOverlayVisible = true;

function createMainWindow() {
  // Create a standard application window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Twitch Chat Overlay',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false, // Don't show until ready-to-show
    backgroundColor: '#1a1a1a',
    autoHideMenuBar: true, // Hide the menu bar by default
    // If you want to completely remove the menu bar, uncomment the next line:
    // frame: false, // Remove window frame completely (no title bar or menu)
  });

  // Remove application menu completely
  Menu.setApplicationMenu(null);
  
  // Load the main application interface
  mainWindow.loadFile('index.html');
  
  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  // Handle window closing
  mainWindow.on('closed', () => {
    mainWindow = null;
    
    // Quit the entire application when main window is closed
    app.quit();
  });
  
  // Optionally remove any close confirmation if that exists
  // since we're treating the main window as the primary controller now
  mainWindow.removeAllListeners('close');
}

function createOverlayWindow() {
  const overlayX = parseInt(config.get('overlay.x', 20));
  const overlayY = parseInt(config.get('overlay.y', 20));
  const overlayWidth = parseInt(config.get('overlay.width', 350));
  const overlayHeight = parseInt(config.get('overlay.height', 500));
  const startHidden = config.get('overlay.startHidden', false);

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x: overlayX,
    y: overlayY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: !startHidden, // Set initial visibility
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.loadFile('overlay.html');
  
  // Make overlay click-through by default
  overlayWindow.setIgnoreMouseEvents(true);
  
  // Update isOverlayVisible to match actual state
  isOverlayVisible = !startHidden;
  
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Preferences',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-settings-tab');
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Overlay',
      submenu: [
        {
          label: isOverlayVisible ? 'Hide Overlay' : 'Show Overlay',
          click: toggleOverlayVisibility
        },
        {
          label: 'Reset Overlay Position',
          click: resetOverlayPosition
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: showAboutDialog
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    title: 'About Twitch Chat Overlay',
    message: 'Twitch Chat Overlay',
    detail: 'Version 1.0.0\n\nA desktop application to display Twitch chat as an in-game overlay.',
    type: 'info',
    buttons: ['OK']
  });
}

function toggleOverlayVisibility() {
  isOverlayVisible = !isOverlayVisible;
  
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    if (isOverlayVisible) {
      overlayWindow.show();
    } else {
      overlayWindow.hide();
    }
  }
  
  // Update menu
  createApplicationMenu();
  
  // Also inform main window to update any UI elements related to overlay visibility
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('overlay-visibility-changed', isOverlayVisible);
  }
}

function resetOverlayPosition() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    const defaultX = 20;
    const defaultY = 20;
    const defaultWidth = 350;
    const defaultHeight = 500;
    
    // Save to config
    config.set('overlay.x', defaultX);
    config.set('overlay.y', defaultY);
    config.set('overlay.width', defaultWidth);
    config.set('overlay.height', defaultHeight);
    
    // Apply to window
    overlayWindow.setPosition(defaultX, defaultY);
    overlayWindow.setSize(defaultWidth, defaultHeight);
    
    // Notify user
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Overlay Reset',
      message: 'The overlay position and size have been reset to default values.'
    });
    
    // Update main window settings UI
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('overlay-settings-updated', {
        x: defaultX,
        y: defaultY,
        width: defaultWidth,
        height: defaultHeight
      });
    }
  }
}

function connectToTwitch(channel) {
  if (!channel || channel.trim() === '') return;
  
  if (twitchClient) {
    twitchClient.disconnect();
  }
  
  twitchClient = new TwitchChatClient(channel.trim());
  twitchClient.connect();
  
  twitchClient.onMessage((chatMessage) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('chat-message', chatMessage);
    }
    
    // Also send to main window if it exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('chat-message', chatMessage);
    }
  });
}

// New function to register global shortcuts
function registerShortcuts() {
  // Register Alt+Backspace shortcut for overlay interaction
  globalShortcut.register('Alt+Backspace', () => {
    toggleOverlayInteraction(true);
  });
  
  // Listen for the key up event from the renderer
  ipcMain.on('alt-key-released', () => {
    toggleOverlayInteraction(false);
  });
}

// New function to toggle overlay interaction mode
function toggleOverlayInteraction(interactive) {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    // Make overlay interactive or click-through
    overlayWindow.setIgnoreMouseEvents(!interactive);
    
    // Tell the overlay window about the interaction mode change
    overlayWindow.webContents.send('interaction-mode', interactive);
  }
}

// Set up all IPC handlers
function setupIPC() {
  // Mouse events for overlay interaction
  ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setIgnoreMouseEvents(ignore);
    }
  });
  
  // Move overlay window
  ipcMain.on('move-overlay', (event, { x, y }) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      const [currentX, currentY] = overlayWindow.getPosition();
      overlayWindow.setPosition(currentX + x, currentY + y);
      
      // Save position
      config.set('overlay.x', currentX + x);
      config.set('overlay.y', currentY + y);
    }
  });
  
  // Resize overlay window
  ipcMain.on('resize-overlay', (event, { width, height }) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setSize(width, height);
      
      // Save size
      config.set('overlay.width', width);
      config.set('overlay.height', height);
    }
  });
  
  // Settings update
  ipcMain.on('update-settings', (event, settings) => {
    // Save settings to config
    if (settings.channel) {
      config.set('twitchChannel', settings.channel);
      connectToTwitch(settings.channel);
    }
    
    if (settings.chatSettings) {
      config.set('chatSettings', settings.chatSettings);
      
      // Update overlay with new settings
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('settings-updated', settings);
      }
    }
    
    // Save and apply overlay settings
    if (settings.overlaySettings) {
      config.set('overlay.x', settings.overlaySettings.x);
      config.set('overlay.y', settings.overlaySettings.y);
      config.set('overlay.width', settings.overlaySettings.width);
      config.set('overlay.height', settings.overlaySettings.height);
      config.set('overlay.startHidden', settings.overlaySettings.startHidden);
      
      // Apply new position and size to existing overlay window
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.setSize(
          parseInt(settings.overlaySettings.width), 
          parseInt(settings.overlaySettings.height)
        );
        
        overlayWindow.setPosition(
          parseInt(settings.overlaySettings.x), 
          parseInt(settings.overlaySettings.y)
        );
        
        // Update overlay visibility if needed
        if (settings.overlaySettings.startHidden !== !isOverlayVisible) {
          isOverlayVisible = !settings.overlaySettings.startHidden;
          if (isOverlayVisible) {
            overlayWindow.show();
          } else {
            overlayWindow.hide();
          }
        }
      }
    }
  });
  
  // Toggle overlay visibility from renderer
  ipcMain.on('toggle-overlay', () => {
    toggleOverlayVisibility();
  });
  
  // Add this new handler for direct interaction toggle
  ipcMain.on('toggle-interaction', (event, interactive) => {
    toggleOverlayInteraction(interactive);
  });
}

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();
  setupIPC();
  registerShortcuts(); 
  
  // Load the saved channel if it exists
  const savedChannel = config.get('twitchChannel');
  if (savedChannel) {
    connectToTwitch(savedChannel);
  }
});

// Make sure overlay is closed properly
app.on('before-quit', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
  }
});

// Clean up shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
    createOverlayWindow();
  }
});

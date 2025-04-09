const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // For overlay
  onChatMessage: (callback) => {
    ipcRenderer.on('chat-message', (event, message) => callback(message));
  },
  onSettingsUpdated: (callback) => {
    ipcRenderer.on('settings-updated', (event, settings) => callback(settings));
  },
  setIgnoreMouseEvents: (ignore) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore);
  },
  moveOverlay: (x, y) => {
    ipcRenderer.send('move-overlay', { x, y });
  },
  resizeOverlay: (width, height) => {
    ipcRenderer.send('resize-overlay', { width, height });
  },
  altKeyReleased: () => {
    ipcRenderer.send('alt-key-released');
  },
  onInteractionModeChange: (callback) => {
    ipcRenderer.on('interaction-mode', (event, active) => callback(active));
  },
  toggleInteraction: (interactive) => {
    ipcRenderer.send('toggle-interaction', interactive);
  },
  
  // For main window
  sendChatMessage: (message) => {
    ipcRenderer.send('chat-message', message);
  },
  updateSettings: (settings) => {
    ipcRenderer.send('update-settings', settings);
  },
  toggleOverlay: () => {
    ipcRenderer.send('toggle-overlay');
  },
  onShowSettingsTab: (callback) => {
    ipcRenderer.on('show-settings-tab', () => callback());
  },
  onOverlayVisibilityChanged: (callback) => {
    ipcRenderer.on('overlay-visibility-changed', (event, visible) => callback(visible));
  },
  onOverlaySettingsUpdated: (callback) => {
    ipcRenderer.on('overlay-settings-updated', (event, settings) => callback(settings));
  },
  getScreenInfo: () => {
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  }
});

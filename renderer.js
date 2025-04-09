// This file is used to connect the Twitch chat client
// to the renderer process of the main window

const TwitchChatClient = require('./twitchClient');
let twitchClient = null;

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  const savedChannel = localStorage.getItem('twitchChannel');
  
  if (savedChannel) {
    connect(savedChannel);
  }
  
  // Listen for settings updates
  window.electronAPI.onSettingsUpdated((settings) => {
    if (settings.channel && (!twitchClient || twitchClient.channel !== settings.channel)) {
      connect(settings.channel);
    }
  });
});

function connect(channel) {
  // Disconnect existing client if there is one
  if (twitchClient) {
    twitchClient.disconnect();
  }
  
  // Create new client
  twitchClient = new TwitchChatClient(channel);
  
  console.log(`Connected to channel: ${channel}`);
}

// Listen for chat messages from the client and forward to the main process
if (twitchClient) {
  twitchClient.client.on('message', (channel, tags, message, self) => {
    const chatMessage = {
      id: tags.id,
      username: tags['display-name'] || tags.username,
      color: tags.color,
      message: message,
      emotes: tags.emotes,
      badges: tags.badges,
      timestamp: new Date(),
      isMod: tags.mod,
      isSubscriber: tags.subscriber
    };
    
    window.electronAPI.sendChatMessage(chatMessage);
  });
}

const tmi = require('tmi.js');

class TwitchChatClient {
  constructor(channel) {
    this.channel = channel;
    this.client = null;
    this.connected = false;
    this.messageCallback = null;
  }
  
  connect() {
    if (this.client) {
      this.disconnect();
    }
    
    console.log(`Connecting to Twitch channel: ${this.channel}`);
    
    this.client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true
      },
      channels: [this.channel]
    });
    
    this.client.on('message', (channel, tags, message, self) => {
      if (this.messageCallback) {
        const chatMessage = {
          id: tags.id,
          username: tags['display-name'] || tags.username,
          color: tags.color || this.getRandomColor(tags.username),
          message: message,
          emotes: tags.emotes,
          badges: tags.badges,
          timestamp: new Date(),
          isMod: tags.mod,
          isSubscriber: tags.subscriber
        };
        
        this.messageCallback(chatMessage);
      }
    });
    
    this.client.on('connected', () => {
      console.log(`Connected to ${this.channel}'s chat`);
      this.connected = true;
    });
    
    this.client.on('disconnected', () => {
      console.log(`Disconnected from ${this.channel}'s chat`);
      this.connected = false;
    });
    
    this.client.connect().catch(err => {
      console.error('Error connecting to Twitch:', err);
    });
  }
  
  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.connected = false;
    }
  }
  
  onMessage(callback) {
    this.messageCallback = callback;
  }
  
  // Generate consistent colors for usernames without a color set
  getRandomColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }
}

module.exports = TwitchChatClient;

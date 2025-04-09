# Twitch Chat Overlay

A desktop application that displays Twitch chat as an in-game overlay. Built with Electron, this application allows you to view chat messages while playing games in fullscreen or windowed mode. The application runs with a clean interface without a menu bar.

<!-- ![Twitch Chat Overlay Screenshot](assets/screenshot.png) -->

## Features

- Display Twitch chat as a transparent overlay on top of any game or application
- Customizable appearance (font size, background color, opacity)
- Adjustable overlay position and size
- Auto-scrolling chat with ability to pause
- Click-through functionality (overlay won't interfere with your game)
- Emote support
- Dark theme interface

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (included with Node.js)

### Setup

1. Clone the repository or download the source code:
   ```
   git clone https://github.com/yourusername/twitch-chat-overlay.git
   ```

2. Navigate to the project directory:
   ```
   cd twitch-chat-overlay
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the application:
   ```
   npm start
   ```

## Usage

1. **Initial Setup**:
   - Enter your favorite Twitch channel name in the settings
   - Customize the appearance, position, and size of the overlay
   - Click "Save Settings"

2. **Interacting with the Overlay**:
   - Press `Alt+Backspace` to make the overlay interactive
   - While holding Alt, drag the top purple bar to move the overlay
   - While holding Alt, drag the bottom-right corner to resize
   - Release Alt to make the overlay click-through again

3. **Reading Chat**:
   - Chat messages will automatically scroll
   - Scroll up to temporarily pause auto-scrolling
   - A notification will show how many new messages you've missed
   - Scroll back down or click the notification to resume auto-scrolling

## Customization

### Chat Settings

- **Font Size**: Adjust the text size for better readability
- **Background Color**: Change the background color of the overlay
- **Background Opacity**: Make the overlay more or less transparent
- **Maximum Messages**: Control how many messages are visible at once
- **Show Timestamps**: Toggle message timestamps

### Overlay Settings

- **Position**: Choose from preset positions or set a custom position
- **Size**: Adjust the width and height of the overlay
- **Visibility**: Option to start with overlay hidden

## System Requirements

- Windows 7/8/10/11
- macOS 10.12+
- Linux (Tested on Ubuntu 18.04+)
- 4GB RAM
- 100MB disk space

## Technologies Used

- [Electron](https://www.electronjs.org/): Cross-platform desktop application framework
- [tmi.js](https://github.com/tmijs/tmi.js): Twitch chat connection library
- [electron-store](https://github.com/sindresorhus/electron-store): Configuration storage

## Development

To build the application:

```
npm run build
```

To package the application for distribution:

```
npm run package
```

## Building the Application

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (included with Node.js)
- Git (optional, for cloning the repository)

### Development Setup

1. Clone or download the repository:
   ```
   git clone https://github.com/yourusername/twitch-chat-overlay.git
   ```

2. Navigate to the project directory:
   ```
   cd twitch-chat-overlay
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the application in development mode:
   ```
   npm start
   ```

### Building for Distribution

1. Install development dependencies:
   ```
   npm install --save-dev electron-builder
   ```

2. Build for your platform:
   ```
   npm run build
   ```

   This will create distributable packages in the `dist` folder.

3. Platform-specific builds:
   - Windows: `npm run build:win`
   - macOS: `npm run build:mac`
   - Linux: `npm run build:linux`

### Creating Icons

For proper builds, you need platform-specific icon files in the `assets` folder:
- Windows: `icon.ico` (256x256 pixel)
- macOS: `icon.icns` (1024x1024 pixel)
- Linux: `icon.png` (512x512 pixel)

You can use online tools to convert between formats.

### Troubleshooting Build Issues

- If you encounter errors related to missing dependencies, try running:
  ```
  npm install --save-dev @electron/rebuild
  npx @electron/rebuild
  ```

- For code signing errors, you may need to add a `--publish never` flag:
  ```
  npm run build -- --publish never
  ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Twitch](https://twitch.tv) for their chat API
- [Electron](https://www.electronjs.org/) community for the helpful resources
- All contributors and testers

## Attributions

- [Freepik](https://www.freepik.com/) for the icon for this application
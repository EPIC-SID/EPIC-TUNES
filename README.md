# Modern Discord Music Bot

A fully functional music bot supporting YouTube, Spotify, SoundCloud, and Apple Music.

## Features
- Supports multiple platforms (YT, Spotify, SoundCloud, Apple Music)
- Slash Commands (Modern Discord standard)
- High-quality audio playback
- Queue management

## Setup Instructions

### 1. Prerequisites
- Node.js 18 or higher
- FFmpeg (installed automatically via `ffmpeg-static`)

### 2. Discord Developer Portal Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a **New Application**.
3. Under the **Bot** tab:
   - Reset and copy the **Token**.
   - Enable **Message Content Intent** and **Guild Members Intent**.
4. Under the **General Information** tab:
   - Copy the **Application ID** (this is your Client ID).

### 3. Configuration
1. Open the `.env` file in the project root.
2. Fill in your token and client ID:
   ```env
   DISCORD_TOKEN=your_token_here
   CLIENT_ID=your_client_id_here
   ```

### 4. Installation & Deployment
1. Install dependencies (already done if you followed my steps):
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Register the slash commands:
   ```bash
   node dist/deploy-commands.js
   ```

### 5. Running the Bot
- For development (with auto-reload):
  ```bash
  npm run dev
  ```
- For production:
  ```bash
  npm start
  ```

## Commands
- `/play [query]` - Play a song or link.
- `/skip` - Skip the current song.
- `/stop` - Stop the music and clear the queue.
- `/queue` - See the upcoming songs.

## Project Structure
- `src/index.ts`: Main entry point.
- `src/commands/`: Slash command logic.
- `src/events/`: Player and client event handlers.
- `src/deploy-commands.ts`: Command registration script.

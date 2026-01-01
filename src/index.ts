import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize the Player
export const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});

// Load default extractors (YouTube, Spotify, etc.)
async function loadExtractors() {
    await player.extractors.loadDefault();
}

loadExtractors();

// Command handler setup
(client as any).commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        (client as any).commands.set(command.data.name, command);
    }
}

// Event handler for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = (client as any).commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('ready', () => {
    console.log(`🚀 Bot is online as ${client.user?.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

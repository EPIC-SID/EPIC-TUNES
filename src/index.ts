import { client } from './client.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Collection } from 'discord.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import player events (this will register DisTube event listeners)
await import('./events/playerEvents.js');

// Command handler setup
(client as any).commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file =>
    (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if ('data' in command.default && 'execute' in command.default) {
        (client as any).commands.set(command.default.data.name, command.default);
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
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on('ready', async () => {
    console.log(`🚀 Bot is online as ${client.user?.tag}!`);

    const commandData = (client as any).commands.map((c: any) => c.data.toJSON());

    try {
        console.log('Started refreshing application (/) commands.');

        // Register Globally (Primary)
        await client.application?.commands.set(commandData);

        // Clear per-guild commands to prevent duplicates (Global takes precedence)
        const guilds = client.guilds.cache;
        for (const [id, guild] of guilds) {
            try {
                await guild.commands.set([]); // Clear guild commands
                console.log(`Cleared guild-specific commands in: ${guild.name} (${id})`);
            } catch (error) {
                console.error(`Failed to clear guild commands in ${guild.name}:`, error);
            }
        }

        console.log('Successfully reloaded application (/) commands globally and cleaned up guild duplicates.');
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.DISCORD_TOKEN);

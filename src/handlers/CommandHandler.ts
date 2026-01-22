import * as fs from 'fs';
import * as path from 'path';
import { ExtendedClient } from '../structures/Client.js';
import { Command } from '../types/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(client: ExtendedClient) {
    const commandsPath = path.join(__dirname, '../commands');

    if (!fs.existsSync(commandsPath)) return;

    const commandFiles = fs.readdirSync(commandsPath).filter(file =>
        (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
    );

    for (const file of commandFiles) {
        const filePath = `file://${path.join(commandsPath, file)}`;
        try {
            const commandModule = await import(filePath);
            const command: Command = commandModule.default;
            if (command && command.data && (command as any).execute) {
                client.commands.set(command.data.name, command);
            } else {
                console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load command ${file}:`, error);
        }
    }
    console.log(`[INFO] Loaded ${client.commands.size} commands.`);
}

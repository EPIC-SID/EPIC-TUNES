import * as fs from 'fs';
import * as path from 'path';
import { ExtendedClient } from '../structures/Client.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadEvents(client: ExtendedClient) {
    const eventsPath = path.join(__dirname, '../events');

    if (!fs.existsSync(eventsPath)) return;

    const eventFiles = fs.readdirSync(eventsPath).filter(file =>
        (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
    );

    for (const file of eventFiles) {
        const filePath = `file://${path.join(eventsPath, file)}`;
        try {
            const eventModule = await import(filePath);
            const event = eventModule.default;

            if (event && event.name && event.execute) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load event ${file}:`, error);
        }
    }
    console.log(`[INFO] Loaded events from ${eventFiles.length} files.`);
}

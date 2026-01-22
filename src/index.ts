import { client } from './client.js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import http from 'http';

// -- Argument Parsing for Multi-Bot Support --
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const configArg = args.find(arg => arg.startsWith('--config='));

const envFile = envArg ? envArg.split('=')[1] : '.env';
if (envArg) console.log(`[Startup] Custom Env File: ${envFile}`);

dotenv.config({ path: envFile });

if (configArg) {
    const configFile = configArg.split('=')[1];
    process.env.CONFIG_FILE = path.resolve(configFile);
    console.log(`[Startup] Custom Config File: ${configFile}`);
}

// -- UPTIMEROBOT KEEP-ALIVE SYSTEM --
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Bot is Alive! 🤖");
    res.end();
});

server.listen(PORT, () => {
    console.log(`[Health-Check] Server running on port ${PORT}`);
});

server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`[Health-Check] Port ${PORT} is busy, moving on...`);
    } else {
        console.error(`[Health-Check] Server error:`, e);
    }
});
// ------------------------------------

// Import player events (DisTube)
await import('./events/playerEvents.js');
// Import legacy message handler (if we still want it separately? or move to events folder?)
// It was 'src/events/messageCreate.js'. Since our EventHandler loads *all* files in events, 
// if 'messageCreate.js' exports a standard event structure, it will be loaded automatically!
// Let's check 'src/events/messageCreate.ts' later.
// But wait, 'playerEvents.js' is NOT a standard event structure (it acts on distube instance).
// so we MUST import it manually here for side-effects.

// Start the client
await client.start();

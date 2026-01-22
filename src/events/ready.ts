import { Events } from 'discord.js';
import { ExtendedClient } from '../structures/Client.js';
import { ConfigManager } from '../utils/configManager.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: ExtendedClient) { // The client is passed as argument in ClientReady? No, usually no args or client is 'this'
        // Discord.js ClientReady passes the client as the first argument (if using client.on)
        // Wait, ClientReady provides the client as argument?
        // Docs say: ClientReady (client: Client)

        const botName = process.env.BOT_NAME || 'EPIC TUNES';

        if (botName === 'MFS MUSIC') {
            console.log(`
███╗   ███╗███████╗███████╗    ███╗   ███╗██╗   ██╗███████╗██╗ ██████╗ 
████╗ ████║██╔════╝██╔════╝    ████╗ ████║██║   ██║██╔════╝██║██╔════╝ 
██╔████╔██║█████╗  ███████╗    ██╔████╔██║██║   ██║███████╗██║██║      
██║╚██╔╝██║██╔══╝  ╚════██║    ██║╚██╔╝██║██║   ██║╚════██║██║██║      
██║ ╚═╝ ██║██║     ███████║    ██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗ 
╚═╝     ╚═╝╚═╝     ╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`);
        } else {
            console.log(`
███████╗██████╗ ██╗ ██████╗    ████████╗██╗   ██╗███╗   ██╗███████╗███████╗
██╔════╝██╔══██╗██║██╔════╝    ╚══██╔══╝██║   ██║████╗  ██║██╔════╝██╔════╝
█████╗  ██████╔╝██║██║            ██║   ██║   ██║██╔██╗ ██║█████╗  ███████╗
██╔══╝  ██╔═══╝ ██║██║            ██║   ██║   ██║██║╚██╗██║██╔══╝  ╚════██║
███████╗██║     ██║╚██████╗       ██║   ╚██████╔╝██║ ╚████║███████╗███████║
╚══════╝╚═╝     ╚═╝ ╚═════╝       ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚══════╝
`);
        }
        console.log(`${botName} IS ONLINE !!`);

        // Load Config
        ConfigManager.load();

        // Deploy Commands
        const commandData = client.commands.map((c: any) => c.data.toJSON());

        try {
            console.log('Started refreshing guild (/) commands.');

            // Register Globally
            await client.application?.commands.set(commandData);

            // Set Initial Status
            client.user?.setActivity({
                name: 'Music 🎶',
                type: 2 // ActivityType.Listening
            });

            // Clear per-guild commands (optional cleanup)
            const guilds = client.guilds.cache;
            for (const [id, guild] of guilds) {
                try {
                    // await guild.commands.set([]); // Optional: Keep or remove based on preference
                    // The original code had this.
                    await guild.commands.set([]);
                } catch (error) {
                    // Ignore
                }
            }

            console.log('Successfully reloaded guild (/) commands.');
        } catch (error) {
            console.error(error);
        }
    },
};

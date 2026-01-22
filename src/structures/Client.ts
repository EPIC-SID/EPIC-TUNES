import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../types/index.js';

export class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
    }

    public async start() {
        await this.registerModules();
        await this.login(process.env.DISCORD_TOKEN);
    }

    private async registerModules() {
        const { loadCommands } = await import('../handlers/CommandHandler.js');
        const { loadEvents } = await import('../handlers/EventHandler.js');

        await loadCommands(this);
        await loadEvents(this);
    }
}

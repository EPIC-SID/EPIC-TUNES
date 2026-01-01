import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

export const player = new Player(client);

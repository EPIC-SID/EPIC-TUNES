import { Events, Message } from 'discord.js';
import { client } from '../client.js';
import { ConfigManager } from '../utils/configManager.js';

// Legacy Text Command Handler (Shim)
client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot || !message.guild) return;

    const PREFIX = ConfigManager.getPrefix(message.guildId || '');
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = (client as any).commands.get(commandName);
    if (!command) return;

    // Create a "Fake" Interaction object to reuse the slash command logic
    const interactionShim = {
        isChatInputCommand: () => true, // spoof check
        replied: false,
        deferred: false,
        member: message.member,
        user: message.author,
        guildId: message.guildId,
        guild: message.guild,
        client: client,
        channel: message.channel,
        options: {
            getString: (name: string, required: boolean) => {
                // Determine logic based on command arg structure
                if (['play', 'filter', 'search'].includes(commandName)) {
                    return args.join(' ');
                }
                // For other commands like /loop mode
                return args[0];
            },
            getInteger: (name: string) => parseInt(args[0]),
            // Add other types if needed
            get: (name: string) => ({ value: args.join(' ') }) // Fallback
        },
        reply: async (options: any) => {
            // Text commands don't support ephemeral, so strip it to allow viewing
            if (options.ephemeral) delete options.ephemeral;
            // Store the response into this object so editReply can use it
            try {
                (interactionShim as any).response = await message.reply(options);
                (interactionShim as any).replied = true;
                return (interactionShim as any).response;
            } catch (e) {
                console.error('Shim Reply Error:', e);
            }
        },
        editReply: async (options: any) => {
            if ((interactionShim as any).response) {
                return (interactionShim as any).response.edit(options);
            }
            // If no initial reply (deferred), send new one
            return message.reply(options);
        },
        followUp: async (options: any) => {
            return message.reply(options);
        },
        deferReply: async () => {
            (interactionShim as any).deferred = true;
            // Can send a placeholder "Thinking..." messages if desired
            return;
        },
        deleteReply: async () => {
            if ((interactionShim as any).response) {
                try {
                    return await (interactionShim as any).response.delete();
                } catch (e) {
                    console.error('Shim Delete Error:', e);
                }
            }
            return;
        }
    };

    try {
        console.log(`[Text Command] Executing ${commandName} for ${message.author.tag}`);
        await command.execute(interactionShim);
    } catch (error) {
        console.error(error);
        message.reply('There was an error while executing this command!');
    }
});

import { Events, Message } from 'discord.js';
import { client, distube } from '../client.js';
import { ConfigManager } from '../utils/configManager.js';
import { ExtendedClient } from '../structures/Client.js';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if (!message.guild) return;

        // -- SETUP CHANNEL LOGIC --
        const setupChannelId = ConfigManager.getSetupChannelId(message.guild.id);
        if (setupChannelId && message.channel.id === setupChannelId) {
            // Delete user message to keep channel clean
            setTimeout(() => message.delete().catch(() => { }), 1000);

            if (message.author.bot) return;

            const voiceChannel = message.member?.voice?.channel;
            if (!voiceChannel) {
                const reply = await (message.channel as any).send(`❌ **${message.author}**, join a voice channel first!`);
                setTimeout(() => reply.delete().catch(() => { }), 3000);
                return;
            }

            try {
                // Using distube.play directly
                // We use the setup channel as the text channel for updates

                let query = message.content;

                // Validate if query is a URL
                const isUrl = /^(https?:\/\/)/.test(query);

                if (!isUrl) {
                    // Use ytsearch1: for native, fast search
                    query = `ytsearch1:${query}`;
                }

                await distube.play(voiceChannel, query, {
                    member: message.member,
                    textChannel: message.channel as any
                });
            } catch (e) {
                console.error('Setup Play Error:', e);
                const reply = await (message.channel as any).send(`❌ Error playing song: ${e instanceof Error ? e.message : 'Unknown error'}`);
                setTimeout(() => reply.delete().catch(() => { }), 5000);
            }
            return;
        }
        // -------------------------

        if (message.author.bot) return;

        const PREFIX = ConfigManager.getPrefix(message.guildId || '');
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        // Use the client from the message structure or the imported one (same instance)
        const client = message.client as ExtendedClient;
        const command = client.commands.get(commandName);
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
            await command.execute(interactionShim as any);
        } catch (error) {
            console.error(error);
            message.reply('There was an error while executing this command!');
        }
    }
};

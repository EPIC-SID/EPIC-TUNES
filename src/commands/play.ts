import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';
// @ts-ignore
import yts from 'yt-search';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube, Spotify, etc.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song you want to play (link or name)')
                .setRequired(true)),

    async execute(interaction: any) {
        let query = interaction.options.getString('query', true);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
        }

        await interaction.reply({ content: '🔍 Searching...', ephemeral: true });

        try {
            // Check if query is a URL
            const isUrl = /^(https?:\/\/)/.test(query);

            if (!isUrl) {
                const searchResults = await yts(query);
                if (!searchResults || !searchResults.videos.length) {
                    return interaction.editReply({ content: '❌ No results found on YouTube.' });
                }
                // Update query to the URL of the first result
                query = searchResults.videos[0].url;
                await interaction.editReply({ content: `🔍 Found: **${searchResults.videos[0].title}**\nAdding to queue...` });
            } else {
                await interaction.editReply({ content: '🔍 URL detected, adding to queue...' });
            }

            await distube.play(voiceChannel, query, {
                member: member,
                textChannel: interaction.channel
            });
        } catch (e) {
            console.error('[Play Command Error]', e);
            return interaction.editReply({ content: `❌ Error: ${e instanceof Error ? e.message : e}` });
        }
    },
};

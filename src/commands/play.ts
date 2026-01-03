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
            const isSpotifyTrack = query.includes('spotify.com/track/');

            if (isSpotifyTrack) {
                await interaction.editReply({ content: '🎵 Spotify link detected! Converting to YouTube for stable playback...' });
                try {
                    // Fetch Spotify page to get metadata
                    const response = await fetch(query);
                    const text = await response.text();
                    const titleMatch = text.match(/<title>(.*?)<\/title>/);

                    if (titleMatch && titleMatch[1]) {
                        // Title format is usually "Song - Artist | Spotify" or "Song - song by Artist | Spotify"
                        let searchTerm = titleMatch[1].replace(' | Spotify', '').replace(' - song by', ' -').trim();

                        await interaction.editReply({ content: `🔍 Found: **${searchTerm}**\nFinding best YouTube match...` });

                        const searchResults = await yts(searchTerm);
                        if (searchResults && searchResults.videos.length > 0) {
                            query = searchResults.videos[0].url;
                            await interaction.editReply({ content: `▶️ Playing: **${searchResults.videos[0].title}**` });
                        } else {
                            await interaction.editReply({ content: '⚠️ Could not find a match on YouTube. Trying original link...' });
                        }
                    }
                } catch (err) {
                    console.error('Spotify fetch error:', err);
                    await interaction.editReply({ content: '⚠️ Could not fetch Spotify metadata. Trying original link...' });
                }
            } else if (!isUrl) {
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

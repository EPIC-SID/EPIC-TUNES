import { SlashCommandBuilder, GuildMember, EmbedBuilder } from 'discord.js';
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

        const searchEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription('**🔍 Searching...**');
        await interaction.reply({ embeds: [searchEmbed], ephemeral: true });

        try {
            // Check if query is a URL
            const isUrl = /^(https?:\/\/)/.test(query);
            const isSpotifyTrack = query.includes('spotify.com/track/');

            if (isSpotifyTrack) {
                const convertingEmbed = new EmbedBuilder()
                    .setColor('#1DB954')
                    .setDescription('**🎵 Spotify link detected! Converting to YouTube...**');
                await interaction.editReply({ embeds: [convertingEmbed] });

                try {
                    // Fetch Spotify page to get metadata
                    const response = await fetch(query);
                    const text = await response.text();
                    const titleMatch = text.match(/<title>(.*?)<\/title>/);

                    if (titleMatch && titleMatch[1]) {
                        // Title format is usually "Song - Artist | Spotify" or "Song - song by Artist | Spotify"
                        let searchTerm = titleMatch[1].replace(' | Spotify', '').replace(' - song by', ' -').trim();

                        const foundEmbed = new EmbedBuilder()
                            .setColor('#5865F2')
                            .setDescription(`**🔍 Found: ${searchTerm}**\nFinding best YouTube match...`);
                        await interaction.editReply({ embeds: [foundEmbed] });

                        const searchResults = await yts(searchTerm);
                        if (searchResults && searchResults.videos.length > 0) {
                            query = searchResults.videos[0].url;
                            const playEmbed = new EmbedBuilder()
                                .setColor('#2ECC71')
                                .setDescription(`**▶️ Playing: [${searchResults.videos[0].title}](${query})**`)
                                .setThumbnail(searchResults.videos[0].thumbnail);
                            await interaction.editReply({ embeds: [playEmbed] });
                        } else {
                            const errorEmbed = new EmbedBuilder()
                                .setColor('#E74C3C')
                                .setDescription('**⚠️ Could not find a match on YouTube. Trying original link...**');
                            await interaction.editReply({ embeds: [errorEmbed] });
                        }
                    }
                } catch (err) {
                    console.error('Spotify fetch error:', err);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setDescription('**⚠️ Could not fetch Spotify metadata. Trying original link...**');
                    await interaction.editReply({ embeds: [errorEmbed] });
                }
            } else if (!isUrl) {
                const searchResults = await yts(query);
                if (!searchResults || !searchResults.videos.length) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setDescription('**❌ No results found on YouTube.**');
                    return interaction.editReply({ embeds: [errorEmbed] });
                }
                // Update query to the URL of the first result
                query = searchResults.videos[0].url;
                const foundEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setDescription(`**🔍 Found: [${searchResults.videos[0].title}](${query})**\nAdding to queue...`)
                    .setThumbnail(searchResults.videos[0].thumbnail);
                await interaction.editReply({ embeds: [foundEmbed] });
            } else {
                const urlEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setDescription('**🔍 URL detected, adding to queue...**');
                await interaction.editReply({ embeds: [urlEmbed] });
            }

            await distube.play(voiceChannel, query, {
                member: member,
                textChannel: interaction.channel
            });
        } catch (e) {
            console.error('[Play Command Error]', e);
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ Error')
                .setDescription(`${e instanceof Error ? e.message : e}`);
            return interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};

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
            return interaction.reply({ content: '❌ Connect to a voice channel first!', ephemeral: true });
        }

        const searchEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription('**🔎 Searching YouTube...**');
        await interaction.reply({ embeds: [searchEmbed], ephemeral: true });

        try {
            const isUrl = /^(https?:\/\/)/.test(query);
            const isSpotifyTrack = query.includes('spotify.com/track/');
            const isYoutubeLink = query.includes('youtube.com') || query.includes('youtu.be');

            let videoTitle = 'Unknown Song';
            let videoUrl = query;
            let videoThumb = undefined;
            let videoDuration = 'Unknown';

            if (isSpotifyTrack) {
                const convertingEmbed = new EmbedBuilder()
                    .setColor('#1DB954')
                    .setDescription('**💚 Spotify detected! Importing...**');
                await interaction.editReply({ embeds: [convertingEmbed] });

                try {
                    const response = await fetch(query);
                    const text = await response.text();
                    const titleMatch = text.match(/<title>(.*?)<\/title>/);

                    if (titleMatch && titleMatch[1]) {
                        let searchTerm = titleMatch[1].replace(' | Spotify', '').replace(' - song by', ' -').trim();

                        const searchResults = await yts(searchTerm);
                        if (searchResults && searchResults.videos.length > 0) {
                            const video = searchResults.videos[0];
                            query = video.url;
                            videoTitle = video.title;
                            videoUrl = video.url;
                            videoThumb = video.thumbnail;
                            videoDuration = video.timestamp;
                        } else {
                            throw new Error('No YouTube match found');
                        }
                    }
                } catch (err) {
                    console.error('Spotify error:', err);
                    const errorEmbed = new EmbedBuilder().setColor('#E74C3C').setDescription('❌ Could not resolve Spotify link.');
                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            } else if (isYoutubeLink) {
                const ytEmbed = new EmbedBuilder()
                    .setColor('#FF0000') // YouTube Red
                    .setDescription('**🔴 YouTube link detected! Processing...**');
                await interaction.editReply({ embeds: [ytEmbed] });

                try {
                    // yt-search usually handles URLs if parsed as a search or by videoId. 
                    // To be safe, let's just use the URL as the query for yts, it often finds it.
                    // Or extract ID. simple query usually works for yts.
                    const searchResults = await yts(query);
                    if (searchResults && (searchResults.videos.length > 0 || (searchResults as any).title)) {
                        // yts result structure varies for single video vs list
                        const video = searchResults.videos.length > 0 ? searchResults.videos[0] : (searchResults as any);
                        videoTitle = video.title;
                        videoUrl = video.url;
                        videoThumb = video.thumbnail;
                        videoDuration = video.timestamp;
                    }
                } catch (err) {
                    // Fallback to playing URL blindly if metadata fetch fails
                    console.log('Metadata fetch failed, playing URL directly');
                }
            } else if (!isUrl) {
                const searchResults = await yts(query);
                if (!searchResults || !searchResults.videos.length) {
                    const errorEmbed = new EmbedBuilder().setColor('#E74C3C').setDescription('❌ No results found.');
                    return interaction.editReply({ embeds: [errorEmbed] });
                }
                const video = searchResults.videos[0];
                query = video.url;
                videoTitle = video.title;
                videoUrl = video.url;
                videoThumb = video.thumbnail;
                videoDuration = video.timestamp;
            } else {
                // Direct URL (YouTube, etc.) - we can't easily get metadata before playing without ytdl-core directly or just letting distube handle it.
                // However, users usually want immediate feedback.
                // We'll rely on DisTube events for the "Now Playing" usually, but here we want an "Added" message.
                // For direct URLs, we might just say "Added URL".
                const urlEmbed = new EmbedBuilder().setColor('#5865F2').setDescription('**🔗 Link detected! Processing...**');
                await interaction.editReply({ embeds: [urlEmbed] });
            }

            // Only show the rich embed if we have metadata
            if (videoTitle !== 'Unknown Song') {
                const resultEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('💿 Added to Queue')
                    .setDescription(`**[${videoTitle}](${videoUrl})**`)
                    .setThumbnail(videoThumb || null)
                    .addFields(
                        { name: 'Duration', value: `\`${videoDuration}\``, inline: true },
                        { name: 'Requested By', value: `${member.user}`, inline: true }
                    );
                await interaction.editReply({ embeds: [resultEmbed] });
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

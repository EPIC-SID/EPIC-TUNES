import { SlashCommandBuilder, GuildMember, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

import { Theme } from '../utils/theme.js';

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
            return interaction.reply({ content: `${Theme.Icons.Error} Connect to a voice channel first!`, ephemeral: true });
        }

        // Defer reply immediately for better responsiveness
        await interaction.deferReply();

        // Check for playlist indicators in URL
        const isPlaylist = query.includes('list=') || query.includes('playlist') || query.includes('album');
        const searchMsg = isPlaylist ? `**${Theme.Icons.Loading} Loading Playlist... (This may take a while)**` : `**${Theme.Icons.Disc} Searching...**`;

        const searchEmbed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any) // Blurple for searching
            .setDescription(searchMsg);
        await interaction.editReply({ embeds: [searchEmbed] });

        try {
            // Check if query is a URL
            const isUrl = /^(https?:\/\/)/.test(query);

            // If it's not a URL, we use ytsearch1: to explicitly tell yt-dlp to search
            // This significantly reduces latency by skipping the manual search step
            if (!isUrl) {
                query = `ytsearch1:${query}`;
            }

            // Create a timeout promise to prevent hanging
            // Increased to 60s for large playlists
            const playPromise = distube.play(voiceChannel, query, {
                member: member,
                textChannel: interaction.channel
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out. The playlist might be too large.')), 60000)
            );

            await Promise.race([playPromise, timeoutPromise]);

            // If successful, delete the searching message
            // We use deleteReply inside a try-catch to avoid errors if it's already deleted
            try {
                await interaction.deleteReply();
            } catch (e) {
                // Ignore delete errors
            }

        } catch (e) {
            console.error('[Play Command Error]', e);
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any) // Red
                .setTitle(`${Theme.Icons.Error} Error`)
                .setDescription(`${e instanceof Error ? e.message : String(e)}`);

            // If interaction is still deferred/active, edit the reply to show error
            try {
                await interaction.editReply({ embeds: [errorEmbed] });
            } catch (err) {
                // If edit fails, try sending a new message
                interaction.channel?.send({ embeds: [errorEmbed] }).catch(() => { });
            }
        }
    },
};

import { SlashCommandBuilder, EmbedBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) {
            const emptyEmbed = new EmbedBuilder()
                .setColor('#95A5A6')
                .setDescription('**👻 The queue is currently empty!**');
            return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
        }

        const currentSong = queue.songs[0];
        const nextSongs = queue.songs.slice(1, 11);

        const embed = new EmbedBuilder()
            .setColor('#5865F2') // Blurple
            .setTitle('🎶 Current Queue')
            .setThumbnail(currentSong.thumbnail || null)
            .addFields(
                {
                    name: '💿 Now Playing',
                    value: `**[${currentSong.name}](${currentSong.url})**\nDuration: \`${currentSong.formattedDuration}\` | Requested by: ${currentSong.user}`,
                    inline: false
                }
            );

        if (nextSongs.length > 0) {
            const tracks = nextSongs.map((song, i) => {
                return `**${i + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\` (${song.user})`;
            }).join('\n');

            embed.addFields({ name: '⏳ Up Next', value: tracks, inline: false });
        } else {
            embed.addFields({ name: '⏳ Up Next', value: 'No upcoming songs.', inline: false });
        }

        const totalDuration = queue.formattedDuration;
        const totalSongs = queue.songs.length;

        embed.setFooter({ text: `Total Songs: ${totalSongs} | Total Duration: ${totalDuration}`, iconURL: 'https://cdn.discordapp.com/emojis/995646193796333578.webp' });

        if (queue.songs.length > 11) {
            const remaining = queue.songs.length - 11;
            embed.addFields({ name: 'Others', value: `...and **${remaining}** more songs`, inline: false });
        }

        return interaction.reply({ embeds: [embed] });
    },
};

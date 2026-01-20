import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows the currently playing song with progress'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        const song = queue.songs[0];
        const currentTime = queue.currentTime;
        const duration = song.duration;
        const progress = Math.min((currentTime / duration) * 100, 100);

        const size = 15;
        const progressInt = Math.round((progress * size) / 100);
        const emptyProg = size - progressInt;

        const bar = '▇'.repeat(progressInt) + Theme.Icons.Disc + '—'.repeat(emptyProg);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any)
            .setTitle(`${Theme.Icons.Disc} Now Playing`)
            .setDescription(`**[${song.name}](${song.url})**`)
            .setThumbnail(song.thumbnail || null)
            .addFields(
                {
                    name: `${Theme.Icons.Clock} Duration`,
                    value: `\`${queue.formattedCurrentTime}\` ${bar} \`${song.formattedDuration}\``,
                    inline: false
                },
                {
                    name: 'Requested By',
                    value: `${song.user}`,
                    inline: true
                },
                {
                    name: 'Volume',
                    value: `\`${queue.volume}%\``,
                    inline: true
                }
            );

        return interaction.reply({ embeds: [embed] });
    },
};

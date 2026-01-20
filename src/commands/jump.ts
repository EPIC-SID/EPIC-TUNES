import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('jump')
        .setDescription('Jump to a specific song in the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The position to jump to')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({ content: `${Theme.Icons.Error} No music is currently playing!`, ephemeral: true });
        }

        const position = interaction.options.getInteger('position');

        if (position >= queue.songs.length) {
            return interaction.reply({ content: `${Theme.Icons.Error} Invalid position! The queue only has **${queue.songs.length - 1}** upcoming songs.`, ephemeral: true });
        }

        try {
            const song = await queue.jump(position);
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Success as any) // Jump successful
                .setDescription(`${Theme.Icons.Skip} Jumped to **[${song.name}](${song.url})**`);

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: `${Theme.Icons.Error} An error occurred while trying to jump.`, ephemeral: true });
        }
    },
};

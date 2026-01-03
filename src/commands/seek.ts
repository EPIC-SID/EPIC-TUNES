import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a specific time in the song')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Time in seconds')
                .setRequired(true)
        ),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        const time = interaction.options.getInteger('seconds');
        queue.seek(time);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription(`**⏩ Seeked to ${time} seconds!**`);

        return interaction.reply({ embeds: [embed] });
    },
};

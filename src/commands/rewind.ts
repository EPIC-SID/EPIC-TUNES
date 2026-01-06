import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Rewind the song by seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Seconds to rewind (default: 10)')
                .setMinValue(1)
        ),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        const seconds = interaction.options.getInteger('seconds') || 10;
        const currentField = queue.currentTime;
        let seekTime = currentField - seconds;

        if (seekTime < 0) {
            seekTime = 0; // Prevent seeking before start
        }

        try {
            queue.seek(seekTime);
            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('⏪ Rewinding')
                .setDescription(`Rewound **${seconds}s**\nNow at: \`${queue.formattedCurrentTime}\``);

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `❌ Error: ${e}`, ephemeral: true });
        }
    },
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('forward')
        .setDescription('Fast forward the song by seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Seconds to seek forward (default: 10)')
                .setMinValue(1)
        ),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        const seconds = interaction.options.getInteger('seconds') || 10;
        const currentField = queue.currentTime;
        let seekTime = currentField + seconds;

        if (seekTime > queue.songs[0].duration) {
            seekTime = queue.songs[0].duration; // Prevent seeking past end
        }

        try {
            queue.seek(seekTime);
            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('⏩ Fast Forwarding')
                .setDescription(`Fast forwarded **${seconds}s**\nNow at: \`${queue.formattedCurrentTime}\``);

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `❌ Error: ${e}`, ephemeral: true });
        }
    },
};

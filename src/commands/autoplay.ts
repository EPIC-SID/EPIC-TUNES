import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggle autoplay mode'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        const autoplay = queue.toggleAutoplay();

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setDescription(`**♾️ Autoplay is now: ${autoplay ? 'On' : 'Off'}**`);

        return interaction.reply({ embeds: [embed] });
    },
};

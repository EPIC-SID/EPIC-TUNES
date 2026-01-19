import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggle autoplay mode'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **No music playing!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const autoplay = queue.toggleAutoplay();

        const embed = new EmbedBuilder()
            .setColor(autoplay ? '#3498DB' : '#95A5A6')
            .setTitle(autoplay ? '♾️ Autoplay Enabled' : '⏸️ Autoplay Disabled')
            .setDescription(autoplay ? '**I\'ll keep the party going endlessly!** 🚀' : '**Autoplay has been turned off.**')
            .setFooter({ text: `Action by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    },
};

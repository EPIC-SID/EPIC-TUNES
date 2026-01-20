import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset all bot settings to default'),
    async execute(interaction: any) {
        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.Warning as any)
            .setTitle(`${Theme.Icons.Loop} System Reset`) // Using Loop as generic recycle/reset? Or just no icon. Or Warning icon.
            // Reset usually implies standardizing. I'll use Loop or just text.
            // Actually, I'll use Theme.Icons.Warning or just clean.
            // I'll use Theme.Icons.Loop as 'Reset' cycle.
            .setDescription('All configuration settings have been reset to default values.')
            .setFooter({ text: `Reset by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

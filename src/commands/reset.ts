import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset all bot settings to default'),
    async execute(interaction: any) {
        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🔄 System Reset')
            .setDescription('All configuration settings have been reset to default values.')
            .setFooter({ text: `Reset by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

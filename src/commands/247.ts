import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ConfigManager } from '../utils/configManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggle 24/7 mode (stay in voice channel)'),
    async execute(interaction: any) {
        const currentStatus = ConfigManager.get247(interaction.guildId);
        const newStatus = !currentStatus;
        ConfigManager.set247(interaction.guildId, newStatus);

        const embed = new EmbedBuilder()
            .setColor(newStatus ? '#2ECC71' : '#E74C3C')
            .setTitle(newStatus ? '🟢 24/7 Mode Enabled' : '🔴 24/7 Mode Disabled')
            .setDescription(`The bot will ${newStatus ? 'now stay' : 'no longer stay'} in the voice channel 24/7.`)
            .setFooter({ text: `Mode changed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

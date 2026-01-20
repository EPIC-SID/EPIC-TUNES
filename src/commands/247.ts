import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ConfigManager } from '../utils/configManager.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggle 24/7 mode (stay in voice channel)'),
    async execute(interaction: any) {
        const currentStatus = ConfigManager.get247(interaction.guildId);
        const newStatus = !currentStatus;
        ConfigManager.set247(interaction.guildId, newStatus);

        const embed = new EmbedBuilder()
            .setColor(newStatus ? Theme.Colors.Success as any : Theme.Colors.Error as any)
            .setTitle(newStatus ? `${Theme.Icons.Success} 24/7 Mode Enabled` : `${Theme.Icons.Error} 24/7 Mode Disabled`)
            .setDescription(`The bot will ${newStatus ? 'now stay' : 'no longer stay'} in the voice channel 24/7.`)
            .setFooter({ text: `Mode changed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

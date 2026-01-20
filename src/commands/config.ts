import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ConfigManager } from '../utils/configManager.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure bot settings for the server'),
    async execute(interaction: any) {
        const currentPrefix = ConfigManager.getPrefix(interaction.guildId);

        const is247 = ConfigManager.get247(interaction.guildId);
        const djRoleId = ConfigManager.getDJRole(interaction.guildId);
        const djRole = djRoleId ? `<@&${djRoleId}>` : '`None`';

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.Success as any) // Configuration/Settings usually green or grey
            .setTitle(`${Theme.Icons.Tools} Server Configuration`) // Using Tools/Gear icon equivalent if I had one? Or just Settings. I don't have Settings icon. Info?
            // Actually, I don't have Tools. I have Info. Using Info or just generic emoji logic
            .setDescription('Current settings for this server:')
            .addFields(
                { name: 'Prefix', value: `\`${currentPrefix}\``, inline: true },
                { name: 'Language', value: '`English`', inline: true },
                { name: 'DJ Role', value: djRole, inline: true },
                { name: '24/7 Mode', value: is247 ? '`Enabled`' : '`Disabled`', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    },
};

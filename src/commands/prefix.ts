import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ConfigManager } from '../utils/configManager.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Set a custom prefix for text commands')
        .addStringOption(option =>
            option.setName('new_prefix')
                .setDescription('The new prefix to set')
                .setRequired(true)),
    async execute(interaction: any) {
        if (!interaction.guildId) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setTitle(`${Theme.Icons.Error} Error`)
                .setDescription('This command can only be used in a server.');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const newPrefix = interaction.options.getString('new_prefix');
        ConfigManager.setPrefix(interaction.guildId, newPrefix);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.Success as any)
            .setTitle('🔡 Prefix Updated')
            .setDescription(`Successfully changed the bot prefix to: \`${newPrefix}\``)
            .setFooter({ text: 'Prefix changed successfully', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('previous')
        .setDescription('Play the previous song'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **No music playing!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            await queue.previous();
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setTitle(`${Theme.Icons.Back} Rewind`)
                .setDescription('**Playing the previous track.**')
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **No previous song available!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

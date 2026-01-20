import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggle autoplay mode'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **No music playing!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const autoplay = queue.toggleAutoplay();

        const embed = new EmbedBuilder()
            .setColor(autoplay ? Theme.Colors.Info as any : Theme.Colors.Grey as any)
            .setTitle(autoplay ? `${Theme.Icons.Loop} Autoplay Enabled` : `${Theme.Icons.Pause} Autoplay Disabled`)
            .setDescription(autoplay ? '**I\'ll keep the party going endlessly!** 🚀' : '**Autoplay has been turned off.**')
            .setFooter({ text: `Action by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    },
};

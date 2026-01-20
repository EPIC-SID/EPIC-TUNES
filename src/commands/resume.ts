import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the paused song'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **No music playing!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (!queue.paused) {
            const infoEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Warning as any)
                .setDescription(`${Theme.Icons.Warning} **The song is already playing!**`); // Using Warning icon if available, or just generic
            return interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        }

        queue.resume();
        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.Success as any)
            .setTitle(`${Theme.Icons.Play} Resumed`)
            .setDescription('**The beat goes on!**\nPlayback resumed.')
            .setFooter({ text: `Resumed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    },
};

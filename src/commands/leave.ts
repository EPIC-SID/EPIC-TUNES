import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnect the bot'),
    async execute(interaction: any) {
        distube.voices.leave(interaction.guildId!);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.Warning as any) // Disconnect usually warning or error color, or just info.
            .setDescription(`${Theme.Icons.Stop} **Disconnected.**\nThanks for vibing! See you soon.`);

        return interaction.reply({ embeds: [embed] });
    },
};

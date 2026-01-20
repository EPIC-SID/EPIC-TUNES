import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the entire queue (except current song)'),

    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({ content: `${Theme.Icons.Error} No music is currently playing!`, ephemeral: true });
        }

        try {
            queue.songs.splice(1); // Keep the first song (currently playing)

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Success as any) // Success green
                .setDescription(`${Theme.Icons.Trash} **Queue Cleared!** (Only the current song remains)`);

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: `${Theme.Icons.Error} An error occurred while clearing the queue.`, ephemeral: true });
        }
    },
};

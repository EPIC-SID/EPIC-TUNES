import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { checkDJPermission } from '../utils/permissionUtils.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current song'),
    async execute(interaction: any) {
        // DJ Permission Check
        if (!checkDJPermission(interaction)) {
            return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this command!`, ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        if (queue.paused) {
            return interaction.reply({ content: '⚠️ The song is already paused!', ephemeral: true });
        }

        try {
            queue.pause();
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Warning as any) // Paused state
                .setTitle(`${Theme.Icons.Pause} Paused`)
                .setDescription('**Playback has been paused.**\nUse `/resume` to continue the vibe.');

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `${Theme.Icons.Error} Error: ${e}`, ephemeral: true });
        }
    },
};

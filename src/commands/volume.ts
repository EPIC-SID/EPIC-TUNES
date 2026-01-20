import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';
import { checkDJPermission } from '../utils/permissionUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Sets the volume of the music player')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),
    async execute(interaction: any) {
        // DJ Permission Check
        if (!checkDJPermission(interaction)) {
            return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this command!`, ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        const volume = interaction.options.getInteger('level');

        try {
            queue.setVolume(volume);

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Info as any)
                .setDescription(`**${Theme.Icons.VolumeUp} Volume set to ${volume}%**`);

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `❌ Error: ${e}`, ephemeral: true });
        }
    },
};

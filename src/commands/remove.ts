import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue by its number')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The position of the song to remove (check /queue)')
                .setRequired(true)
                .setMinValue(1)
                .setAutocomplete(true)),

    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({ content: `${Theme.Icons.Error} No music is currently playing!`, ephemeral: true });
        }

        const position = interaction.options.getInteger('position');

        // Check bounds
        // songs[0] is playing. songs[1] is position 1.
        if (position >= queue.songs.length) {
            return interaction.reply({ content: `${Theme.Icons.Error} Invalid position! The queue only has **${queue.songs.length - 1}** upcoming songs.`, ephemeral: true });
        }

        try {
            // Remove the song
            const removedSong = queue.songs.splice(position, 1)[0];

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any) // Red for removal
                .setDescription(`${Theme.Icons.Trash} Removed **[${removedSong.name}](${removedSong.url})** from the queue.`);

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: `${Theme.Icons.Error} An error occurred while trying to remove the song.`, ephemeral: true });
        }
    },
    async autocomplete(interaction: any) {
        const queue = distube.getQueue(interaction.guildId);

        if (!queue || queue.songs.length <= 1) {
            return interaction.respond([]);
        }

        const focusedValue = interaction.options.getFocused();
        const songs = queue.songs.slice(1); // Skip currently playing song
        const options = songs.map((song: any, index: number) => ({
            name: `${index + 1}. ${song.name}`.substring(0, 100),
            value: index + 1
        }));

        const filtered = options.filter((choice: any) => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(filtered.slice(0, 25));
    }
};

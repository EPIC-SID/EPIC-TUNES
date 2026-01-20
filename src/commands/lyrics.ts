import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { getSongLyrics, createLyricsEmbed } from '../utils/lyricsUtils.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for the current song or a specific query')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song to search for (optional)')
                .setRequired(false)
        ),
    async execute(interaction: any) {
        await interaction.deferReply();

        let query = interaction.options.getString('query');
        if (!query) {
            const queue = distube.getQueue(interaction.guildId!);
            if (queue && queue.songs.length > 0) {
                query = queue.songs[0].name;
            } else {
                return interaction.editReply({ content: `${Theme.Icons.Error} No music playing! Please provide a search query.` });
            }
        }

        try {
            const result = await getSongLyrics(query);

            if (!result) {
                return interaction.editReply({ content: `${Theme.Icons.Error} No lyrics found for **${query}**` });
            }

            const embed = createLyricsEmbed(result);
            await interaction.editReply({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: `${Theme.Icons.Error} Error fetching lyrics: ${e}` });
        }
    },
};

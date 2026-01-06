import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Client } from 'genius-lyrics';

const genius = new Client();

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
                return interaction.editReply({ content: '❌ No music playing! Please provide a search query.' });
            }
        }

        try {
            const searches = await genius.songs.search(query);
            if (searches.length === 0) {
                return interaction.editReply({ content: `❌ No lyrics found for **${query}**` });
            }

            const song = searches[0];
            const lyrics = await song.lyrics();

            if (!lyrics) {
                return interaction.editReply({ content: `❌ No lyrics text found for **${song.title}**` });
            }

            const embed = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle(`Lyrics for ${song.title}`)
                .setThumbnail(song.thumbnail)
                .setDescription(lyrics.length > 4096 ? lyrics.substring(0, 4093) + '...' : lyrics)
                .setFooter({ text: `Provided by Genius • ${song.artist.name}` });

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: `❌ Error fetching lyrics: ${e}` });
        }
    },
};

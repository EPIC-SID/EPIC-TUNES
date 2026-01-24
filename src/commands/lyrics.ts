import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { distube } from '../client.js';
import { getSongLyrics, createLyricsEmbed, chunkLyrics } from '../utils/lyricsUtils.js';
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

            const lyricsChunks = chunkLyrics(result.lyrics);
            const totalPages = lyricsChunks.length;
            let currentPage = 0;

            const getEmbed = (page: number) => {
                const chunk = lyricsChunks[page];
                return createLyricsEmbed({ ...result, lyrics: chunk }, page + 1, totalPages);
            };

            const getButtons = (page: number) => {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === totalPages - 1)
                    );
                return row;
            };

            const initialEmbed = getEmbed(currentPage);
            const initialComponents = totalPages > 1 ? [getButtons(currentPage)] : [];

            const message = await interaction.editReply({
                embeds: [initialEmbed],
                components: initialComponents
            });

            if (totalPages > 1) {
                const collector = message.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 300000 // 5 minutes
                });

                collector.on('collect', async (i: any) => {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: 'These buttons are not for you!', ephemeral: true });
                    }

                    if (i.customId === 'prev') {
                        currentPage = Math.max(0, currentPage - 1);
                    } else if (i.customId === 'next') {
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                    }

                    await i.update({
                        embeds: [getEmbed(currentPage)],
                        components: [getButtons(currentPage)]
                    });
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] }).catch(() => { });
                });
            }

        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: `${Theme.Icons.Error} Error fetching lyrics: ${e}` });
        }
    },
};

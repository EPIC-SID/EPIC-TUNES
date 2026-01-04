import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, GuildMember } from 'discord.js';
import { distube } from '../client.js';
// @ts-ignore
import yts from 'yt-search';

export default {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a song and choose from results')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song to search for')
                .setRequired(true)),

    async execute(interaction: any) {
        const query = interaction.options.getString('query', true);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Connect to a voice channel first!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const searchResults = await yts(query);
            if (!searchResults || !searchResults.videos.length) {
                return interaction.editReply({ content: '❌ No results found.' });
            }

            // Get top 10 videos
            const videos = searchResults.videos.slice(0, 10);

            const options = videos.map((v: any, i: number) => ({
                label: v.title.substring(0, 100), // Limit label length
                description: `Duration: ${v.timestamp} | ${v.author.name}`,
                value: v.url,
                emoji: '🎵'
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('search_select')
                .setPlaceholder('👇 Select a song to play')
                .addOptions(options);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`🔎 Results for "${query}"`)
                .setDescription('Select a song from the dropdown menu below to add it to the queue.')
                .setFooter({ text: 'Selection times out in 60 seconds' });

            const reply = await interaction.editReply({ embeds: [embed], components: [row] });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000
            });

            collector.on('collect', async (i: any) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: '❌ These results are not for you!', ephemeral: true });
                }

                const url = i.values[0];
                const selectedVideo = videos.find((v: any) => v.url === url);

                await i.update({ content: `✅ **Selected:** ${selectedVideo.title}`, embeds: [], components: [] });

                await distube.play(voiceChannel, url, {
                    member: member,
                    textChannel: interaction.channel
                });

                collector.stop();
            });

            collector.on('end', (collected: any, reason: string) => {
                if (reason === 'time') {
                    interaction.editReply({ content: '❌ Search timed out.', components: [] }).catch(() => { });
                }
            });

        } catch (e) {
            console.error(e);
            interaction.editReply({ content: '❌ An error occurred while searching.' });
        }
    },
};

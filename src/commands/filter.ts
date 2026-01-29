import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

// Filter descriptions for user guidance
const FILTER_DESCRIPTIONS: Record<string, string> = {
    'bassboost': 'Boosts low-frequency bass for that extra thump 🔊',
    'nightcore': 'Speeds up and pitches up the track for an energetic vibe ⚡',
    'vaporwave': 'Slows down and pitches down for a dreamy, lo-fi effect 🌊',
    'karaoke': 'Reduces vocals for sing-along sessions 🎤',
    '3d': 'Creates spatial 3D surround sound effect 🎧',
    'echo': 'Adds reverberating echo effects 🔔',
    'tremolo': 'Creates a wavering, trembling sound effect 〰️',
    'surround': 'Enhances surround sound experience 🔊',
    'reverse': 'Reverses the audio playback 🔄'
};

export default {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Apply audio filters to enhance your listening experience')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'Off (Clear All)', value: 'off' },
                    { name: 'Bassboost 🔊', value: 'bassboost' },
                    { name: 'Nightcore ⚡', value: 'nightcore' },
                    { name: 'Vaporwave 🌊', value: 'vaporwave' },
                    { name: 'Karaoke 🎤', value: 'karaoke' },
                    { name: '3D Audio 🎧', value: '3d' },
                    { name: 'Echo 🔔', value: 'echo' },
                    { name: 'Tremolo 〰️', value: 'tremolo' },
                    { name: 'Surround 🔊', value: 'surround' },
                    { name: 'Reverse 🔄', value: 'reverse' }
                )
        ),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            return interaction.reply({
                content: `${Theme.Icons.Error} No music is playing!`,
                ephemeral: true
            });
        }

        const filter = interaction.options.getString('type', true);

        if (filter === 'off') {
            queue.filters.clear();
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Success as any)
                .setTitle(`${Theme.Icons.Success} Filters Cleared`)
                .setDescription('**All audio filters have been removed.**\nBack to the original sound!')
                .setFooter({ text: 'Use /filter to apply effects again' });
            return interaction.reply({ embeds: [embed] });
        }

        try {
            // Clear previous filters for single-selection feel
            queue.filters.clear();
            queue.filters.add(filter);

            const description = FILTER_DESCRIPTIONS[filter] || 'Audio filter applied';
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Purple as any)
                .setTitle(`${Theme.Icons.Filter} Audio Filter Applied`)
                .setDescription(`**Effect:** \`${filter.toUpperCase()}\`\n${description}`)
                .addFields({
                    name: `${Theme.Icons.Music} Now Playing`,
                    value: `[${queue.songs[0].name}](${queue.songs[0].url})`,
                    inline: false
                })
                .setThumbnail(queue.songs[0].thumbnail || null)
                .setFooter({ text: 'Tip: Use /filter type:off to remove effects' });

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Filter error:', error);
            return interaction.reply({
                content: `${Theme.Icons.Error} Failed to apply filter. Please try again.`,
                ephemeral: true
            });
        }
    },
};

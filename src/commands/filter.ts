import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Apply audio filters')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'Off (Clear All)', value: 'off' },
                    { name: 'Bassboost', value: 'bassboost' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Vaporwave', value: 'vaporwave' },
                    { name: 'Karaoke', value: 'karaoke' },
                    { name: '3D', value: '3d' },
                    { name: 'Echo', value: 'echo' },
                    { name: 'Tremolo', value: 'tremolo' },
                    { name: 'Surround', value: 'surround' },
                    { name: 'Reverse', value: 'reverse' }
                )
        ),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music is playing!`, ephemeral: true });

        const filter = interaction.options.getString('type', true);

        if (filter === 'off') {
            queue.filters.clear();
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Success as any)
                .setDescription(`${Theme.Icons.Success} **All filters cleared.**`);
            return interaction.reply({ embeds: [embed] });
        }

        // Check if filter is already active to toggle it? 
        // DisTube v5 filters.add() usually toggles or adds.
        // Let's clear others for a cleaner effect, or just add?
        // Usually users want "Bassboost" OR "Nightcore".

        queue.filters.clear(); // Clear previous for single-selection feel
        queue.filters.add(filter);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any)
            .setTitle(`${Theme.Icons.Filter} Audio Filter Applied`)
            .setDescription(`**Mode selected:** \`${filter.toUpperCase()}\`\n*Enhancing audio stream...*`);

        return interaction.reply({ embeds: [embed] });
    },
};

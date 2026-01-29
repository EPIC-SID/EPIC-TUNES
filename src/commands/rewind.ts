import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { checkDJPermission, createDJPermissionError } from '../utils/permissionUtils.js';
import { Theme } from '../utils/theme.js';
import { formatDuration } from '../utils/formatters.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Rewind the current song by specified seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Number of seconds to rewind')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(300)
        ),
    async execute(interaction: any) {
        // DJ Permission Check
        if (!checkDJPermission(interaction)) {
            return interaction.reply({ embeds: [createDJPermissionError(interaction.guildId!)], ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            return interaction.reply({
                content: `${Theme.Icons.Error} No music is playing!`,
                ephemeral: true
            });
        }

        const seconds = interaction.options.getInteger('seconds', true);
        const currentTime = queue.currentTime;
        const newTime = Math.max(0, currentTime - seconds);

        try {
            await queue.seek(newTime);

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Info as any)
                .setTitle(`${Theme.Icons.Rewind} Rewound`)
                .setDescription(`**Rewound by ${seconds} seconds**`)
                .addFields(
                    {
                        name: 'Current Position',
                        value: `\`${formatDuration(newTime)}\` / \`${queue.songs[0].formattedDuration}\``,
                        inline: true
                    },
                    {
                        name: 'Now Playing',
                        value: `[${queue.songs[0].name}](${queue.songs[0].url})`,
                        inline: false
                    }
                )
                .setThumbnail(queue.songs[0].thumbnail || null)
                .setFooter({ text: 'Use /forward to skip ahead' });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Rewind error:', error);
            return interaction.reply({
                content: `${Theme.Icons.Error} Failed to rewind. The position might be invalid.`,
                ephemeral: true
            });
        }
    },
};

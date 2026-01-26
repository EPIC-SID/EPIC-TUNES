import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';
import { checkDJPermission } from '../utils/permissionUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Rewind the song by seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Seconds to rewind (default: 10)')
                .setMinValue(1)
        ),
    async execute(interaction: any) {
        // Check DJ permissions
        if (!checkDJPermission(interaction)) {
            return interaction.reply({
                content: `${Theme.Icons.Error} You need the DJ role or Administrator permission to use this command!`,
                ephemeral: true
            });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        const seconds = interaction.options.getInteger('seconds') || 10;
        const currentField = queue.currentTime;
        let seekTime = currentField - seconds;

        if (seekTime < 0) {
            seekTime = 0; // Prevent seeking before start
        }

        try {
            queue.seek(seekTime);
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setTitle(`${Theme.Icons.Rewind} Rewinding`)
                .setDescription(`Rewound **${seconds}s**\nNow at: \`${queue.formattedCurrentTime}\``)
                .setFooter({ text: 'EPIC TUNES • Advanced Audio System', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `${Theme.Icons.Error} Error: ${e}`, ephemeral: true });
        }
    },
};

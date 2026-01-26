import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';
import { checkDJPermission } from '../utils/permissionUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a specific time in the song')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Time in seconds')
                .setRequired(true)
                .setMinValue(0)
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

        let time = interaction.options.getInteger('seconds');

        // Validate seek time doesn't exceed song duration
        if (time > queue.songs[0].duration) {
            time = queue.songs[0].duration;
        }

        try {
            queue.seek(time);

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setTitle(`${Theme.Icons.Forward} Time Warp`)
                .setDescription(`Jumped to \`${queue.formattedCurrentTime}\``)
                .setFooter({ text: 'EPIC TUNES • Advanced Audio System', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: `${Theme.Icons.Error} Error: ${e}`, ephemeral: true });
        }
    },
};

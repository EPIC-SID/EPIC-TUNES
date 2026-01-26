import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';
import { checkDJPermission, checkSameVoiceChannel } from '../utils/permissionUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('forward')
        .setDescription('Fast forward the song by seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Seconds to seek forward (default: 10)')
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

        // Check voice channel
        const voiceError = checkSameVoiceChannel(interaction);
        if (voiceError) {
            return interaction.reply({ content: `${Theme.Icons.Error} ${voiceError}`, ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        const seconds = interaction.options.getInteger('seconds') || 10;
        const currentField = queue.currentTime;
        let seekTime = currentField + seconds;

        if (seekTime > queue.songs[0].duration) {
            seekTime = queue.songs[0].duration; // Prevent seeking past end
        }

        try {
            queue.seek(seekTime);
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setTitle(`${Theme.Icons.Forward} Fast Forwarding`)
                .setDescription(`Fast forwarded **${seconds}s**\nNow at: \`${queue.formattedCurrentTime}\``)
                .setFooter({ text: 'EPIC TUNES • Advanced Audio System', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: `${Theme.Icons.Error} Error: ${e}`, ephemeral: true });
        }
    },
};

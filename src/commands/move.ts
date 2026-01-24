import { SlashCommandBuilder, EmbedBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';
import { checkDJPermission } from '../utils/permissionUtils.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a song to a different position in the queue')
        .addIntegerOption(option =>
            option.setName('from')
                .setDescription('The position of the song to move')
                .setRequired(true)
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option.setName('to')
                .setDescription('The new position for the song')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction: any) {
        const member = interaction.member as GuildMember;

        if (!member.voice.channel) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **You need to be in a voice channel!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // DJ Permission Check
        if (!checkDJPermission(interaction)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **You need the \`DJ Role\` to use this command!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **No music playing!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (queue.songs.length <= 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **Not enough songs in the queue to move!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const fromIndex = interaction.options.getInteger('from');
        const toIndex = interaction.options.getInteger('to');

        // Validate Input
        // Note: Queue index 0 is playing. User input 1 relates to index 1.
        if (fromIndex >= queue.songs.length || toIndex >= queue.songs.length) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **Invalid position provided!** Max position currently is ${queue.songs.length - 1}.`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (fromIndex === toIndex) {
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **Destination is the same as origin!**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            const songToMove = queue.songs[fromIndex];

            // Remove from old position
            queue.songs.splice(fromIndex, 1);
            // Insert at new position
            queue.songs.splice(toIndex, 0, songToMove);

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Success as any)
                .setTitle(`${Theme.Icons.Success} Song Moved`)
                .setDescription(`Moved **[${songToMove.name}](${songToMove.url})**\nFrom position \`#${fromIndex}\` to \`#${toIndex}\``)
                .setFooter({ text: `Moved by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            const errorEmbed = new EmbedBuilder()
                .setColor(Theme.Colors.Error as any)
                .setDescription(`${Theme.Icons.Error} **An error occurred while moving the song.**`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

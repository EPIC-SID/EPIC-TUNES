import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

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
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        const time = interaction.options.getInteger('seconds');
        queue.seek(time);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any)
            .setDescription(`**${Theme.Icons.Forward} Creating time warp...**\nJumped to \`${time}s\`.`);

        return interaction.reply({ embeds: [embed] });
    },
};

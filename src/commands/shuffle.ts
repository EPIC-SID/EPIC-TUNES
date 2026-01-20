import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { checkDJPermission } from '../utils/permissionUtils.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the current queue'),
    async execute(interaction: any) {
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

        await queue.shuffle();

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any) // Or purple if we had it, but stick to theme
            .setTitle(`${Theme.Icons.Shuffle} Queue Shuffled`)
            .setDescription('**The queue has been randomized.**\nLet\'s see what plays next! 🎲')
            .setFooter({ text: `Shuffled by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    },
};

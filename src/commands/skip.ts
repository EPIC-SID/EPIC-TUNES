import { SlashCommandBuilder, EmbedBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';
import { checkDJPermission } from '../utils/permissionUtils.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),
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

        try {
            const song = await queue.skip();
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setDescription(`**${Theme.Icons.Skip} Skipped!**\nNow playing: **${song.name}**`)
                .setFooter({ text: `Skipped by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Warning as any)
                .setDescription(`**⚠️ Last song in queue.**\nType \`/stop\` to end or add more songs.`);
            return interaction.reply({ embeds: [embed] });
        }
    },
};

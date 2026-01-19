import { SlashCommandBuilder, GuildMember, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { checkDJPermission } from '../utils/permissionUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue'),
    async execute(interaction: any) {
        const member = interaction.member as GuildMember;

        if (!member.voice.channel) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **You need to be in a voice channel!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // DJ Permission Check
        if (!checkDJPermission(interaction)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **You need the `DJ Role` to use this command!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **No music playing!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        queue.stop();
        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🛑 Stopped')
            .setDescription('**Playback stopped and queue cleared.**\nSee you next time! 👋')
            .setFooter({ text: `Stopped by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    },
};

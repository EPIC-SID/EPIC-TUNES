import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the paused song'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **No music playing!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (!queue.paused) {
            const infoEmbed = new EmbedBuilder()
                .setColor('#F1C40F')
                .setDescription('⚠️ **The song is already playing!**');
            return interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        }

        queue.resume();
        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('▶️ Resumed')
            .setDescription('**The beat goes on!**\nPlayback resumed.')
            .setFooter({ text: `Resumed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    },
};

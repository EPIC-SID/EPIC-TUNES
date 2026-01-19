import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('previous')
        .setDescription('Play the previous song'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **No music playing!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            await queue.previous();
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('⏮️ Rewind')
                .setDescription('**Playing the previous track.**')
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setDescription('❌ **No previous song available!**');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

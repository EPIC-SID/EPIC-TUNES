import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('previous')
        .setDescription('Play the previous song'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        try {
            await queue.previous();
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setDescription('**⏮️ Rewinding...**\nPlaying the previous track.');
            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            return interaction.reply({ content: '❌ No previous song detected!', ephemeral: true });
        }
    },
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the paused song'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        if (!queue.paused) {
            return interaction.reply({ content: '⚠️ The song is already playing!', ephemeral: true });
        }

        queue.resume();
        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('▶️ Resumed')
            .setDescription('**The beat goes on!**\nPlayback resumed.');

        return interaction.reply({ embeds: [embed] });
    },
};

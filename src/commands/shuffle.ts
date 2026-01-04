import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the current queue'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        await queue.shuffle();

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🔀 Shuffled!')
            .setDescription('**The queue has been randomized.**\nLet\'s see what plays next!');

        return interaction.reply({ embeds: [embed] });
    },
};

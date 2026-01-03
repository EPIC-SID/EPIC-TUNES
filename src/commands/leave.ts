import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnect the bot'),
    async execute(interaction: any) {
        distube.voices.leave(interaction.guildId!);

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setDescription('**👋 Disconnected.**');

        return interaction.reply({ embeds: [embed] });
    },
};

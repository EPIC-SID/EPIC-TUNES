import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Summon the bot to your voice channel'),
    async execute(interaction: any) {
        const voiceChannel = interaction.member?.voice?.channel;
        if (!voiceChannel) return interaction.reply({ content: `${Theme.Icons.Error} Please join a voice channel first!`, ephemeral: true });

        distube.voices.join(voiceChannel);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.Success as any)
            .setDescription(`**${Theme.Icons.Success} Connected to ${voiceChannel}!**\nReference for high-quality audio.`);

        return interaction.reply({ embeds: [embed] });
    },
};

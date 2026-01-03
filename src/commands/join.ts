import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Summon the bot to your voice channel'),
    async execute(interaction: any) {
        const voiceChannel = interaction.member?.voice?.channel;
        if (!voiceChannel) return interaction.reply({ content: 'macam, join a voice channel first! ❌', ephemeral: true });

        distube.voices.join(voiceChannel);

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setDescription(`**🔊 Joined ${voiceChannel}!**`);

        return interaction.reply({ embeds: [embed] });
    },
};

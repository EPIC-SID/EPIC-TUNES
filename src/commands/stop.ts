import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue'),
    async execute(interaction: any) {
        const member = interaction.member as GuildMember;
        
        if (!member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
        }

        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        try {
            distube.stop(interaction.guildId!);
            return interaction.reply('🛑 Stopped the music!');
        } catch (e) {
            return interaction.reply(`Error stopping: ${e}`);
        }
    },
};

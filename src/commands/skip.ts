import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),
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
            await distube.skip(interaction.guildId!);
            return interaction.reply('⏩ Skipped the current song!');
        } catch (e) {
            // Usually throws if there is no up next song
            return interaction.reply({ content: '❌ No more songs to skip to (or error)!', ephemeral: true });
        }
    },
};

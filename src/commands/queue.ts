import { SlashCommandBuilder, EmbedBuilder, GuildMember } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!); 

        if (!queue) {
            return interaction.reply({ content: 'The queue is currently empty!', ephemeral: true });
        }

        const currentSong = queue.songs[0];
        // queue.songs includes the current song at index 0
        const tracks = queue.songs.slice(1, 11).map((song, i) => {
            return (i + 1) + '. **' + song.name + '** - `' + song.formattedDuration + '`';
        });

        let description = '**Now Playing:** ' + currentSong.name + ' - `' + currentSong.formattedDuration + '`\n\n';
        
        if (tracks.length > 0) {
            description += tracks.join('\n');
        } else {
            description += 'No upcoming songs.';
        }

        if (queue.songs.length > 11) {
            description += '\n...and ' + (queue.songs.length - 11) + ' more';
        }

        const embed = new EmbedBuilder()
            .setTitle('🎶 Current Queue')
            .setDescription(description)
            .setColor('#0099ff');

        return interaction.reply({ embeds: [embed] });
    },
};

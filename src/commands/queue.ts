import { SlashCommandBuilder, EmbedBuilder, GuildMember } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue'),
    async execute(interaction: any) {
        const queue = useQueue(interaction.guildId!);

        if (!queue || !queue.tracks.size) {
            return interaction.reply({ content: 'The queue is currently empty!', ephemeral: true });
        }

        const currentTrack = queue.currentTrack;
        const tracks = queue.tracks.toArray().slice(0, 10).map((track, i) => {
            return `${i + 1}. **${track.title}** - ${track.author}`;
        });

        const embed = new EmbedBuilder()
            .setTitle('🎶 Current Queue')
            .setDescription(`**Now Playing:** ${currentTrack?.title}\n\n${tracks.join('\n')}${queue.tracks.size > 10 ? `\n...and ${queue.tracks.size - 10} more` : ''}`)
            .setColor('#0099ff');

        return interaction.reply({ embeds: [embed] });
    },
};
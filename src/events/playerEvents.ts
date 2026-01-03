import { EmbedBuilder } from 'discord.js';
import { distube as distubeClient } from '../client.js';
import { Queue, Song, Playlist } from 'distube';

const distube = distubeClient as any;

const status = (queue: Queue) =>
    `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(', ') || 'Off'}\` | Loop: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

distube
    .on('playSong', (queue: Queue, song: Song) => {
        console.log('[Event] playSong triggered');
        const embed = new EmbedBuilder()
            .setColor('#5865F2') // Blurple
            .setTitle('🎶 Now Playing')
            .setDescription(`**[${song.name}](${song.url})**`)
            .setThumbnail(song.thumbnail!)
            .addFields(
                { name: 'Duration', value: `\`${song.formattedDuration}\``, inline: true },
                { name: 'Requested By', value: `${song.user}`, inline: true },
                { name: 'Status', value: status(queue), inline: false }
            )
            .setFooter({ text: 'time pass music', iconURL: 'https://cdn.discordapp.com/emojis/995646193796333578.webp' }); // Optional: Add a custom footer if desired

        queue.textChannel?.send({ embeds: [embed] });
    })
    .on('addSong', (queue: Queue, song: Song) => {
        console.log('[Event] addSong triggered');
        const embed = new EmbedBuilder()
            .setColor('#2ECC71') // Green
            .setTitle('✅ Added to Queue')
            .setDescription(`**[${song.name}](${song.url})**`)
            .setThumbnail(song.thumbnail!)
            .addFields(
                { name: 'Duration', value: `\`${song.formattedDuration}\``, inline: true },
                { name: 'Requested By', value: `${song.user}`, inline: true }
            );

        queue.textChannel?.send({ embeds: [embed] });
    })
    .on('addList', (queue: Queue, playlist: Playlist) => {
        console.log('[Event] addList triggered');
        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ Playlist Added')
            .setDescription(`**[${playlist.name}](${playlist.url})**`)
            .addFields(
                { name: 'Songs', value: `\`${playlist.songs.length}\``, inline: true },
                { name: 'Requested By', value: `${playlist.user}`, inline: true }
            );
        queue.textChannel?.send({ embeds: [embed] });
    })
    .on('error', (channel: any, e: any) => {
        console.log('[Event] error triggered');
        if (channel && typeof channel.send === 'function') {
            const embed = new EmbedBuilder()
                .setColor('#E74C3C') // Red
                .setTitle('❌ Error')
                .setDescription(e.toString().slice(0, 4096)); // Embed desc limit is 4096
            channel.send({ embeds: [embed] });
        }
        console.error('[DisTube Error]', e);
    })
    .on('finish', (queue: Queue) => {
        console.log('[Event] finish triggered');
        const embed = new EmbedBuilder()
            .setColor('#F1C40F') // Yellow
            .setDescription('🏁 **Queue finished!**');
        queue.textChannel?.send({ embeds: [embed] });
    })
    .on('disconnect', (queue: Queue) => {
        console.log('[Event] disconnect triggered');
        const embed = new EmbedBuilder()
            .setColor('#95A5A6') // Grey
            .setDescription('🔌 **Disconnected!**');
        queue.textChannel?.send({ embeds: [embed] });
    })
    .on('empty', (queue: Queue) => {
        console.log('[Event] empty triggered');
        const embed = new EmbedBuilder()
            .setColor('#95A5A6')
            .setDescription('👻 **Channel is empty. Leaving...**');
        queue.textChannel?.send({ embeds: [embed] });
    })
    .on('initQueue', (queue: Queue) => {
        console.log('[Event] initQueue triggered');
    })
    .on('debug', (message: string) => {
        console.log('[DisTube Debug]', message);
    })
    .on('ffmpegDebug', (text: string) => {
        console.log('[FFmpeg Debug]', text);
    });
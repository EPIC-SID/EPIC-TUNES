import { distube as distubeClient } from '../client.js';
import { Queue, Song, Playlist } from 'distube';

const distube = distubeClient as any;

distube
    .on('playSong', (queue: Queue, song: Song) => {
        queue.textChannel?.send('🎶 Now playing: **' + song.name + '** - `' + song.formattedDuration + '` by ' + song.user);
    })
    .on('addSong', (queue: Queue, song: Song) => {
        queue.textChannel?.send('✅ Added **' + song.name + '** - `' + song.formattedDuration + '` to the queue by ' + song.user);
    })
    .on('addList', (queue: Queue, playlist: Playlist) => {
        queue.textChannel?.send('✅ Added playlist **' + playlist.name + '** (' + playlist.songs.length + ' songs) to the queue by ' + playlist.user);
    })
    .on('error', (channel: any, e: any) => {
        if (channel && typeof channel.send === 'function') {
            channel.send('❌ An error encountered: ' + e.toString().slice(0, 1974));
        }
        console.error(e);
    })
    .on('finish', (queue: Queue) => {
        queue.textChannel?.send('🏁 Queue finished!');
    });

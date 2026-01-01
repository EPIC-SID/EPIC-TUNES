import { player } from '../index.js';

player.events.on('playerStart', (queue, track) => {
    const interaction = queue.metadata as any;
    interaction.channel.send(`🎶 Now playing: **${track.title}**!`);
});

player.events.on('audioTrackAdd', (queue, track) => {
    // We already send a message in the play command
});

player.events.on('error', (queue, error) => {
    console.log(`[Error] ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
    console.log(`[Player Error] ${error.message}`);
});
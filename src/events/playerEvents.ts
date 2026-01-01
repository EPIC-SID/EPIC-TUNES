import { player } from '../client.js';

player.events.on('playerStart', (queue, track) => {
    const interaction = queue.metadata as any;
    interaction.channel.send(`🎶 Now playing: **${track.title}**!`);
});

player.events.on('audioTrackAdd', (queue, track) => {
    // We already send a message in the play command
});

player.events.on('error', (queue, error) => {
    console.error(`[General Error] ${error.message}`);
    console.error(error);
});

player.events.on('playerError', (queue, error) => {
    console.error(`[Player Error] ${error.message}`);
    console.error(error);
});

player.events.on('debug', (queue, message) => {
    // Only log important debug messages to avoid console spam
    console.log(`[Debug] ${message}`);
});

player.on('debug', (message) => {
    console.log(`[General Debug] ${message}`);
});
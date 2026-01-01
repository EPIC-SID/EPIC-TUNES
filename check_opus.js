import { OpusEncoder } from '@discord-player/opus';

try {
    const encoder = new OpusEncoder(48000, 2);
    console.log('Opus encoder created successfully.');
} catch (e) {
    console.error('Failed to create Opus encoder:', e);
}

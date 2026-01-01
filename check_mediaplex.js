import { OpusEncoder } from 'mediaplex';

try {
    const encoder = new OpusEncoder(48000, 2);
    console.log('Mediaplex Opus encoder created successfully.');
} catch (e) {
    console.error('Failed to create Mediaplex Opus encoder:', e);
}

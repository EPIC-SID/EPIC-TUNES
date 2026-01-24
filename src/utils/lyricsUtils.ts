import { Client } from 'genius-lyrics';
import { EmbedBuilder } from 'discord.js';
import { Theme } from './theme.js';

const genius = new Client();

export const getSongLyrics = async (query: string) => {
    try {
        const searches = await genius.songs.search(query);
        if (!searches || searches.length === 0) {
            return null;
        }

        const song = searches[0];
        const lyrics = await song.lyrics();

        if (!lyrics) {
            return null;
        }

        return {
            title: song.title,
            artist: song.artist.name,
            thumbnail: song.thumbnail,
            lyrics: lyrics
        };
    } catch (e) {
        console.error('Error fetching lyrics:', e);
        return null;
    }
};

const CHUNK_SIZE = 2048;

export const chunkLyrics = (lyrics: string): string[] => {
    if (lyrics.length <= CHUNK_SIZE) return [lyrics];

    const chunks = [];
    let currentChunk = '';
    const lines = lyrics.split('\n');

    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > CHUNK_SIZE) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        currentChunk += (currentChunk ? '\n' : '') + line;
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
};

export const createLyricsEmbed = (data: { title: string, artist: string, thumbnail: string, lyrics: string }, page: number = 1, totalPages: number = 1) => {
    const embed = new EmbedBuilder()
        .setColor(Theme.Colors.PremiumBlue as any)
        .setTitle(`${Theme.Icons.Lyrics} Lyrics for ${data.title}`)
        .setThumbnail(data.thumbnail)
        .setDescription(data.lyrics)
        .setFooter({ text: `Provided by Genius • ${data.artist} • Page ${page}/${totalPages}` });

    return embed;
};

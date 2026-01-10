import { DisTubeError, PlayableExtractorPlugin, Playlist, Song } from 'distube';
import { spawn } from 'child_process';
import { request } from 'undici';
import fs from 'fs';
import path from 'path';
import dargs from 'dargs';

const YTDLP_DIR = path.join(process.cwd(), 'bin');
const YTDLP_IS_WINDOWS = process.platform === 'win32';
const YTDLP_FILENAME = `yt-dlp${YTDLP_IS_WINDOWS ? '.exe' : ''}`;
const YTDLP_PATH = path.join(YTDLP_DIR, YTDLP_FILENAME);
const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/' + YTDLP_FILENAME;

const makeRequest = async (url: string): Promise<any> => {
    const response = await request(url, { headers: { 'user-agent': 'distube' } });
    if (response.statusCode >= 400) throw new Error(`Cannot make requests to '${url}'`);
    if (response.statusCode >= 300 && response.headers.location) {
        return makeRequest(Array.isArray(response.headers.location) ? response.headers.location[0] : response.headers.location);
    }
    return response;
};

const download = async () => {
    if (fs.existsSync(YTDLP_PATH)) return;
    try {
        if (!fs.existsSync(YTDLP_DIR)) fs.mkdirSync(YTDLP_DIR, { recursive: true });
        const response = await makeRequest(YTDLP_URL);
        const buffer = await response.body.arrayBuffer();
        fs.writeFileSync(YTDLP_PATH, Buffer.from(buffer), { mode: 0o755 });
        console.log('[YtDlpPlugin] Downloaded yt-dlp binary');
    } catch (e) {
        console.error('[YtDlpPlugin] Failed to download yt-dlp:', e);
    }
};

const json = (url: string, flags: any) => {
    if (!fs.existsSync(YTDLP_PATH)) throw new Error('yt-dlp binary not found');
    const args = [url].concat(dargs(flags, { useEquals: false })).filter(Boolean);
    const child = spawn(YTDLP_PATH, args);
    return new Promise<any>((resolve, reject) => {
        let output = '';
        let error = '';
        child.stdout.on('data', d => output += d);
        child.stderr.on('data', d => error += d);
        child.on('close', code => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(output));
                } catch (e) {
                    // Sometimes yt-dlp outputs JSON lines, try parsing the first one or the whole thing?
                    // The original plugin does: output.toString().substring(output.toString().indexOf("{"))
                    const jsonPart = output.substring(output.indexOf('{'));
                    resolve(JSON.parse(jsonPart));
                }
            } else {
                reject(new Error(error || 'Process failed'));
            }
        });
    });
};

export class YtDlpPlugin extends PlayableExtractorPlugin {
    constructor(options?: any) {
        super();
        download().catch(console.error);
    }

    validate() { return true; }

    async resolve<T>(url: string, options: any): Promise<Song<T> | Playlist<T>> {
        // REMOVED: noCallHome: true
        const info = await json(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            skipDownload: true,
            simulate: true,
            ...options?.ytdlOptions
        }).catch((e: any) => {
            throw new DisTubeError('YTDLP_ERROR', `${e.message || e}`);
        });

        if (Array.isArray(info.entries)) { // Playlist
            return new Playlist({
                source: 'youtube',
                songs: info.entries.map((i: any) => new Song(i, { member: options.member, source: 'youtube', metadata: i } as any)),
                name: info.title,
                url: info.webpage_url,
                thumbnail: info.thumbnails?.[0]?.url
            }, options) as Playlist<T>;
        }
        return new Song(info, { member: options.member, source: 'youtube', metadata: info } as any) as Song<T>;
    }

    async getStreamURL(song: Song) {
        if (!song.url) {
            throw new DisTubeError('YTDLP_PLUGIN_INVALID_SONG', 'Cannot get stream url from invalid song.');
        }
        // REMOVED: noCallHome: true
        const info = await json(song.url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            skipDownload: true,
            simulate: true,
            format: 'ba/ba*'
        }).catch((e: any) => {
            throw new DisTubeError('YTDLP_ERROR', `${e.message || e}`);
        });
        return info.url as string;
    }

    getRelatedSongs() {
        return [];
    }
}

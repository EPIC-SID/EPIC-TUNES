/**
 * Formatting utilities for the bot
 * Provides consistent formatting for time, numbers, and visual elements
 */

import { Theme } from './theme.js';

/**
 * Formats seconds into HH:MM:SS or MM:SS format
 */
export const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats uptime in a human-readable format
 */
export const formatUptime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
};

/**
 * Formats large numbers with commas
 */
export const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
};

/**
 * Formats bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Creates a progress bar with custom length and style
 */
export interface ProgressBarOptions {
    length?: number;
    filledChar?: string;
    emptyChar?: string;
    indicator?: string;
    showPercentage?: boolean;
}

export const createProgressBar = (
    current: number,
    total: number,
    options: ProgressBarOptions = {}
): string => {
    const {
        length = 15,
        filledChar = '▇',
        emptyChar = '—',
        indicator = Theme.Icons.Disc,
        showPercentage = false
    } = options;

    if (total <= 0 || current < 0) return emptyChar.repeat(length);

    const percentage = Math.min((current / total) * 100, 100);
    const filled = Math.round((percentage * length) / 100);
    const empty = length - filled;

    let bar = filledChar.repeat(filled) + indicator + emptyChar.repeat(empty);

    if (showPercentage) {
        bar += ` ${percentage.toFixed(0)}%`;
    }

    return bar;
};

/**
 * Creates a visual percentage bar (for stats like memory usage)
 */
export const createPercentageBar = (percentage: number, length: number = 10): string => {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;

    const color = percentage > 80 ? '🟥' : percentage > 50 ? '🟨' : '🟩';
    return color.repeat(filled) + '⬜'.repeat(empty);
};

/**
 * Truncates text to a maximum length with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Formats a Discord timestamp for relative or absolute time
 */
export const formatTimestamp = (date: Date, style: 'R' | 'F' | 'D' | 'T' = 'R'): string => {
    const timestamp = Math.floor(date.getTime() / 1000);
    return `<t:${timestamp}:${style}>`;
};

/**
 * Pluralizes a word based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
};

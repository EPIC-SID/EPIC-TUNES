/**
 * Centralized logging utility for the bot
 * Provides consistent, color-coded logging with timestamps
 */

enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS'
}

class Logger {
    private static getTimestamp(): string {
        return new Date().toLocaleTimeString('en-US', { hour12: false });
    }

    private static formatMessage(level: LogLevel, message: string): string {
        const timestamp = this.getTimestamp();
        return `[${timestamp}] [${level}] ${message}`;
    }

    /**
     * Log debug information (only in development)
     */
    static debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            console.log('\x1b[36m%s\x1b[0m', this.formatMessage(LogLevel.DEBUG, message), ...args);
        }
    }

    /**
     * Log general information
     */
    static info(message: string, ...args: any[]): void {
        console.log('\x1b[34m%s\x1b[0m', this.formatMessage(LogLevel.INFO, message), ...args);
    }

    /**
     * Log warnings
     */
    static warn(message: string, ...args: any[]): void {
        console.warn('\x1b[33m%s\x1b[0m', this.formatMessage(LogLevel.WARN, message), ...args);
    }

    /**
     * Log errors
     */
    static error(message: string, error?: any): void {
        console.error('\x1b[31m%s\x1b[0m', this.formatMessage(LogLevel.ERROR, message));
        if (error) {
            if (error.stack) {
                console.error('\x1b[31m%s\x1b[0m', error.stack);
            } else {
                console.error('\x1b[31m%s\x1b[0m', error);
            }
        }
    }

    /**
     * Log success messages
     */
    static success(message: string, ...args: any[]): void {
        console.log('\x1b[32m%s\x1b[0m', this.formatMessage(LogLevel.SUCCESS, message), ...args);
    }

    /**
     * Log command execution
     */
    static command(guildName: string, userName: string, commandName: string): void {
        this.info(`Command executed: /${commandName} by ${userName} in ${guildName}`);
    }

    /**
     * Log music events
     */
    static music(event: string, details: string): void {
        this.info(`🎵 Music Event: ${event} - ${details}`);
    }
}

export default Logger;

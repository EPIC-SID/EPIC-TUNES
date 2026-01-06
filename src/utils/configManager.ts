import * as fs from 'fs';
import * as path from 'path';

interface GuildConfig {
    prefix?: string;
    djRole?: string;
    is247?: boolean;
    setupChannelId?: string;
    setupMessageId?: string;
}

interface ConfigData {
    [guildId: string]: GuildConfig;
}

export class ConfigManager {
    private static data: ConfigData = {};

    private static getConfigFile(): string {
        return process.env.CONFIG_FILE || path.resolve('config.json');
    }

    static load() {
        const configPath = this.getConfigFile();
        if (!fs.existsSync(configPath)) {
            this.data = {};
            this.save();
            return;
        }
        try {
            const raw = fs.readFileSync(configPath, 'utf-8');
            this.data = JSON.parse(raw);
        } catch (e) {
            console.error(`Failed to load ${configPath}`, e);
            this.data = {};
        }
    }

    static save() {
        const configPath = this.getConfigFile();
        fs.writeFileSync(configPath, JSON.stringify(this.data, null, 2));
    }

    static getPrefix(guildId: string): string {
        if (!this.data[guildId]) return process.env.PREFIX || '?';
        return this.data[guildId].prefix || process.env.PREFIX || '?';
    }

    static setPrefix(guildId: string, prefix: string) {
        if (!this.data[guildId]) this.data[guildId] = {};
        this.data[guildId].prefix = prefix;
        this.save();
    }

    static getDJRole(guildId: string): string | null {
        if (!this.data[guildId]) return null;
        return this.data[guildId].djRole || null;
    }

    static setDJRole(guildId: string, roleId: string | null) {
        if (!this.data[guildId]) this.data[guildId] = {};
        this.data[guildId].djRole = roleId || undefined;
        this.save();
    }

    static get247(guildId: string): boolean {
        if (!this.data[guildId]) return false;
        return !!this.data[guildId].is247;
    }

    static set247(guildId: string, is247: boolean) {
        if (!this.data[guildId]) this.data[guildId] = {};
        this.data[guildId].is247 = is247;
        this.save();
    }

    static getSetupChannelId(guildId: string): string | null {
        if (!this.data[guildId]) return null;
        return this.data[guildId].setupChannelId || null;
    }

    static setSetupChannelId(guildId: string, channelId: string | null) {
        if (!this.data[guildId]) this.data[guildId] = {};
        this.data[guildId].setupChannelId = channelId || undefined;
        this.save();
    }

    static getSetupMessageId(guildId: string): string | null {
        if (!this.data[guildId]) return null;
        return this.data[guildId].setupMessageId || null;
    }

    static setSetupMessageId(guildId: string, messageId: string | null) {
        if (!this.data[guildId]) this.data[guildId] = {};
        this.data[guildId].setupMessageId = messageId || undefined;
        this.save();
    }
}

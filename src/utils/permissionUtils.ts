import { Interaction, GuildMember, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { ConfigManager } from './configManager.js';
import { Theme } from './theme.js';

/**
 * Error response type for permission checks
 */
export interface PermissionError {
    message: string;
    embed?: EmbedBuilder;
}

/**
 * Checks if a user has permission to perform DJ actions.
 * - If no DJ role is configured for the guild, returns TRUE (everyone can control).
 * - If DJ role is configured, returns TRUE only if user has the role or is Admin.
 */
export const checkDJPermission = (interaction: Interaction): boolean => {
    if (!interaction.guild) return false;

    const member = interaction.member as GuildMember;
    if (!member) return false;

    // 1. Check for Administrator (always allow)
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

    // 2. Get DJ Role ID
    const djRoleId = ConfigManager.getDJRole(interaction.guild.id);

    // 3. If NO DJ role is set, allow everyone (Optional DJ Setup)
    if (!djRoleId) return true;

    // 4. Check if user has the specific role
    if (member.roles.cache.has(djRoleId)) return true;

    return false;
};

/**
 * Creates an enhanced error embed for DJ permission failures
 */
export const createDJPermissionError = (guildId: string): EmbedBuilder => {
    const djRoleId = ConfigManager.getDJRole(guildId);
    const roleText = djRoleId ? `<@&${djRoleId}>` : 'DJ Role';

    return new EmbedBuilder()
        .setColor(Theme.Colors.Error as any)
        .setTitle(`${Theme.Icons.Error} Permission Denied`)
        .setDescription(`You need the **${roleText}** role or **Administrator** permission to use this command.`)
        .setFooter({ text: 'Contact a server admin to get the required role' });
};

/**
 * Checks if the user is in a voice channel.
 * Returns an error embed if not, otherwise returns null.
 */
export const checkUserInVoice = (interaction: Interaction): EmbedBuilder | null => {
    const member = interaction.member as GuildMember;
    if (!member?.voice?.channel) {
        return new EmbedBuilder()
            .setColor(Theme.Colors.Warning as any)
            .setDescription(`${Theme.Icons.Warning} You need to be in a voice channel to use this command!`);
    }
    return null;
};

/**
 * Checks if the user is in the same voice channel as the bot.
 * Returns an error embed if not in same channel, otherwise returns null.
 */
export const checkSameVoiceChannel = (interaction: Interaction): EmbedBuilder | null => {
    if (!interaction.guild) {
        return new EmbedBuilder()
            .setColor(Theme.Colors.Error as any)
            .setDescription(`${Theme.Icons.Error} This command can only be used in a server!`);
    }

    const member = interaction.member as GuildMember;
    const botMember = interaction.guild.members.cache.get(interaction.client.user!.id);

    if (!member?.voice?.channel) {
        return new EmbedBuilder()
            .setColor(Theme.Colors.Warning as any)
            .setDescription(`${Theme.Icons.Warning} You need to be in a voice channel!`);
    }

    if (botMember?.voice?.channel && member.voice.channel.id !== botMember.voice.channel.id) {
        return new EmbedBuilder()
            .setColor(Theme.Colors.Warning as any)
            .setDescription(`${Theme.Icons.Warning} You need to be in the same voice channel as me!\n\nI'm currently in ${botMember.voice.channel}`);
    }

    return null;
};


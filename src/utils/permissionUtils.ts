import { Interaction, GuildMember, PermissionFlagsBits } from 'discord.js';
import { ConfigManager } from './configManager.js';

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
 * Checks if the user is in a voice channel.
 * Returns an error message if not, otherwise returns null.
 */
export const checkUserInVoice = (interaction: Interaction): string | null => {
    const member = interaction.member as GuildMember;
    if (!member?.voice?.channel) {
        return 'You need to be in a voice channel to use this command!';
    }
    return null;
};

/**
 * Checks if the user is in the same voice channel as the bot.
 * Returns an error message if not in same channel, otherwise returns null.
 */
export const checkSameVoiceChannel = (interaction: Interaction): string | null => {
    if (!interaction.guild) return 'This command can only be used in a server!';

    const member = interaction.member as GuildMember;
    const botMember = interaction.guild.members.cache.get(interaction.client.user!.id);

    if (!member?.voice?.channel) {
        return 'You need to be in a voice channel!';
    }

    if (botMember?.voice?.channel && member.voice.channel.id !== botMember.voice.channel.id) {
        return 'You need to be in the same voice channel as me!';
    }

    return null;
};


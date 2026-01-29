import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Theme } from '../utils/theme.js';
import { formatUptime, formatBytes, createPercentageBar, formatNumber } from '../utils/formatters.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows detailed bot statistics'),
    async execute(interaction: any) {
        try {
            const client = interaction.client;

            // Calculate memory usage
            const memoryUsage = process.memoryUsage();
            const totalMemoryMB = memoryUsage.heapTotal / 1024 / 1024;
            const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024;
            const memoryPercentage = (usedMemoryMB / totalMemoryMB) * 100;

            // Get server and user counts
            const serverCount = client.guilds.cache.size;
            const userCount = client.guilds.cache.reduce((acc: number, guild: any) => acc + guild.memberCount, 0);

            // Calculate uptime
            const uptimeMs = client.uptime || 0;
            const uptimeFormatted = formatUptime(uptimeMs);

            // Get voice connections
            const voiceConnections = client.guilds.cache.filter((guild: any) =>
                guild.members.cache.get(client.user!.id)?.voice?.channel
            ).size;

            // Ping calculation
            const ping = client.ws.ping;

            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setTitle(`${Theme.Icons.Chart} Bot Statistics`)
                .setThumbnail(client.user?.displayAvatarURL() || null)
                .setDescription(`**${client.user?.username}** is serving the community with high-quality music!`)
                .addFields(
                    {
                        name: `${Theme.Icons.Fire} Server Stats`,
                        value: [
                            `**Servers:** \`${formatNumber(serverCount)}\``,
                            `**Total Users:** \`${formatNumber(userCount)}\``,
                            `**Voice Channels:** \`${voiceConnections}\``,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: `${Theme.Icons.Settings} System Stats`,
                        value: [
                            `**Uptime:** \`${uptimeFormatted}\``,
                            `**Ping:** \`${ping}ms\``,
                            `**Node.js:** \`${process.version}\``,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: `${Theme.Icons.Chart} Memory Usage`,
                        value: [
                            `**Used:** \`${formatBytes(memoryUsage.heapUsed)}\``,
                            `**Total:** \`${formatBytes(memoryUsage.heapTotal)}\``,
                            `**Percentage:** \`${memoryPercentage.toFixed(1)}%\``,
                            createPercentageBar(memoryPercentage, 10),
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: `${Theme.Icons.Music} Additional Info`,
                        value: [
                            `**RSS:** \`${formatBytes(memoryUsage.rss)}\``,
                            `**External:** \`${formatBytes(memoryUsage.external)}\``,
                            `**Platform:** \`${process.platform}\``,
                        ].join('\n'),
                        inline: false
                    }
                )
                .setFooter({
                    text: `EPIC TUNES • Built with ❤️`,
                    iconURL: client.user?.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in stats command:', error);
            await interaction.reply({
                content: `${Theme.Icons.Error} An error occurred while fetching stats.`,
                ephemeral: true
            });
        }
    },
};

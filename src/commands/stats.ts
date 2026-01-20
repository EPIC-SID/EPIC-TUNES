import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';
import { Theme } from '../utils/theme.js';
import os from 'os';

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays technical statistics of the bot'),
    async execute(interaction: any) {
        const client = interaction.client;
        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.users.cache.size;
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any)
            .setTitle('📊 Epic Tunes Statistics')
            .setThumbnail(client.user?.displayAvatarURL())
            .setDescription('**System Status & Performance**')
            .addFields(
                { name: '🌐 Servers', value: `\`${totalGuilds}\``, inline: true },
                { name: '👥 Users', value: `\`${totalMembers}\``, inline: true },
                { name: '⏳ Uptime', value: `\`${days}d ${hours}h ${minutes}m\``, inline: true },
                { name: '📡 Ping', value: `\`${client.ws.ping}ms\``, inline: true },
                { name: '💾 Memory', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
                { name: '💻 Platform', value: `\`${os.platform()}\``, inline: true },
                { name: '🟢 Node.js', value: `\`${process.version}\``, inline: true },
                { name: '🔵 Discord.js', value: `\`v${djsVersion}\``, inline: true }
            )
            .setFooter({ text: 'EPIC TUNES • Advanced Audio System', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

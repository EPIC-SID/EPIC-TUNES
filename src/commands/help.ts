import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Opens the help dashboard'),
    async execute(interaction: any) {
        const { client, guild } = interaction;

        // Stats
        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.users.cache.size; // Approximation if cache is partial
        const uptime = process.uptime();
        const apiPing = client.ws.ping;
        const totalCommands = (client as any).commands.size;

        // Formatting Uptime
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Base Embed Data
        const authorName = 'Made by EPIC SID';
        const authorUrl = 'https://discord.gg/ckHzTAM9Kj';
        const footer = {
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
        };

        // Page Embeds
        const homeEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle('🔥 Ultimate Music Experience')
            .setDescription(`**Yo, ready to drop the beat?** 🎧\nI'm **${client.user.username}**, your high-quality music companion.\nUse the interactive menu below to explore my features!`)
            .addFields(
                {
                    name: '📊 System Status',
                    value: `>>> **Servers:** \`${totalGuilds}\`\n**Commands:** \`${totalCommands}\`\n**Ping:** \`${apiPing}ms\`\n**Uptime:** \`${uptimeString}\`\n\n**Made By:** [EPIC SID](https://discord.gg/ckHzTAM9Kj)`,
                    inline: false
                }
            )
            .setThumbnail(guild?.iconURL() || client.user.displayAvatarURL())
            .setFooter(footer);

        const musicEmbed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle('🎧 DJ Controls')
            .setDescription('**Take control of the vibe.**\nEverything you need to manage the queue and playback.')
            .addFields(
                { name: '▶️ Playback', value: '`/play`, `/pause`, `/resume`, `/stop`, `/skip`, `/previous`, `/seek`, `/autoplay`, `/loop`', inline: false },
                { name: '🎶 Queue Mgmt', value: '`/queue`, `/nowplaying`, `/shuffle`', inline: false },
                { name: '🎛️ Audio FX', value: '`/filter` (Bassboost, Nightcore, 8D, Vaporwave...)', inline: false }
            )
            .setFooter(footer);

        const configEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('⚙️ Server Config')
            .setDescription('**Customize your experience.**\nManage how the bot behaves in your server.')
            .addFields(
                { name: '🔊 Voice', value: '`/join`, `/leave`', inline: true },
                { name: '🔧 System', value: '`/247` (Coming Soon)', inline: true }
            )
            .setFooter(footer);

        const infoEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('ℹ️ Intel')
            .setDescription('**Behind the scenes info.**')
            .addFields(
                { name: '📚 Commands', value: '`/help` - Open this menu', inline: true }
            )
            .setFooter(footer);

        // Buttons
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('home_btn')
                    .setLabel('Home')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_btn')
                    .setLabel('Music')
                    .setEmoji('🎵')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('config_btn')
                    .setLabel('Config')
                    .setEmoji('⚙️')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('info_btn')
                    .setLabel('Info')
                    .setEmoji('ℹ️')
                    .setStyle(ButtonStyle.Secondary)
            );

        const reply = await interaction.reply({ embeds: [homeEmbed], components: [buttonRow], fetchReply: true });

        // Collector
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000
        });

        collector.on('collect', async (i: any) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: '❌ You cannot control this help menu!', ephemeral: true });
            }

            if (i.customId === 'home_btn') {
                await i.update({ embeds: [homeEmbed] });
            } else if (i.customId === 'music_btn') {
                await i.update({ embeds: [musicEmbed] });
            } else if (i.customId === 'config_btn') {
                await i.update({ embeds: [configEmbed] });
            } else if (i.customId === 'info_btn') {
                await i.update({ embeds: [infoEmbed] });
            }
        });

        collector.on('end', () => {
            // Disable buttons after timeout
            const disabledRow = new ActionRowBuilder<ButtonBuilder>(); // Explicitly typed if strict, or cast
            buttonRow.components.forEach((btn: any) => disabledRow.addComponents(ButtonBuilder.from(btn).setDisabled(true)));
            interaction.editReply({ components: [disabledRow] }).catch(() => { });
        });
    },
};

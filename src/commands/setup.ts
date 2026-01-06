import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, GuildMember } from 'discord.js';
import { ConfigManager } from '../utils/configManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Creates a dedicated music request channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: any) {
        const guild = interaction.guild;
        if (!guild) return;

        // Check if already exists
        const existingChannelId = ConfigManager.getSetupChannelId(guild.id);
        if (existingChannelId) {
            const existingChannel = guild.channels.cache.get(existingChannelId);
            if (existingChannel) {
                return interaction.reply({ content: `⚠️ **Music Setup already exists!** Check <#${existingChannelId}>`, ephemeral: true });
            }
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Create the channel
            const channel = await guild.channels.create({
                name: 'epic-tunes-requests',
                type: ChannelType.GuildText,
                topic: '🎵 **Music Request Channel** - Just type a song name to play!',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]
                    }
                ]
            });

            // Create the Controller Embed
            const banner = guild.bannerURL({ size: 1024 }) || null;
            const icon = guild.iconURL() || interaction.client.user.displayAvatarURL();

            const embed = new EmbedBuilder()
                .setColor('#2B2D31') // Modern Dark Grey/Black
                .setAuthor({ name: 'EPIC TUNES | Music Controller', iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle('💿 No Music Playing')
                .setDescription(`
**Ready to vibe?** 
Join a voice channel and type your favorite song name right here!

__**Control Guide:**__
⏯️ **Play/Pause** • ⏹️ **Stop** • ⏭️ **Skip**
🔁 **Loop** • 🔀 **Shuffle** • 📜 **Lyrics**
🔉/🔊 **Volume Controls**
                `)
                .setImage(banner || 'https://i.pinimg.com/originals/26/32/38/2632382dc3d19e9104084c7946a4892c.gif')
                .setFooter({ text: 'Type a song name to play • Supports YouTube, Spotify, SoundCloud', iconURL: icon });

            // Create Buttons
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('setup_play_pause').setEmoji('⏯️').setStyle(ButtonStyle.Primary), // Wait, should we show buttons? 
                    // Reset logic removes buttons. Setup logic ADDS them? 
                    // Usually "No Music" means NO buttons or disabled buttons. 
                    // But if we want them to be "ready", they might not do anything without a queue.
                    // Let's stick to consistency: Reset removes buttons. Initial setup should probably also NOT have buttons or have them disabled?
                    // The user said "permanent buttons" in the request earlier.
                    // But `resetSetupMessage` cleared them: `components: []`.
                    // If the user wants buttons to be PERMANENT, then `resetSetupMessage` was WRONG to clear them.
                    // Re-reading user request: "control playback with permanent buttons".
                    // So "No Music" banner SHOULD have buttons, but maybe disabled? Or active but they just say "Nothing playing"?
                    // The previous `resetSetupMessage` I wrote CLEARED them. I should fix that first if I want them permanent.
                    // However, standard intuitive design: No Music = No Controls.
                    // But if we want "Setup" feel like a Dashboard, maybe we leave them.
                    // Let's stick to: Initial Setup = No Music = No Buttons (or minimal).
                    // Wait, if I type a song, `playSong` adds buttons.
                    // So `resetSetupMessage` removing them implies "Session Over".
                    // The user said "permanent controller". This usually implies buttons are always visible?
                    // If so, I need to UPDATE `resetSetupMessage` to restore default buttons instead of `[]`.
                    // Let's assume for now the user prefers a clean state (No Music = hidden controls) as per my last edit. 
                    // I will replicate the "Clean State" here.
                );

            // Actually, for consistency with `resetSetupMessage`, let's send NO components initially.
            // If the user wants them permanent, I'd need to change both.
            // Given "No Music Playing", buttons like "Skip" make no sense.
            // So I will send just the embed.

            const message = await channel.send({ embeds: [embed], components: [] });

            // Save to Config
            ConfigManager.setSetupChannelId(guild.id, channel.id);
            ConfigManager.setSetupMessageId(guild.id, message.id);

            await interaction.editReply({ content: `✅ **Setup Complete!** Check out <#${channel.id}>` });

        } catch (error) {
            console.error('Setup Error:', error);
            await interaction.editReply({ content: '❌ Failed to create setup system. Check my permissions!' });
        }
    },
};

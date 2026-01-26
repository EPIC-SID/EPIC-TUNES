import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the invite link for the bot'),
    async execute(interaction: any) {
        // Generate dynamic invite link
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor(Theme.Colors.PremiumBlue as any)
            .setTitle('💌 Invite EPIC TUNES')
            .setDescription('Add me to your server and enjoy premium music features!\n\n✨ **Features:**\n• High-quality audio streaming\n• Multi-platform support (YouTube, Spotify, SoundCloud)\n• 24/7 music playback\n• Advanced queue management')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'EPIC TUNES • Advanced Audio System', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Link')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteUrl)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

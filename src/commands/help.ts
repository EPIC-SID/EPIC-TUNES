import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),
    async execute(interaction: any) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📚 Bot Commands')
            .setDescription('Here are the available commands you can use:')
            .setThumbnail(interaction.client.user?.displayAvatarURL())
            .addFields(
                {
                    name: '🎵 Music',
                    value: '`/play`, `/pause`, `/resume`, `/volume`, `/stop`, `/skip`, `/queue`, `/previous`, `/seek`, `/shuffle`, `/autoplay`, `/loop`',
                    inline: false
                },
                {
                    name: '🎛️ Filters',
                    value: '`/filter` (Bassboost, Nightcore, Vaporwave, etc.)',
                    inline: false
                },
                {
                    name: '⚙️ Config',
                    value: '`/join`, `/leave`, `/247`, `/help`',
                    inline: false
                }
            )
            .setFooter({ text: 'time pass music', iconURL: 'https://cdn.discordapp.com/emojis/995646193796333578.webp' });

        return interaction.reply({ embeds: [embed] });
    },
};

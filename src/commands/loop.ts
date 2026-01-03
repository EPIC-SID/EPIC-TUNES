import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { distube } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the repeat mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: '0' },
                    { name: 'Song', value: '1' },
                    { name: 'Queue', value: '2' }
                )
        ),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: '❌ No music playing!', ephemeral: true });

        const mode = parseInt(interaction.options.getString('mode'));
        const active = queue.setRepeatMode(mode);

        const modes = ['Off', 'Song', 'Queue'];
        const embed = new EmbedBuilder()
            .setColor('#F39C12')
            .setDescription(`**🔁 Loop Mode set to: ${modes[active]}**`);

        return interaction.reply({ embeds: [embed] });
    },
};

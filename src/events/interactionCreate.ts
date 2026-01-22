import { Events, Interaction } from 'discord.js';
import { ExtendedClient } from '../structures/Client.js';
import { Theme } from '../utils/theme.js';

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client as ExtendedClient;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorEmbed = {
                color: parseInt(Theme.Colors.Error.replace('#', ''), 16),
                title: `${Theme.Icons.Error} Error`,
                description: 'There was an error while executing this command!',
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

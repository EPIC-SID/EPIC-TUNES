import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { distube } from '../client.js';
import { Theme } from '../utils/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows the currently playing song with progress'),
    async execute(interaction: any) {
        const queue = distube.getQueue(interaction.guildId!);
        if (!queue) return interaction.reply({ content: `${Theme.Icons.Error} No music playing!`, ephemeral: true });

        const getEmbed = () => {
            const song = queue.songs[0];
            const currentTime = queue.currentTime;
            const duration = song.duration;
            const progress = Math.min((currentTime / duration) * 100, 100);

            const size = 15;
            const progressInt = Math.round((progress * size) / 100);
            const emptyProg = size - progressInt;

            const bar = '▇'.repeat(progressInt) + Theme.Icons.Disc + '—'.repeat(emptyProg);

            return new EmbedBuilder()
                .setColor(Theme.Colors.PremiumBlue as any)
                .setTitle(`${Theme.Icons.Disc} Now Playing`)
                .setDescription(`**[${song.name}](${song.url})**`)
                .setThumbnail(song.thumbnail || null)
                .addFields(
                    {
                        name: `${Theme.Icons.Clock} Duration`,
                        value: `\`${queue.formattedCurrentTime}\` ${bar} \`${song.formattedDuration}\``,
                        inline: false
                    },
                    {
                        name: 'Requested By',
                        value: `${song.user}`,
                        inline: true
                    },
                    {
                        name: 'Volume',
                        value: `\`${queue.volume}%\``,
                        inline: true
                    }
                );
        };

        const getButtons = () => {
            const isPaused = queue.paused;
            const repeatMode = queue.repeatMode; // 0 = disabled, 1 = song, 2 = queue

            return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('np_pause_resume')
                        .setEmoji(isPaused ? Theme.Icons.Play : Theme.Icons.Pause)
                        .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('np_skip')
                        .setEmoji(Theme.Icons.Skip)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('np_loop')
                        .setEmoji('🔁') // Or Theme.Icons.Loop if available? Using a basic emoji for now to be safe or check Theme
                        .setLabel(repeatMode === 0 ? 'Off' : repeatMode === 1 ? 'Song' : 'Queue')
                        .setStyle(repeatMode === 0 ? ButtonStyle.Secondary : ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('np_stop')
                        .setEmoji(Theme.Icons.Stop)
                        .setStyle(ButtonStyle.Danger)
                );
        };

        const reply = await interaction.reply({
            embeds: [getEmbed()],
            components: [getButtons()],
            fetchReply: true
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000 // 2 minutes
        });

        collector.on('collect', async (i: any) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: `${Theme.Icons.Error} You cannot control this player!`, ephemeral: true });
            }

            try {
                if (i.customId === 'np_pause_resume') {
                    if (queue.paused) {
                        queue.resume();
                    } else {
                        queue.pause();
                    }
                } else if (i.customId === 'np_skip') {
                    await queue.skip();
                    // No need to update embed here strictly, as the song changes. 
                    // But for 'nowplaying' it usually shows the song *at the time of command*.
                    // If we want it to update to the NEW song, getEmbed needs one valid song.
                    // Often 'skip' resolves quickly.
                    if (!queue.songs.length) {
                        collector.stop();
                        return; // Queue ended
                    }
                } else if (i.customId === 'np_loop') {
                    const nextMode = queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0;
                    queue.setRepeatMode(nextMode);
                } else if (i.customId === 'np_stop') {
                    queue.stop();
                    collector.stop();
                    await i.update({ components: [] }); // Remove buttons
                    return;
                }

                // Update UI state
                // Note: Resume/Pause takes a split second to reflect in queue.paused sometimes
                // We force update the view based on what we *just* did or re-fetch status

                await i.update({
                    embeds: [getEmbed()],
                    components: [getButtons()]
                });

            } catch (error) {
                console.error(error);
                // Queue might be empty or other error
                await i.reply({ content: `${Theme.Icons.Error} An error occurred or the queue is empty.`, ephemeral: true });
            }
        });

        collector.on('end', () => {
            const disabledRow = getButtons();
            disabledRow.components.forEach((btn: ButtonBuilder) => btn.setDisabled(true));
            interaction.editReply({ components: [disabledRow] }).catch(() => { });
        });
    },
};

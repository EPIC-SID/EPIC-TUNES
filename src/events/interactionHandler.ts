import { Events, Interaction, MessageFlags, EmbedBuilder } from 'discord.js';
import { client, distube } from '../client.js';
import { updateSetupMessage, resetSetupMessage } from '../utils/musicUtils.js';
import { getSongLyrics, createLyricsEmbed } from '../utils/lyricsUtils.js';
import { checkDJPermission } from '../utils/permissionUtils.js';
import { Theme } from '../utils/theme.js';

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('music_') && !customId.startsWith('setup_')) return;

    // Helper to get the queue for the guild
    const queue = distube.getQueue(interaction.guildId!);

    // For Setup buttons (Refresh/Help), we don't need a queue to be active
    if (customId.startsWith('setup_') && !customId.startsWith('setup_play_pause')) {
        // Let execution proceed to specific handlers below, jumping over queue checks
    } else {
        // Standard Music Control Checks
        if (!queue) {
            return interaction.reply({ content: `${Theme.Icons.Error} No music is currently playing!`, flags: MessageFlags.Ephemeral });
        }

        // Permission check: Ensure user is in the same voice channel
        const member = interaction.member as any;
        if (!member.voice.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
            return interaction.reply({ content: `${Theme.Icons.Error} You need to be in the same voice channel as the bot!`, flags: MessageFlags.Ephemeral });
        }
    }

    try {
        if (interaction.isStringSelectMenu()) {
            if (customId === 'music_filter') {
                const filter = interaction.values[0];
                if (filter === 'off') {
                    queue?.filters?.clear();
                    await interaction.reply({ content: `${Theme.Icons.Success} Cleared all filters.`, flags: MessageFlags.Ephemeral });
                } else {
                    if (queue?.filters?.has(filter)) {
                        queue?.filters?.remove(filter);
                        await interaction.reply({ content: `${Theme.Icons.Error} Filter/Effect Removed: **${filter}**`, flags: MessageFlags.Ephemeral });
                    } else {
                        queue?.filters?.add(filter);
                        await interaction.reply({ content: `${Theme.Icons.Success} Filter/Effect Applied: **${filter}**`, flags: MessageFlags.Ephemeral });
                    }
                }
            }
            return;
        }

        // Handle Setup Idle Buttons (Refresh / Help)
        if (customId === 'setup_refresh') {
            await interaction.deferUpdate();
            await resetSetupMessage(interaction.guildId!);
            await interaction.followUp({ content: `${Theme.Icons.Loading} Setup status refreshed!`, flags: MessageFlags.Ephemeral });
            return;
        }

        if (customId === 'setup_help') {
            const embed = new EmbedBuilder()
                .setColor(Theme.Colors.Success as any)
                .setTitle('📘 Quick Guide')
                .setDescription(`
- **Play Music**: Just type the song name or link in this channel!
- **Buttons**: Use the controls below the "Now Playing" message.
- **Commands**: Type \`/\` to see all available commands like \`/filter\`, \`/loop\`, etc.
                `);

            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Normalize IDs to share logic
        let action = customId;
        if (customId.startsWith('setup_')) {
            const suffix = customId.replace('setup_', '');
            const map: { [key: string]: string } = {
                'play_pause': 'music_pause',
                'stop': 'music_stop',
                'skip': 'music_next',
                'loop': 'music_loop',
                'shuffle': 'music_shuffle',
                'vol_down': 'music_vol_down',
                'vol_up': 'music_vol_up',
                'lyrics': 'music_lyrics'
            };
            action = map[suffix] || customId;
        }

        switch (action) {
            case 'music_lyrics':
                const currentSongForLyrics = queue?.songs[0];
                if (!currentSongForLyrics) return interaction.reply({ content: `${Theme.Icons.Error} No song playing!`, flags: MessageFlags.Ephemeral });

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                try {
                    const result = await getSongLyrics(currentSongForLyrics.name || '');
                    if (!result) {
                        await interaction.editReply({ content: `${Theme.Icons.Error} No lyrics found for **${currentSongForLyrics.name}**` });
                    } else {
                        const embed = createLyricsEmbed(result);
                        await interaction.editReply({ embeds: [embed] });
                    }
                } catch (e) {
                    await interaction.editReply({ content: `${Theme.Icons.Error} Failed to fetch lyrics.` });
                }
                break;

            case 'music_save':
                const songToSave = queue?.songs[0];
                if (!songToSave) return interaction.reply({ content: `${Theme.Icons.Error} No song playing!`, flags: MessageFlags.Ephemeral });

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                try {
                    const user = await client.users.fetch(interaction.user.id);
                    const embed = new EmbedBuilder()
                        .setColor(Theme.Colors.PremiumBlue as any)
                        .setTitle(`${Theme.Icons.Save} Saved Song`)
                        .setThumbnail(songToSave.thumbnail || null)
                        .addFields(
                            { name: 'Title', value: `[${songToSave.name}](${songToSave.url})`, inline: false },
                            { name: 'Duration', value: `\`${songToSave.formattedDuration}\``, inline: true },
                            { name: 'Artist/Uploader', value: `\`${(songToSave as any).uploader?.name || 'Unknown'}\``, inline: true },
                            { name: 'Saved From', value: `**${interaction.guild?.name}**`, inline: true }
                        )
                        .setFooter({ text: 'EPIC TUNES • Song Saver' });

                    await user.send({ embeds: [embed] });
                    await interaction.editReply({ content: `${Theme.Icons.Success} **Check your DMs!** check I've saved this song for you.` });
                } catch (e) {
                    await interaction.editReply({ content: `${Theme.Icons.Error} I couldn't send you a DM. Please check your privacy settings.` });
                }
                break;

            case 'music_back':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                if (queue && queue.previousSongs.length > 0) {
                    await queue.previous();
                    await interaction.reply({ content: `${Theme.Icons.Back} Went back to previous song!`, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: `${Theme.Icons.Error} No previous song found.`, flags: MessageFlags.Ephemeral });
                }
                break;

            case 'music_next':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                if (queue && queue.songs.length > 1) {
                    await queue.skip();
                    await interaction.reply({ content: `${Theme.Icons.Skip} Skipped song!`, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: `${Theme.Icons.Error} No more songs in queue. Use Stop button to end.`, flags: MessageFlags.Ephemeral });
                }
                break;

            case 'music_pause':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                if (queue?.paused) {
                    queue.resume();
                    await interaction.reply({ content: `${Theme.Icons.Play} Resumed!`, flags: MessageFlags.Ephemeral });
                } else {
                    queue?.pause();
                    await interaction.reply({ content: `${Theme.Icons.Pause} Paused!`, flags: MessageFlags.Ephemeral });
                }
                break;

            case 'music_stop':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                queue?.stop();
                await interaction.reply({ content: `${Theme.Icons.Stop} Stopped music and cleared queue.`, flags: MessageFlags.Ephemeral });
                resetSetupMessage(interaction.guildId!);
                break;

            case 'music_shuffle':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                queue?.shuffle();
                await interaction.reply({ content: `${Theme.Icons.Shuffle} Shuffled queue!`, flags: MessageFlags.Ephemeral });
                break;

            case 'music_loop':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                if (!queue) return;
                const nextMode = (queue.repeatMode + 1) % 3;
                queue.setRepeatMode(nextMode);
                const modeName = nextMode === 0 ? 'Off' : nextMode === 1 ? 'Song' : 'Queue';
                await interaction.reply({ content: `${Theme.Icons.Loop} Loop mode set to: **${modeName}**`, flags: MessageFlags.Ephemeral });
                updateSetupMessage(queue);
                break;

            case 'music_vol_down':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                if (!queue) return;
                const volDown = Math.max(0, queue.volume - 10);
                queue.setVolume(volDown);
                await interaction.reply({ content: `${Theme.Icons.VolumeDown} Volume decrease to ${volDown}%`, flags: MessageFlags.Ephemeral });
                updateSetupMessage(queue);
                break;

            case 'music_vol_up':
                if (!checkDJPermission(interaction)) return interaction.reply({ content: `${Theme.Icons.Error} You need the **DJ Role** to use this button!`, flags: MessageFlags.Ephemeral });

                if (!queue) return;
                const volUp = Math.min(100, queue.volume + 10);
                queue.setVolume(volUp);
                await interaction.reply({ content: `${Theme.Icons.VolumeUp} Volume increased to ${volUp}%`, flags: MessageFlags.Ephemeral });
                updateSetupMessage(queue);
                break;

            case 'music_queue':
                if (!queue) return;
                const qDocs = queue.songs.slice(0, 10).map((s, i) => {
                    return `**${i + 1}.** [${s.name}](${s.url}) - \`${s.formattedDuration}\``;
                }).join('\n');

                await interaction.reply({
                    embeds: [{
                        color: Theme.Colors.PremiumBlue as any,
                        title: `${Theme.Icons.Queue} Current Queue (Top 10)`,
                        description: qDocs || 'No songs in queue.',
                        footer: { text: `Total Songs: ${queue.songs.length} | Total Duration: ${queue.formattedDuration}` }
                    }],
                    flags: MessageFlags.Ephemeral
                });
                break;

            case 'music_info':
                if (!queue) return;
                const currentSong = queue.songs[0];
                await interaction.reply({
                    embeds: [{
                        color: Theme.Colors.Info as any,
                        title: `${Theme.Icons.Info} Song Info`,
                        thumbnail: { url: currentSong?.thumbnail || '' },
                        fields: [
                            { name: 'Title', value: currentSong?.name || 'Unknown', inline: true },
                            { name: 'Duration', value: currentSong?.formattedDuration || 'Unknown', inline: true },
                            { name: 'Views', value: (currentSong?.views || 0).toString(), inline: true },
                            { name: 'Likes', value: (currentSong?.likes || 0).toString(), inline: true },
                            { name: 'Uploader', value: (currentSong?.uploader && typeof currentSong.uploader === 'object') ? (currentSong.uploader.name || 'Unknown') : String(currentSong?.uploader || 'Unknown'), inline: true },
                            { name: 'Source', value: currentSong?.source || 'Unknown', inline: true }
                        ]
                    }],
                    flags: MessageFlags.Ephemeral
                });
                break;
        }
    } catch (error) {
        console.error('Interaction Handler Error:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: `${Theme.Icons.Error} An error occurred processing that button.`, flags: MessageFlags.Ephemeral });
        }
    }
});

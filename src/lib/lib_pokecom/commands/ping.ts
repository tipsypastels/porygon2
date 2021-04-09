import { Command } from 'interaction/command';

export const ping: Command = ({ interaction, embed }) => {
  embed
    .infoColor()
    .setTitle(':sparkles: Pong! Porygon is online~')
    .setDescription('_beep boop_ How are you all today?');

  interaction.reply(embed);
};

ping.description = 'Says hi from Porygon.';

import { Command } from 'interaction/command';
import { uptime } from 'porygon/stats';

const ping: Command = ({ interaction, embed }) => {
  embed
    .infoColor()
    .poryPortrait()
    .setTitle(':sparkles: Pong! Porygon is online~')
    .setDescription('_beep boop_ How are you all today?')
    .addField('Uptime', uptime.inWords());

  interaction.reply(embed);
};

ping.description = 'Says hi from Porygon.';

export default ping;

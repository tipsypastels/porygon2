import { Command } from 'interaction/command';
import { uptime } from 'porygon/stats';

const ping: Command = async ({ embed }) => {
  await embed
    .infoColor()
    .poryThumb('speech')
    .setTitle(':sparkles: Pong! Porygon is online~')
    .setDescription('_beep boop_ How are you all today?')
    .addField('Uptime', uptime.inWords())
    .reply();
};

ping.description = 'Says hi from Porygon.';

export default ping;

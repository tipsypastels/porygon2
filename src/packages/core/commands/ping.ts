import { CommandFn, LocalCommand } from 'porygon/interaction';
import { uptime } from 'porygon/stats';

const ping: CommandFn = async ({ embed }) => {
  await embed
    .infoColor()
    .poryThumb('speech')
    .setTitle(':sparkles: Pong! Porygon is online~')
    .setDescription('_beep boop_ How are you all today?')
    .addField('Uptime', uptime.inWords())
    .reply();
};

export default new LocalCommand(ping, { description: 'Says hi from Porygon.' });

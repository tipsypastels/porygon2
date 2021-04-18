import { GuildHandler } from 'lib/lib/event';
import { schedule } from 'porygon/schedule';
import { CtCycleRunner, handleCtMessage } from '../models/cooltrainer';

const ctHandler: GuildHandler = ({ em }) => {
  const { guild } = em;

  if (guild) {
    em.on('message', handleCtMessage);
    schedule('cooltrainer.cycle', '0 0 * * 0', () => CtCycleRunner.run(guild));
  }
};

export default ctHandler;

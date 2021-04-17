import { GuildHandler } from 'lib/lib/event';
import { handleCtMessage } from '../models/cooltrainer';

const ctHandler: GuildHandler = ({ em }) => {
  em.on('message', handleCtMessage);
};

export default ctHandler;

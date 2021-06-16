import { EventHandler, PackageKind } from 'porygon/package';
import { schedule } from 'porygon/schedule';
import { CtCycleRunner, handleCtMessage } from '../core';

const ctHandler: EventHandler<PackageKind.Guild> = ({
  events,
  kind,
  client,
}) => {
  const guild = kind.guild(client);

  if (guild) {
    events.on('message', handleCtMessage);
    schedule('cooltrainer.cycle', '0 0 * * 0', () => CtCycleRunner.run(guild));
  }
};

export default ctHandler;

import type { LibEventManager } from './manager';

export type GuildHandlerArgs = {
  em: LibEventManager;
};
export type GuildHandler = (args: GuildHandlerArgs) => void | Promise<void>;

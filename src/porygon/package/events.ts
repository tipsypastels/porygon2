import { PackageKind } from './kind';
import { ClientEvents as Events, Guild } from 'discord.js';
import { Porygon } from 'porygon/client';

type Event = keyof Events;
type Callback<K extends keyof Events> = (...args: Events[K]) => void;
type Scope = 'on' | 'once';

class EventProxy {
  constructor(private client: Porygon, private kind: PackageKind) {}

  on<K extends Event>(key: K, callback: Callback<K>) {
    return this.wrap('on', key, callback);
  }

  once<K extends Event>(key: K, callback: Callback<K>) {
    return this.wrap('once', key, callback);
  }

  globalOn<K extends Event>(key: K, callback: Callback<K>) {
    return this.client.on(key, callback);
  }

  globalOnce<K extends Event>(key: K, callback: Callback<K>) {
    return this.client.once(key, callback);
  }

  private wrap<K extends Event>(scope: Scope, key: K, callback: Callback<K>) {
    this.client[scope](key, (...args) => {
      const guild = toGuild(args[0]);

      if (this.kind.matches(guild?.id)) {
        callback(...args);
      }
    });

    return this;
  }
}

function toGuild(object: any) {
  if (object instanceof Guild) {
    return object;
  }

  if (object.guild instanceof Guild) {
    return object.guild;
  }
}

interface Args<K extends PackageKind> {
  events: EventProxy;
  kind: PackageKind.OrDev<K>;
  client: Porygon;
}

export interface EventHandler<K extends PackageKind = never> {
  (args: Args<K>): void;
}

export function runEventHandler(
  client: Porygon,
  kind: PackageKind,
  handler: EventHandler<any>,
) {
  const events = new EventProxy(client, kind);
  handler({ client, kind, events });
}

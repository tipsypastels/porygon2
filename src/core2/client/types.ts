import { Client } from 'discord.js';

/**
 * The Discord.js `Client`, without the `on` and `once` event registration methods.
 * This is used in initializers because those methods can be unsafe if they throw,
 * which would not be handled in any way and crash Porygon. Instead, the safe wrapper
 * `EventProxy` (which is also passed to initialziers) should be used.
 */
export type ClientWithoutEvents = Omit<Client, 'on' | 'once'>;

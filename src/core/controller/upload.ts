import { Data } from '../command';
import {
  ApplicationCommandManager,
  Client,
  GuildApplicationCommandManager,
} from 'discord.js';
import { Maybe } from 'support/null';

export type UploadInterfaceInner =
  | ApplicationCommandManager
  | GuildApplicationCommandManager;

/**
 * A low-level interface for uploading commands.
 * Controllers (and controller brains) provide an `into_upload_iface` method
 * that gets you one of these, which the *actual* high-level command upload
 * facilities will call.
 *
 * This class itself is just the thinnest level of abstraction over the facilities
 * Discord.js gives you, smoothing over the distinction between uploading and
 * reuploading commands.
 */
export class UploadInterface {
  constructor(private inner: UploadInterfaceInner, readonly client: Client) {}

  upload(data: Data, id: Maybe<string>) {
    return id ? this.inner.edit(id, data) : this.inner.create(data);
  }

  fetch(id: string) {
    return this.inner.fetch(id);
  }
}

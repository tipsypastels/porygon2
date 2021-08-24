import { Collection } from 'discord.js';
import { Porygon } from 'porygon/core';
import { Embed } from 'porygon/embed';
import { Cell, BaseCommand } from 'porygon/interaction';
import { zip } from 'support/array';
import { code } from 'support/string';
import { saveCommand, searchCommands } from '../commands';
import { PluginKind } from './kind';

/**
 * A plugin is a unit of command and event grouping, and a manager for
 * the setup process of both. Plugins are never initialized directly
 * (and are not even constructable), but are created by the `setupPlugins`
 * function.
 *
 * It should be noted, since the implications of this are subtle,
 * that a plugin does *NOT* correspond one-to-one to one subdirectory
 * in the `plugins` directory. The reason for this is a conflict of
 * priorities: we want to group commands by topic (ai, role, op)
 * instead of only by their guild. However, we also want to batch
 * upload commands as much as possible, and successive batch
 * uploads to the same destination will overwrite each other.
 *
 * The solution is a de-duplication scheme called `PluginKind`s.
 * Each `PluginKind` represents an upload target, such as a guild,
 * or globally. Two plugin directories with the same `PluginKind`
 * actually share the exact same `Plugin` object. This allows us
 * to arbitrarily subdivide our plugin directories, but produce the
 * minimal set of destinations to upload commands to.
 *
 * This has some consequences. First of all, only one `Plugin` ever
 * exists in development mode, because all `PluginKind`s are replaced
 * with a development shim. Secondly, it's not possible via a
 * `Plugin` object to retrieve the name of the directory it was
 * defined in (for logging, etc) since it most likely originated
 * in *several* directories. If a unique ID for a plugin is needed,
 * `plugin.kind.tag` is available, though it's not a pretty one.
 *
 * @see PluginKind - Unique ID for each plugin.
 */
export class Plugin {
  static ALL = new Collection<PluginKind, Plugin>();

  private unsavedCommands: BaseCommand[] = [];

  // metadata, only tracked for intoPlugInfoEmbed
  private connected = false;
  private includedDirs: string[] = [];

  static uploadAllCommands() {
    return Promise.all(this.ALL.map((p) => p.uploadCommands()));
  }

  static init(kind: PluginKind, client: Porygon) {
    return this.ALL.get(kind) || new this(kind, client);
  }

  private constructor(private kind: PluginKind, readonly client: Porygon) {
    Plugin.ALL.set(kind, this);
  }

  markDirAsIncluded(dir: string) {
    this.includedDirs.push(dir);
  }

  addCommand(command: BaseCommand) {
    this.unsavedCommands.push(command);
  }

  hasCommand(name: string) {
    return !!searchCommands((c) => c.name === name && c.plugin === this);
  }

  private async uploadCommands() {
    const data = this.unsavedCommands.map((c) => c.data);
    const apis = await this.kind.upload(data, this.client);

    for (const [command, api] of zip(this.unsavedCommands, apis)) {
      const cell = new Cell(this, api, command);
      saveCommand(cell);
    }

    this.unsavedCommands = [];
    this.connected = apis.length > 0;
  }

  intoPlugInfoEmbed(e: Embed) {
    const data = [
      `**Directories:** ${this.includedDirs.map(code).join(', ')}`,
      `**Connected:** ${this.connected ? '✅' : '❌'}`,
    ];

    e.addField(this.kind.tag, data.join('\n'));
  }
}

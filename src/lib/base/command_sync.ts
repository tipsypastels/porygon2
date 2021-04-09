import { Collection, CommandInteraction } from 'discord.js';
import { Command, removeCommandHandler } from 'interaction/command';
import type { Lib } from 'lib/base';
import type { PorygonClient as Client } from 'porygon/client';
import { PorygonEmbed } from 'porygon/embed';

export class CommandSynchronizer {
  private handlers = new Collection<string, Command>();

  async synchronize(lib: Lib, client: Client) {
    const commandDir = `${lib.dirName}/commands`;
    const commands: Record<string, Command> = await import(commandDir);

    const promises = Object.values(commands).map(async (command) => {
      await this.addRegistration(lib, client, command);
      await this.addHandler(command);
    });

    await Promise.all(promises);
  }

  async handle(client: Client, interaction: CommandInteraction) {
    const command = this.handlers.get(interaction.commandName);

    if (!command) {
      return; // TODO: log error
    }

    await command({
      client,
      interaction,
      embed: new PorygonEmbed(),
      args: null as any,
    });
  }

  protected async addRegistration(lib: Lib, client: Client, command: Command) {
    const commandData = removeCommandHandler(command);
    client.guilds.cache.get(lib.guildId)?.commands.create(commandData);
  }

  protected addHandler(command: Command) {
    this.handlers.set(command.name, command);
  }
}

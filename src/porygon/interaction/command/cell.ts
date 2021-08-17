import { Plugin } from 'porygon/plugin';
import { BaseCommand } from './base';
import { ApplicationCommand as Api, BaseCommandInteraction, Snowflake } from 'discord.js';
import { ContextMenu, callContextMenu } from './context_menu/context_menu';
import { Command, callCommand } from './chat';

export class Cell {
  constructor(readonly plugin: Plugin, private api: Api, private cmd: BaseCommand) {}

  get id() {
    return this.api.id;
  }

  get name() {
    return this.api.name;
  }

  get client() {
    return this.plugin.client;
  }

  get isGlobal() {
    return !this.api.guildId;
  }

  call(intr: BaseCommandInteraction): void {
    if (intr.isCommand()) {
      return callCommand(intr, this, this.cmd as Command);
    }

    if (intr.isContextMenu()) {
      return callContextMenu(intr, this, this.cmd as ContextMenu);
    }
  }

  isOn(guildId: Snowflake) {
    return this.isGlobal || this.api.guildId === guildId;
  }
}

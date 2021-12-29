import { Embed } from 'core/embed';
import { logger } from 'core/logger';
import { Message, MessageActionRowOptions as RowInner } from 'discord.js';
import { eager, map } from 'support/iterator';
import { Minutes } from 'support/time';
import { Button } from './button';
import { Select } from './select';
import { ActiveComponent, Component } from './shared';

const DEFAULT_TIMEOUT = Minutes(15);

// TODO: split into Row and Rows, allow multiple rows
export class Row extends Component<RowInner> {
  private components = new Map<string, ActiveComponent>();
  private timeout = DEFAULT_TIMEOUT;
  private timeout_handler?: () => void;

  get touched() {
    return this.components.size > 0;
  }

  into_inner() {
    return { type: <const>'ACTION_ROW', components: this.into_components() };
  }

  private into_components() {
    return eager(map((c) => c.into_inner(), this.components.values()));
  }

  button() {
    return this.add(Button);
  }

  select() {
    return this.add(Select);
  }

  private add<T extends ActiveComponent>(ctor: new () => T) {
    const component = new ctor();
    this.components.set(component.custom_id, component);
    return component;
  }

  start_runtime(message: Message, embed: Embed) {
    const collector = message.createMessageComponentCollector({
      time: this.timeout,
    });

    collector.on('collect', (i) => {
      const component = this.components.get(i.customId);

      if (!component) {
        return logger.warn(`Unknown component interaction %${i.customId}%`);
      }

      component.call(i, embed);
    });

    collector.on('end', () => {
      this.timeout_handler?.();
    });
  }
}

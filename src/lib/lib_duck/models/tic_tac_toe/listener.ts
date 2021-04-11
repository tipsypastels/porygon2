import { Message, TextChannel } from 'discord.js';
import { Seconds } from 'support/time';
import { Board } from './board';
import { isValidCell } from './constants';
import { Player } from './player';

export class Listener {
  static ALLOWED_TIME = Seconds(30);
  static NO_ENTRY = '🚫';

  constructor(private channel: TextChannel) {}

  listen(player: Player, board: Board) {
    return new Promise<string>((resolve, reject) => {
      const filter = this.filterByPlayer(player);
      const collector = this.channel.createMessageCollector(filter, {
        time: Listener.ALLOWED_TIME,
      });

      collector.on('collect', (message: Message) => {
        const cell = message.content.toUpperCase();

        if (!isValidCell(cell)) {
          return; // ignore other messages
        }

        if (board.isFree(cell)) {
          resolve(cell);
          collector.stop();
          return;
        }

        this.indicateCellIsTaken(message);
      });

      collector.on('end', () => reject());
    });
  }

  private filterByPlayer(player: Player) {
    return ({ author }: Message) => author.id === player.id;
  }

  private indicateCellIsTaken(message: Message) {
    message.react(Listener.NO_ENTRY);
  }
}

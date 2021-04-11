import COLORS from 'colors.json';
import {
  Collection,
  CommandInteraction,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { Board, BoardState } from './tic_tac_toe/board';
import { Cell } from './tic_tac_toe/constants';
import { PlayerList } from './tic_tac_toe/player';
import {
  GameCancelledState,
  GamePlayingState,
  GameTiedState,
  GameWonState,
} from './tic_tac_toe/state';

interface GameOpts {
  channel: TextChannel;
  playerX: GuildMember;
  playerO: GuildMember;
  interaction: CommandInteraction;
}

export class TicTacToe {
  readonly channel: TextChannel;
  readonly players: PlayerList;
  readonly interaction: CommandInteraction;

  private didReplyOnce = false;
  private board = new Board();
  private state = new GamePlayingState();

  constructor(opts: GameOpts) {
    this.channel = opts.channel;
    this.players = new PlayerList(opts.playerX, opts.playerO);
    this.interaction = opts.interaction;
  }

  async start() {
    await this.render();

    for (;;) {
      const didCancel = await this.turn();

      if (didCancel) {
        console.log('game cancelled');
        this.state = new GameCancelledState();
      } else {
        switch (this.board.state) {
          case BoardState.Full: {
            console.log('game tied');
            this.state = new GameTiedState();
            break;
          }
          case BoardState.Line: {
            console.log('game won');
            this.state = new GameWonState();
          }
        }
      }

      if (this.state.shouldContinue) {
        console.log('continuing');
        this.players.next();
        await this.render();
        continue;
      }

      await this.render();
      break;
    }
  }

  private async render() {
    const player = this.players.current;
    const embed = this.state.render(player, this.board);

    this.reply(embed);
  }

  private async turn() {
    console.log('starting turn');

    const player = this.players.current;
    const filter = (message: Message) => {
      const content = message.content.toUpperCase();

      return (
        message.author.id === player.id &&
        content in Cell &&
        this.board.isFree(Cell[content as 'A1'])
      );
    };

    let res: Collection<string, Message>;

    try {
      res = await this.awaitMessages(filter);
    } catch {
      return true;
    }

    const message = res.first()!;
    const content = message.content.toUpperCase();
    const cell = Cell[content as 'A1'];

    this.board.fill(cell, player.team);
  }

  private reply(embed: MessageEmbed) {
    if (this.didReplyOnce) {
      return this.interaction.editReply(embed);
    } else {
      this.didReplyOnce = true;
      return this.interaction.reply(embed);
    }
  }

  private awaitMessages(filter: (message: Message) => boolean) {
    return this.channel.awaitMessages(filter, {
      max: 1,
      time: 30000,
      errors: ['time'],
    });
  }
}

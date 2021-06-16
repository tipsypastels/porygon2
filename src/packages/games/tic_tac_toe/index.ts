import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { Board } from './board';
import { Listener } from './listener';
import { PlayerList } from './player';
import { GameCancelledState, GamePlayingState, GameState } from './state';

interface GameOpts {
  channel: TextChannel;
  playerX: GuildMember;
  playerO: GuildMember;
  interaction: CommandInteraction;
}

export class TicTacToe {
  readonly channel: TextChannel;
  readonly interaction: CommandInteraction;
  readonly players: PlayerList;
  readonly listener: Listener;
  readonly board: Board;
  private state: GameState;

  constructor(opts: GameOpts) {
    this.channel = opts.channel;
    this.interaction = opts.interaction;
    this.players = new PlayerList(opts.playerX, opts.playerO);
    this.listener = new Listener(this.channel);
    this.board = new Board();
    this.state = new GamePlayingState(this);
  }

  async start() {
    await this.state.render();

    for (;;) {
      this.state = await this.turn();
      const isOngoing = await this.state.tick();

      if (!isOngoing) {
        break;
      }
    }
  }

  async status(status: string) {
    if (this.listener.hasCollectedAny) {
      await this.channel.send(status);
    }
  }

  private async turn() {
    const player = this.players.current;

    try {
      const cell = await this.listener.listen(player, this.board);
      const nextState = this.board.fill(cell, player.team);

      return new nextState(this);
    } catch {
      return new GameCancelledState(this);
    }
  }
}

import COLORS from 'colors.json';
import { MessageEmbed } from 'discord.js';
import { Board } from './board';
import { Player } from './player';

const TITLE = 'Tic-Tac-Toe';
const CTA = 'Start a new match with `/ttt`.';

export interface GameState {
  shouldContinue: boolean;
  render(player: Player, board: Board): MessageEmbed;
}

export class GamePlayingState implements GameState {
  shouldContinue = true;

  render(player: Player, board: Board) {
    return new MessageEmbed()
      .setTitle(TITLE)
      .setDescription(board.toString())
      .setColor(COLORS.ok)
      .addField(
        `${player}, it's your turn!`,
        'Enter a letter and number matching an available cell; for example, **A1**.',
      );
  }
}

export class GameCancelledState implements GameState {
  shouldContinue = false;

  render() {
    return new MessageEmbed()
      .setColor(COLORS.warning)
      .setTitle(TITLE)
      .setDescription('Match timed out due to inactivity.');
  }
}

export class GameWonState implements GameState {
  shouldContinue = false;

  render(winner: Player, board: Board) {
    return new MessageEmbed()
      .setColor(COLORS.info)
      .setTitle(TITLE)
      .setDescription(board.toString())
      .addField(`${winner} won the game!`, CTA);
  }
}

export class GameTiedState implements GameState {
  shouldContinue = false;

  render(_: Player, board: Board) {
    return new MessageEmbed()
      .setColor(COLORS.info)
      .setTitle(TITLE)
      .setDescription(board.toString())
      .addField("It's a tie!", CTA);
  }
}

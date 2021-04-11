import COLORS from 'colors.json';
import { MessageEmbed } from 'discord.js';
import type { TicTacToe } from '../tic_tac_toe';

const TITLE = 'Tic-Tac-Toe';
const CTA = 'Start a new match with `/ttt`.';

export abstract class GameState {
  constructor(protected game: TicTacToe) {}

  abstract intoEmbed(embed: MessageEmbed): void;
  abstract tick(): Promise<boolean>;

  async render() {
    const embed = new MessageEmbed();
    const { interaction } = this.game;

    this.intoEmbed(embed);

    interaction.replied
      ? await interaction.editReply(embed)
      : await interaction.reply(embed);
  }

  protected async text(text: string) {
    await this.game.channel.send(text);
  }

  protected get board() {
    return this.game.board;
  }

  protected get player() {
    return this.game.players.current;
  }
}

export class GamePlayingState extends GameState {
  intoEmbed(embed: MessageEmbed) {
    embed
      .setTitle(TITLE)
      .setDescription(this.board.toString())
      .setColor(COLORS.ok)
      .addField(
        `${this.player}, it's your turn!`,
        'Enter a letter and number matching an available cell; for example, **A1**.',
      );
  }

  async tick() {
    this.game.players.next();
    await this.render();

    return true;
  }
}

export class GameCancelledState extends GameState {
  intoEmbed(embed: MessageEmbed) {
    embed
      .setColor(COLORS.warning)
      .setTitle(TITLE)
      .setDescription('Match timed out due to inactivity.');
  }

  async tick() {
    await Promise.all([
      this.render(),
      this.text('⚠️ The game was cancelled due to inactivity.'),
    ]);

    return false;
  }
}

export class GameWonState extends GameState {
  intoEmbed(embed: MessageEmbed) {
    embed
      .setColor(COLORS.info)
      .setTitle(TITLE)
      .setDescription(this.board.toString())
      .addField(`${this.player} won the game!`, CTA);
  }

  async tick() {
    await Promise.all([
      this.render(),
      this.text(`🎉 **${this.player}** won the game!`),
    ]);

    return false;
  }
}

export class GameTiedState extends GameState {
  intoEmbed(embed: MessageEmbed) {
    embed
      .setColor(COLORS.info)
      .setTitle(TITLE)
      .setDescription(this.board.toString())
      .addField("It's a tie!", CTA);
  }

  async tick() {
    await Promise.all([this.render(), this.text('🤷 Match ended in a tie.')]);
    return false;
  }
}

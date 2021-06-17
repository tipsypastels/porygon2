import {
  CommandInteraction,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { Embed } from 'porygon/embed';
import { ChoiceCollector } from './choice_collector';
import { Choice, CHOICES } from './constants';
import { PlayerList } from './player_list';

interface RPSOpts {
  channel: TextChannel;
  player1: GuildMember;
  player2: GuildMember;
  interaction: CommandInteraction;
}

const TITLE = 'Rock, Paper, Scissors';

export class RPS {
  private channel: TextChannel;
  private players: PlayerList;
  private interaction: CommandInteraction;
  private message?: Message;

  constructor(opts: RPSOpts) {
    this.channel = opts.channel;
    this.players = new PlayerList(opts.player1, opts.player2);
    this.interaction = opts.interaction;
  }

  async start() {
    await this.countdownPhase();
    await this.gamePhase();
  }

  private async countdownPhase() {
    await this.embed()
      .setDescription('Please wait for all reactions to be added...')
      .reply();

    await this.eachChoice(async (ch) => await this.react(ch.emoji));
    await this.embed().setDescription('Make your choice!').reply();
  }

  private async gamePhase() {
    console.log('game phase!');
    const collector = new ChoiceCollector(this.message!, this.players);
    const { winner, p1, p2 } = await collector.collect();
    console.log('got result');

    this.embed()
      .setDescription(winner ? `${winner.displayName} won!` : "It's a tie!")
      .addField(p1.member.displayName, p1.choice.emoji)
      .addField(p2.member.displayName, p2.choice.emoji)
      .reply();
  }

  private async reply(embed: MessageEmbed) {
    this.interaction.replied
      ? await this.interaction.editReply(embed)
      : await this.interaction.reply(embed);

    const message = await this.interaction.fetchReply();
    if (message) this.message = message;
  }

  private async react(reaction: string) {
    if (!this.message) {
      throw new Error("Can't use RPS#react when no message has been sent.");
    }

    await this.message.react(reaction);
  }

  private embed() {
    return new Embed.Replyable(this.reply.bind(this))
      .infoColor()
      .setTitle(TITLE);
  }

  private async eachChoice(callback: (choice: Choice) => Promise<void>) {
    for (const choice of CHOICES) await callback(choice);
  }
}

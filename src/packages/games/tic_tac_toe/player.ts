import { GuildMember } from 'discord.js';
import { Team } from './constants';

export class PlayerList {
  readonly x: Player;
  readonly o: Player;

  private currentTeam = Team.X;

  constructor(x: GuildMember, o: GuildMember) {
    this.x = new Player(x, Team.X);
    this.o = new Player(o, Team.O);
  }

  get current() {
    return this[this.currentTeam];
  }

  next() {
    this.currentTeam = this.currentTeam === Team.X ? Team.O : Team.X;
  }

  toString() {
    return `**${this.x}** vs **${this.o}**`;
  }
}

export class Player {
  constructor(private member: GuildMember, readonly team: Team) {}

  get id() {
    return this.member.id;
  }

  toString() {
    return `${this.member.displayName} (${this.team.toUpperCase()})`;
  }
}

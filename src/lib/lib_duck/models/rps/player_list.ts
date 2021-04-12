import { GuildMember, User } from 'discord.js';
import { Choice, Result } from './constants';

export class PlayerList {
  constructor(readonly p1: GuildMember, readonly p2: GuildMember) {}

  has({ id }: GuildMember | User) {
    return id === this.p1.id || id === this.p2.id;
  }

  createChoiceMap() {
    return new ChoiceMap(this);
  }
}

class ChoiceMap {
  private map = new Map<string, Choice>();
  constructor(private players: PlayerList) {}

  set(player: GuildMember | User, choice: Choice) {
    if (!this.map.has(player.id)) {
      this.map.set(player.id, choice);
    }
  }

  get done() {
    return this.map.size >= 2;
  }

  get result(): Result {
    if (!this.done) {
      throw new Error("Can't access result, collection not complete.");
    }

    const { p1, p2 } = this.players;
    const p1Choice = this.get(p1)!;
    const p2Choice = this.get(p2)!;
    const p1Won = p1Choice.beats(p2Choice);
    const tied = !p1Won && !p2Choice.beats(p1Choice);

    return {
      p1: { member: p1, choice: p1Choice },
      p2: { member: p2, choice: p2Choice },
      winner: tied ? undefined : p1Won ? p1 : p2,
    };
  }

  private get(player: GuildMember) {
    return this.map.get(player.id);
  }
}

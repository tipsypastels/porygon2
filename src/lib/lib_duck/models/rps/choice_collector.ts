import { Message, MessageReaction, User } from 'discord.js';
import { Seconds } from 'support/time';
import { Result, EMOJI, EMOJI_TO_CHOICES } from './constants';
import { PlayerList } from './player_list';

export class ChoiceCollector {
  constructor(private message: Message, private players: PlayerList) {}

  collect() {
    return new Promise<Result>((resolve) => {
      const collector = this.createCollector();
      const choices = this.players.createChoiceMap();

      collector.on('collect', (reaction, user) => {
        console.log('got');
        const choice = EMOJI_TO_CHOICES.get(reaction.emoji.toString())!;
        if (!choice) return;

        choices.set(user, choice);

        if (choices.done) {
          resolve(choices.result);
          collector.stop();
        }
      });
    });
  }

  private createCollector() {
    return this.message.createReactionCollector(this.getFilter(), {
      time: Seconds(5),
    });
  }

  private getFilter() {
    return (react: MessageReaction, user: User) => {
      console.log('filtering?');
      return this.players.has(user) && EMOJI.has(react.emoji.toString());
    };
  }
}

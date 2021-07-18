import { randomInt } from 'mathjs';
import { Embed } from 'porygon/embed';
import { FailurePercentStat } from 'porygon/stats/failure_percent';
import { DiceRoll } from '.';
import { diceThresholdPasses } from '../dice';

export function tallyDiceRoll(roll: DiceRoll) {
  const { threshold } = roll;
  const one = roll.count === 1;

  const values: string[] = [];
  const passFail = new FailurePercentStat();

  let total = 0;

  for (let i = 0; i < roll.count; i++) {
    const value = rollValue();
    total += value;

    if (threshold) {
      const passing = diceThresholdPasses(threshold, value);
      passFail.add(passing);
      values.push(`**${value}** (${passing ? 'Pass' : 'Fail'})`);
    } else {
      values.push(`**${value}**`);
    }
  }

  function rollValue() {
    return randomInt(1, roll.faces + 1);
  }

  function intoEmbedValues(embed: Embed) {
    embed.setDescription(values.join(' + '));
  }

  function intoEmbedTotal(embed: Embed) {
    if (!one) {
      embed.addInlineField('Total', total);
    }
  }

  function intoEmbedThreshold(embed: Embed) {
    if (threshold && !one) {
      embed
        .addInlineField('Pass Threshold', `\\${threshold.op} ${threshold.value}`)
        .addInlineField('Passes', `${passFail.passes} / ${passFail.total}`);
    }
  }

  return function intoEmbed(embed: Embed) {
    embed.merge(intoEmbedValues).merge(intoEmbedTotal).merge(intoEmbedThreshold);
  };
}

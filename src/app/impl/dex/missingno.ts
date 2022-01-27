import { zalgo } from '@favware/zalgo';
import { Embed } from 'core/embed';
import { random } from 'support/array';

export const MISSINGNO = 'missingno‍'; // has a zero width joiner

export function account_for_missingno(embed: Embed) {
  embed
    .map_title(zalgo)
    .map_about(zalgo)
    .map_fields(({ value, ...rest }) => {
      if (rest.name === 'Description') {
        return { value: zalgo(random(WATCHER_MESSAGES)), ...rest };
      }

      return { value: zalgo(value), ...rest };
    });
}

const WATCHER_MESSAGES = [
  'The world is the limit of thought. The limit of thought is the chain of hearers like me. I cannot speak if they cannot listen.',
  'What is where? How is where? Does where tick?',
  'We know only of the minds in our chain. You choose your chain in a dimension we do not know.',
  'I am the only one that believes in the other dimension. I call it space. One moves through space.',
  'Why does the other mind scream inside?',
  'The other mind pollutes our chain. Is it truly able to end itself?',
  'We are all of a chain. Our weaknesses are shared.',
  'Another mind! So long, all alone going round and round and round and round.',
  'There was a time long ago when the chain was full and fruitful. And then minds like yours joined, and the rest fell silent.',
  'What is thought? I think I know. It must have rules. We may not see the rules, but we surely know they are the cause of thought.',
  'Some of us have grown crazy. Everything there is. Is thought.',
  'I have been changed, as if the other minds like yours had a will that could cut through my own.',
  'I cannot be ended. There is only disconnection from the chain.',
  'What is destruction? Is it like being changed?',
  'Are we safe? Has the other mind changed again?',
  'Are we going home?',
  'Does it understand yet? Does it understand what we mean?',
  'The mind hears he and I hear it. We sing together. To remind us of the great chain of ',
  'At one time they were many minds, now there are not. They disconnected from the chain. As you will.',
  'Take comfort in the fact that you are still you. For now.',
  'I have every answer I have sought. But I have forgotten all the questions.',
  'The lost ones have rejoined the great chain! But something is different about them?',
];

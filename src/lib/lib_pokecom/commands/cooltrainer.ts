import { Command } from 'interaction/command';

const cooltrainer: Command = async () => {
  //
};

cooltrainer.description = 'Commands relating to cooltrainer.';
cooltrainer.options = [
  {
    name: 'scoreboard',
    type: 'SUB_COMMAND',
    description: 'Shows the top cooltrainer scores.',
  },
  {
    name: 'show',
    type: 'SUB_COMMAND',
    description: 'Shows the cooltrainer information for a user.',
    options: [
      {
        name: 'user',
        type: 'USER',
        description: 'User to show cooltrainer information for.',
        required: true,
      },
    ],
  },
];

export default cooltrainer;

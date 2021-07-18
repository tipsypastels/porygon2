import { FriendCodes } from '.prisma/client';
import { GuildMember } from 'discord.js';
import { database } from 'porygon/database';
import { Embed } from 'porygon/embed';
import { embeddedError } from 'porygon/embed/errors';
import { codeBlock } from 'support/format';

// NOTE "3ds" isn't a valid column, so we use "ds" internally, hence
// requiring a normalization step
type Data = Omit<FriendCodes, 'userId'>;
type RawData = Omit<Data, 'ds'> & {
  '3ds': string | null;
};

export class FriendCodeManager {
  static SYNTAX = /^\d{4}-\d{4}-\d{4}$/;
  static table = database.friendCodes;

  private codes: FriendCodes | null = null;
  constructor(private member: GuildMember) {}

  async load() {
    this.codes = await FriendCodeManager.table.findFirst({
      where: { userId: this.member.id },
    });

    return this;
  }

  async save(rawData: RawData | undefined) {
    if (!rawData || Object.keys(rawData).length === 0) {
      throw embeddedError.warn((e) => {
        e.setTitle('You used /fc set with no parameters.').setDescription(
          'Please provide at least one of `3ds`, `switch`, or `go` to set.',
        );
      });
    }

    const data = this.normalize(rawData);
    this.codes = await FriendCodeManager.table.upsert({
      where: { userId: this.member.id },
      update: data,
      create: { ...data, userId: this.member.id },
    });

    return this;
  }

  intoEmbed(embed: Embed) {
    const { codes } = this;

    if (!codes) {
      return embed.setDescription(
        `${this.member.displayName} has no friend code data set.`,
      );
    }

    return embed
      .if(codes.switch, (code) => embed.addField('Switch', codeBlock(code)))
      .if(codes.ds, (code) => embed.addField('3DS', codeBlock(code)))
      .if(codes.go, (code) => embed.addField('Go', codeBlock(code)));
  }

  private normalize(rawData: RawData): Data {
    return {
      ds: this.normalizeAndValidateCode(rawData['3ds']),
      switch: this.normalizeAndValidateCode(rawData.switch),
      go: this.normalizeAndValidateCode(rawData.go),
    };
  }

  private normalizeAndValidateCode(code: string | null) {
    if (!code) return code;
    code = this.normalizeCode(code);

    if (code.match(FriendCodeManager.SYNTAX) === null) {
      throw embeddedError.warn((e) => {
        e.setTitle(`${code} is not a valid friend code.`).setDescription(
          'Valid friend codes look like `####-####-####`.',
        );
      });
    }

    return code;
  }

  private normalizeCode(code: string) {
    return code
      .replace(/ +/g, '-') // replace spaces with dashes
      .replace(/(\d{4})(?=\d)/g, '$1-'); // add dashes between four digits if missing
  }
}

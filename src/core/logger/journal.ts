import { IS_STAGING } from 'support/env';
import { LOG_COLORS } from './colors';

// TODO: confusing that the export of Colors from ^ isn't this
type Color = Exclude<keyof typeof LOG_COLORS, 'aside'>;

interface Opts {
  text: string;
  color: Color;
  parent?: SetupJournal;
}

interface WriteOpts {
  color?: Color;
}

export class SetupJournal {
  static ROOT = new this({ text: 'Journal start!', color: 'debug' });

  private children: SetupJournal[] = [];
  private has_non_debug_children = false;

  private constructor(private opts: Opts) {
    opts.parent?.register_child(this);
  }

  private register_child(child: SetupJournal) {
    this.children.push(child);
    this.has_non_debug_children ||= child.opts.color !== 'debug';
  }

  private get should_include() {
    return IS_STAGING || this.has_non_debug_children || this.opts.color !== 'debug';
  }

  write(text: string, { color = 'debug' }: WriteOpts) {
    return new SetupJournal({ text, color, parent: this });
  }
}

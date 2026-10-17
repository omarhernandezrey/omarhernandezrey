import type { Profile } from '../config/profile.ts';
import type { Theme } from '../config/theme.ts';
import type { DerivedStats } from '../data/stats.ts';

export interface CardContext {
  readonly theme: Theme;
  readonly profile: Profile;
  readonly stats: DerivedStats;
  /** YYYY-MM-DD de la generación. */
  readonly buildDate: string;
}

export interface RenderedCard {
  /** Nombre base del archivo (sin tema ni extensión). */
  readonly name: string;
  readonly svg: string;
}

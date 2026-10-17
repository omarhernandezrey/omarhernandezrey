export type ThemeName = 'dark' | 'light';

export interface Theme {
  readonly name: ThemeName;
  /** Fondo exterior de los paneles. */
  readonly bg: string;
  readonly panel: string;
  readonly panelAlt: string;
  readonly line: string;
  readonly lineSoft: string;
  readonly ink: string;
  readonly inkSoft: string;
  readonly inkMute: string;
  /** Acento para texto y trazos (contraste AA sobre el panel). */
  readonly accent: string;
  /** Acento para rellenos grandes (barras, glows). */
  readonly accentFill: string;
  /** Texto sobre accentFill. */
  readonly onAccent: string;
  readonly cyan: string;
  readonly orange: string;
  /** Paleta categórica para series (lenguajes, leyendas). */
  readonly series: readonly string[];
}

const dark: Theme = {
  name: 'dark',
  bg: '#07090D',
  panel: '#0C1016',
  panelAlt: '#121820',
  line: '#26303C',
  lineSoft: '#18202A',
  ink: '#EAEFF4',
  inkSoft: '#A9B3BF',
  inkMute: '#6C7786',
  accent: '#C8F135',
  accentFill: '#C8F135',
  onAccent: '#0A0D04',
  cyan: '#4ADEFF',
  orange: '#FF8A4C',
  series: ['#C8F135', '#4ADEFF', '#FF8A4C', '#A594FF', '#FF6B9A', '#7C8796', '#3A4552'],
};

const light: Theme = {
  name: 'light',
  bg: '#F6F5EF',
  panel: '#FFFFFF',
  panelAlt: '#F1F0E9',
  line: '#D6D4C8',
  lineSoft: '#E7E5DC',
  ink: '#101317',
  inkSoft: '#434A54',
  inkMute: '#767D87',
  accent: '#4C7A00',
  accentFill: '#B6E01E',
  onAccent: '#101317',
  cyan: '#00709F',
  orange: '#C2410C',
  series: ['#8DB800', '#0088BF', '#E0621F', '#7360E6', '#D93F74', '#8A919B', '#C9C7BC'],
};

export const THEMES: readonly Theme[] = [dark, light];

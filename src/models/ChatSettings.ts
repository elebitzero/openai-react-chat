interface ChatSettings {
  icon?: File | null;
  name: string;
  description?: string;
  instructions?: string;
  model: string |  null;
  seed?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  pageSetup: 'normal' | 'wide' | 'full';
}

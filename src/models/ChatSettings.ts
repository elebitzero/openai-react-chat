import {ImageSource} from "../components/AvatarFieldEditor";

export interface ChatSettings {
  id: number;
  author: string;
  icon?: ImageSource | null;
  name: string;
  description?: string;
  instructions?: string;
  model: string | null;
  seed?: number | null;
  temperature?: number | null;
  top_p?: number | null;
  showInSidebar?: number;
}

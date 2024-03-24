export interface FileData {
  data: string | null;
  type: string; // mime type e.g. 'image/svg', 'image/gif', 'text/csv' etc.
  source: 'filename' | 'pasted';
  filename?: string;  // if source is 'filename'
}
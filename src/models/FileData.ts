export interface FileData {
  id?: number;
  data: string | null;
  type: string; // mime type e.g. 'image/svg', 'image/gif', 'text/csv' etc.
  source: 'filename' | 'pasted';
  filename?: string;  // if source is 'filename'
}

export interface FileDataRef {
  id: number;
  fileData: FileData | null;
}
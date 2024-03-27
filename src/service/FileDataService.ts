import Dexie from 'dexie';
import {FileData} from '../models/FileData';

class FileDB extends Dexie {
  fileData: Dexie.Table<FileData, number>;

  constructor() {
    super("FileDB");
    this.version(1).stores({
      fileData: '++id'
    });
    this.fileData = this.table("fileData");
  }
}

const db = new FileDB();

class FileDataService {
  static async getFileData(id: number): Promise<FileData | undefined> {
    return db.fileData.get(id);
  }

  static async addFileData(fileData: FileData): Promise<number> {
    return db.fileData.add(fileData);
  }

  static async updateFileData(id: number, changes: Partial<FileData>): Promise<number> {
    return db.fileData.update(id, changes);
  }

  static async deleteFileData(id: number): Promise<void> {
    await db.fileData.delete(id);
  }

  static async deleteAllFileData(): Promise<void> {
    await db.fileData.clear();
  }
}

export default FileDataService;

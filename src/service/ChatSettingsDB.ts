import Dexie from 'dexie';
import { ChatSettings } from '../models/ChatSettings';
import initialData from './chatSettingsData.json';

class ChatSettingsDB extends Dexie {
  chatSettings: Dexie.Table<ChatSettings, number>;

  constructor() {
    super("chatSettingsDB");
    this.version(1).stores({
      chatSettings: '&id, name, description, instructions, model, seed, temperature, top_p, icon'
    });
    this.chatSettings = this.table("chatSettings");

    // Populate the database with initial data if it's empty
    this.on('populate', () => {
      this.chatSettings.bulkAdd(initialData);
    });
  }
}

export async function getConversationById(id: number): Promise<ChatSettings | undefined> {
  const db = new ChatSettingsDB(); // Ensure you're using the instantiated DB correctly
  return db.chatSettings.get(id);
}

const db = new ChatSettingsDB();

export default db;

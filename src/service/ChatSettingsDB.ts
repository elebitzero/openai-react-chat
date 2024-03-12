import Dexie from 'dexie';
import { ChatSettings } from '../models/ChatSettings';
import initialData from './chatSettingsData.json';
import {chatSettingsEmitter} from "./EventEmitter";

class ChatSettingsDB extends Dexie {
  chatSettings: Dexie.Table<ChatSettings, number>;

  constructor() {
    super("chatSettingsDB");
    this.version(1).stores({
      chatSettings: '&id, name, description, instructions, model, seed, temperature, top_p, icon'
    });
    this.version(2).stores({
      chatSettings: '&id, name, description, instructions, model, seed, temperature, top_p, icon, showInSidebar'
    }).upgrade(tx => {
      return tx.table('chatSettings').toCollection().modify(chatSetting => {
        chatSetting.showInSidebar = false;
      });
    });
    this.version(3).stores({
      chatSettings: '&id, name, description, instructions, model, seed, temperature, top_p, icon, showInSidebar'
    }).upgrade(tx => {
      return tx.table('chatSettings').toCollection().modify(chatSetting => {
        chatSetting.showInSidebar = chatSetting.showInSidebar ? 1 : 0;
      });
    });
    this.chatSettings = this.table("chatSettings");

    this.on('populate', () => {
      this.chatSettings.bulkAdd(initialData);
    });
  }
}

export async function getChatSettingsById(id: number): Promise<ChatSettings | undefined> {
  const db: ChatSettingsDB = new ChatSettingsDB();
  return db.chatSettings.get(id);
}

export async function updateShowInSidebar(id: number, showInSidebar: number) {
  try {
    await chatSettingsDB.chatSettings.update(id, { showInSidebar });
    chatSettingsEmitter.emit('chatSettingsChanged',{gid: id});
  } catch (error) {
    console.error('Failed to update:', error);
  }
}



const chatSettingsDB = new ChatSettingsDB();

export default chatSettingsDB;

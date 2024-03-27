import Dexie from 'dexie';
import {ChatSettings} from '../models/ChatSettings';
import initialData from './chatSettingsData.json';
import {EventEmitter} from "./EventEmitter";

export interface ChatSettingsChangeEvent {
  action: 'edit' | 'delete',
  gid: number
}

export const chatSettingsEmitter = new EventEmitter<ChatSettingsChangeEvent>();

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
    this.version(4).stores({
      chatSettings: '&id, name, description, model, showInSidebar'
    })
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
    await chatSettingsDB.chatSettings.update(id, {showInSidebar});
    let event: ChatSettingsChangeEvent = {action: 'edit', gid: id};
    chatSettingsEmitter.emit('chatSettingsChanged', event);
  } catch (error) {
    console.error('Failed to update:', error);
  }
}

export async function deleteChatSetting(id: number) {
  try {
    await chatSettingsDB.chatSettings.delete(id);
    let event: ChatSettingsChangeEvent = {action: 'delete', gid: id};
    chatSettingsEmitter.emit('chatSettingsChanged', event);
  } catch (error) {
    console.error('Failed to update:', error);
  }
}

const chatSettingsDB = new ChatSettingsDB();

export default chatSettingsDB;

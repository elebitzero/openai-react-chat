import Dexie from 'dexie';
import {EventEmitter} from "./EventEmitter";

export interface Conversation {
    id: number;
    gid: number;
    timestamp: number;
    title: string;
    model: string | null,
    systemPrompt: string,
    messages: string; // JSON string of messages
    marker?: boolean;
}

export interface ConversationChangeEvent {
    action: 'add' | 'edit' | 'delete',
    id: number,
    conversation?: Conversation, // not set on delete
}

class ConversationDB extends Dexie {
    conversations: Dexie.Table<Conversation, number>;

    constructor() {
        super("conversationsDB");
        this.version(1).stores({
            conversations: '&id, timestamp, title, model, systemPrompt, messages'
        });
        this.version(2).stores({
            conversations: '&id, gid, timestamp, title, model, systemPrompt, messages'
        });
        this.conversations = this.table("conversations");
    }
}

const db = new ConversationDB();
const NUM_INITIAL_CONVERSATIONS = 200;

class ConversationService {

    static async getConversationById(id: number): Promise<Conversation | undefined> {
        return db.conversations.get(id);
    }

    static async searchConversationsByTitle(searchString: string): Promise<Conversation[]> {
        return db.conversations
            .filter(conversation => conversation.title.includes(searchString))
            .toArray();
    }

    static async searchWithinConversations(searchString: string): Promise<Conversation[]> {
        // Filtering after fetching due to parsing JSON "messages"
        return db.conversations
            .filter(conversation => conversation.messages.includes(searchString))
            .toArray();
    }

    static async updateConversationMessages(id: number, updatedMessages: any[]): Promise<void> {
        const conversation = await db.conversations.get(id);
        if (conversation) {
            conversation.messages = JSON.stringify(updatedMessages);
            await db.conversations.put(conversation);
        }
    }

    static async addConversation(conversation: Conversation): Promise<void> {
        await db.conversations.add(conversation);
        let event: ConversationChangeEvent = {action: 'add', id: conversation.id, conversation:conversation};
        conversationsEmitter.emit('conversationChangeEvent', event);
    }

    static async updateConversation(conversation: Conversation): Promise<void> {
        await db.conversations.put(conversation);
        let event: ConversationChangeEvent = {action: 'edit', id: conversation.id, conversation:conversation};
        conversationsEmitter.emit('conversationChangeEvent', event);
    }

    static async updateConversationPartial(conversation: Conversation, changes: any): Promise<number> {
        // todo: currently not emitting event for this case
        return db.conversations
            .update(conversation.id, changes)
    }

    static async deleteConversation(id: number): Promise<void> {
        await db.conversations.delete(id);
        let event: ConversationChangeEvent = {action: 'delete', id: id};
        conversationsEmitter.emit('conversationChangeEvent', event);
    }

    static async deleteAllConversations(): Promise<void> {
        await db.conversations.clear();
        let event: ConversationChangeEvent = {action: 'delete', id: 0};
        conversationsEmitter.emit('conversationChangeEvent', event);
    }

    static async loadRecentConversationsTitleOnly(): Promise<Conversation[]> {
        try {
            const conversations = await db.conversations
                .orderBy('timestamp')
                .reverse()
                .limit(NUM_INITIAL_CONVERSATIONS)
                .toArray();
            return conversations;
        } catch (error) {
            console.error("Error loading recent conversations:", error);
            throw error;
        }
    }

    static async countConversationsByGid(id: number): Promise<number> {
        return db.conversations
            .where('gid').equals(id)
            .count();
    }

    static async deleteConversationsByGid(id: number): Promise<void> {
        const conversationsToDelete = db.conversations
            .where('gid').equals(id)

        await conversationsToDelete.delete();
        let event: ConversationChangeEvent = {action: 'delete', id: 0};
        conversationsEmitter.emit('conversationChangeEvent', event);
    }

}

export const conversationsEmitter = new EventEmitter<ConversationChangeEvent>();
export default ConversationService;

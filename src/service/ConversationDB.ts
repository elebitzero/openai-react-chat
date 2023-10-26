import Dexie from 'dexie';

export interface Conversation {
    id: number;
    timestamp: number;
    title: string;
    model: string,
    systemPrompt: string,
    messages: string; // We're storing the messages as a JSON string
    marker?: boolean; // If marker=true, then this is placeholder conversation
    // where title is a heading e.g. 'Today', 'Yesterday', used in sidebar
}

class ConversationDB extends Dexie {
    conversations: Dexie.Table<Conversation, number>;  // number is the type of the primary key

    constructor() {
        super("conversationsDB");
        this.version(1).stores({
            conversations: 'id, timestamp, title, model, systemPrompt, messages'
        });
        this.conversations = this.table("conversations");
    }
}

export async function getConversationById(id: number): Promise<Conversation | undefined> {
    return db.conversations.get(id);
}

export async function searchConversationsByTitle(searchString: string): Promise<Conversation[]> {
    const results = await db.conversations
        .filter(conversation => conversation.title.includes(searchString))
        .toArray();
    return results;
}


const db = new ConversationDB();

export default db;

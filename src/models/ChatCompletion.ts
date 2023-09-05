export interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: ChatCompletionChoice[];
}

export enum Role {
    System = 'system',
    User = 'user',
    Assistant = 'assistant',
}

export function getRole(roleString: string): Role {
    return Role[roleString as keyof typeof Role];
}

export enum MessageType {
    Normal = 'normal',
    Error = 'error',
}

export function getMessageType(messageTypeString: string): MessageType {
    return MessageType[messageTypeString as keyof typeof MessageType];
}

export interface ChatMessage {
    id?: number;
    role: Role;
    messageType: MessageType;
    content: string;
    name?: string;
}

export interface ChatCompletionChoice {
    message: ChatMessage;
    finish_reason: string;
    index: number;
}

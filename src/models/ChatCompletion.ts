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

export interface ChatMessage {
    role: string;
    content: string;
    name?: string;
}

export interface ChatCompletionChoice {
    message: ChatMessage;
    finish_reason: string;
    index: number;
}

import {contextWindowSizes, OpenAIModel} from "../models/model";
import {ChatCompletion, ChatMessage} from "../models/ChatCompletion";
import {CHAT_PARAMETERS, OPENAI_API_KEY} from "../config";
import {CustomError} from "./CustomError";
import {CHAT_COMPLETIONS_ENDPOINT, MODELS_ENDPOINT} from "../constants/apiEndpoints";

interface CompletionChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: CompletionChunkChoice[];
}

interface CompletionChunkChoice {
    index: number;
    delta: {
        content: string;
    };
    finish_reason: null | string; // If there can be other values than 'null', use appropriate type instead of string.
}

export class ChatService {
    private static models: Promise<OpenAIModel[]> | null = null;
    static selectedModelId: string = '';

    static setSelectedModelId(modelId: string) {
        this.selectedModelId = modelId;
    }

    static getSelectedModelId(): string {
        return this.selectedModelId;
    }

    static async sendMessage(messages: ChatMessage[], modelId: string): Promise<ChatCompletion> {

        let endpoint = CHAT_COMPLETIONS_ENDPOINT;
        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        };

        // Map to a new array with the messageType removed
        const messagesWithoutMessageType =
            messages.map(({messageType, id: number, ...rest}) => rest);

        const requestBody = {
            model: modelId,
            messages: messagesWithoutMessageType,
            temperature: CHAT_PARAMETERS.temperature
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new CustomError(err.error.message, err);
        }

        return await response.json();
    }


    static async sendMessageStreamed(messages: ChatMessage[], modelId: string, callback: (content: string) => void): Promise<any> {
        let endpoint = "https://api.openai.com/v1/chat/completions";
        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        };

        // Map to a new array with the messageType removed
        const messagesWithoutMessageType =
            messages.map(({messageType, id: number, ...rest}) => rest);

        const requestBody = {
            model: modelId,
            messages: messagesWithoutMessageType,
            stream: true,
            temperature: CHAT_PARAMETERS.temperature
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody),

        });

        if (!response.ok) {
            const err = await response.json();
            throw new CustomError(err.error.message, err);
        }

        if (response.body) {
            // Read the response as a stream of data
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let partialDecodedChunk = undefined;
            while (true) {
                const streamChunk = await reader.read();
                const {done, value} = streamChunk;
                if (done) {
                    break;
                }
                let DONE = false;
                let decodedChunk = decoder.decode(value);
                if (partialDecodedChunk) {
                    decodedChunk = "data: "+partialDecodedChunk+decodedChunk;
                }
                const rawData = decodedChunk.split("data: ").filter(Boolean);  // Split on "data: " and remove any empty strings
                const chunks: CompletionChunk[] = rawData.map((chunk, index) => {
                    partialDecodedChunk = undefined;
                    if (chunk.trim() === '[DONE]') {
                        DONE = true;
                        return; // Skip parsing this term and continue with the next
                    }
                    let o;
                    try {
                        o = JSON.parse(chunk);
                    }
                    catch (err) {
                        if (index === rawData.length - 1) { // Check if this is the last element
                            partialDecodedChunk = chunk;
                        } else if (err instanceof Error) {
                            console.error(err.message);
                        }
                    }
                    return o;
                }).filter(Boolean); // Filter out undefined values which may be a result of the [DONE] term check

                chunks.forEach(chunk => {
                    chunk.choices.forEach(choice => {
                        if (choice.delta && choice.delta.content) {  // Check if delta and content exist
                            const content = choice.delta.content;
                            try {
                                callback(content);
                            }
                            catch (err) {
                                if (err instanceof Error) {
                                    console.error(err.message);
                                }
                                console.log('error in client. continuing...')
                            }
                        } else if (choice?.finish_reason === 'stop') {
                            // done
                        }
                    });
                });
                if (DONE) {
                    return;
                }
            }
        }
    }

    static fetchModels = (): Promise<OpenAIModel[]> => {
        if (this.models !== null) {
            return Promise.resolve(this.models);
        }
        this.models = fetch(MODELS_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error.message);
                    });
                }
                return response.json();
            })
            .catch(err => {
                throw new Error(err.message || err);
            })
          .then(data => {
              const models: OpenAIModel[] = data.data;
              // Filter, enrich with contextWindow from the imported constant, and sort
              return models
                .filter(model => model.id.startsWith("gpt-"))
                .map(model => ({
                    ...model,
                    context_window: contextWindowSizes[model.id] || 0 // Use the imported constant
                }))
                .sort((a, b) => a.id.localeCompare(b.id));
          });

        return this.models;
    };


}


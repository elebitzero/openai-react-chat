import {modelDetails, OpenAIModel} from "../models/model";
import {ChatCompletionRequest, ChatCompletion, ChatMessage} from "../models/ChatCompletion";
import {OPENAI_API_KEY} from "../config";
import {CustomError} from "./CustomError";
import {CHAT_COMPLETIONS_ENDPOINT, MODELS_ENDPOINT} from "../constants/apiEndpoints";
import { ChatSettings } from "../models/ChatSettings";
import {CHAT_STREAM_DEBOUNCE_TIME, DEFAULT_MODEL} from "../constants/appConstants";
import {NotificationService} from '../service/NotificationService';

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
    static abortController: AbortController | null = null;

    static async sendMessage(messages: ChatMessage[], modelId: string): Promise<ChatCompletion> {
        let endpoint = CHAT_COMPLETIONS_ENDPOINT;
        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        };

        // Map to a new array with the messageType removed
        const messagesWithoutMessageType =
            messages.map(({messageType, id: number, ...rest}) => rest);

        const requestBody: ChatCompletionRequest = {
            model: modelId,
            messages: messagesWithoutMessageType,
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

        return await response.json();
    }

    private static lastCallbackTime: number = 0;
    private static callDeferred: number | null = null;
    private static accumulatedContent: string = ""; // To accumulate content between debounced calls

    static debounceCallback(callback: (content: string) => void, delay: number = CHAT_STREAM_DEBOUNCE_TIME) {
        return (content: string) => {
            this.accumulatedContent += content; // Accumulate content on each call
            const now = Date.now();
            const timeSinceLastCall = now - this.lastCallbackTime;

            if (this.callDeferred !== null) {
                clearTimeout(this.callDeferred);
            }

            this.callDeferred = window.setTimeout(() => {
                callback(this.accumulatedContent); // Pass the accumulated content to the original callback
                this.lastCallbackTime = Date.now();
                this.accumulatedContent = ""; // Reset the accumulated content after the callback is called
            }, delay - timeSinceLastCall < 0 ? 0 : delay - timeSinceLastCall);  // Ensure non-negative delay

            this.lastCallbackTime = timeSinceLastCall < delay ? this.lastCallbackTime : now; // Update last callback time if not within delay
        };
    }

    static async sendMessageStreamed(chatSettings: ChatSettings,messages: ChatMessage[], callback: (content: string) => void): Promise<any> {
        const debouncedCallback = this.debounceCallback(callback);
        this.abortController = new AbortController();
        let endpoint = CHAT_COMPLETIONS_ENDPOINT;
        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        };

        // Map to a new array with the messageType removed
        const messagesWithoutMessageType =
            messages.map(({messageType, id: number, ...rest}) => rest);

        const requestBody: ChatCompletionRequest = {
            model: DEFAULT_MODEL,
            messages: messagesWithoutMessageType,
            stream: true,
        };

        if (chatSettings) {
            const {model, temperature, top_p, seed} = chatSettings;
            requestBody.model = model ?? requestBody.model;
            requestBody.temperature = temperature ?? requestBody.temperature;
            requestBody.top_p = top_p ?? requestBody.top_p;
            requestBody.seed = seed ?? requestBody.seed;
        }


        let response: Response;
        try {
            response = await fetch(endpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                NotificationService.handleUnexpectedError(error,'Stream reading was aborted.');
            } else if (error instanceof Error) {
                NotificationService.handleUnexpectedError(error,'Error reading streamed response.');
            } else {
                console.error('An unexpected error occurred');
            }
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            throw new CustomError(err.error.message, err);
        }

        if (this.abortController.signal.aborted) {
            // todo: propagate to ui?
            console.log('Stream aborted');
            return; // Early return if the fetch was aborted
        }

        if (response.body) {
            // Read the response as a stream of data
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let partialDecodedChunk = undefined;
            try {
                while (true) {
                    const streamChunk = await reader.read();
                    const {done, value} = streamChunk;
                    if (done) {
                        break;
                    }
                    let DONE = false;
                    let decodedChunk = decoder.decode(value);
                    if (partialDecodedChunk) {
                        decodedChunk = "data: " + partialDecodedChunk + decodedChunk;
                        partialDecodedChunk = undefined;
                    }
                    const rawData = decodedChunk.split("data: ").filter(Boolean);  // Split on "data: " and remove any empty strings
                    const chunks: CompletionChunk[] = rawData.map((chunk, index) => {
                        partialDecodedChunk = undefined;
                        chunk = chunk.trim();
                        if (chunk.length == 0) {
                            return;
                        }
                        if (chunk === '[DONE]') {
                            DONE = true;
                            return;
                        }
                        let o;
                        try {
                            o = JSON.parse(chunk);
                        } catch (err) {
                            if (index === rawData.length - 1) { // Check if this is the last element
                                partialDecodedChunk = chunk;
                            } else if (err instanceof Error) {
                                console.error(err.message);
                            }
                        }
                        return o;
                    }).filter(Boolean); // Filter out undefined values which may be a result of the [DONE] term check

                    let accumulatedContet = '';
                    chunks.forEach(chunk => {
                        chunk.choices.forEach(choice => {
                            if (choice.delta && choice.delta.content) {  // Check if delta and content exist
                                const content = choice.delta.content;
                                        try {
                                            accumulatedContet += content;
                                        } catch (err) {
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
                    debouncedCallback(accumulatedContet);

                    if (DONE) {
                        return;
                    }
                }
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    NotificationService.handleUnexpectedError(error,'Stream reading was aborted.');
                } else if (error instanceof Error) {
                    NotificationService.handleUnexpectedError(error,'Error reading streamed response.');
                } else {
                    console.error('An unexpected error occurred');
                }
                return;
            }
        }
    }

    static cancelStream = (): void => {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    static getModels = (): Promise<OpenAIModel[]> => {
        return ChatService.fetchModels();
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
                    context_window: modelDetails[model.id].contextWindowSize || 0,// Use the imported constant
                    knowledge_cutoff: modelDetails[model.id].knowledgeCutoffDate || '' // Use the imported constant
                }))
                .sort((a, b) => b.id.localeCompare(a.id));
          });
        return this.models;
    };
}


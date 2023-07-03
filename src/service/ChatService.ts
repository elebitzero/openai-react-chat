import {OpenAIModel} from "../models/model";
import {ChatCompletion, ChatMessage} from "../models/ChatCompletion";
import {REACT_APP_OPENAI_API_KEY} from "../config";

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

        let endpoint = "https://api.openai.com/v1/chat/completions";
        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${REACT_APP_OPENAI_API_KEY}`
        };

        const requestBody = {
            model: modelId,
            messages: messages,
            temperature: 0.7
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error("Failed to send message");
        }

        return await response.json();
    }

    static fetchModels = (): Promise<OpenAIModel[]> => {
        if (this.models !== null) {
            return this.models;
        }
        this.models = fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${REACT_APP_OPENAI_API_KEY}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    console.error('Error fetching models:', response.status, response.statusText);
                    return [];
                }
                return response.json();
            })
            .then(data => {
                const models: OpenAIModel[] = data.data;

                // Ref: https://platform.openai.com/docs/models/model-endpoint-compatibility
                let filteredModels: OpenAIModel[] = models.filter(model => model.id.startsWith("gpt-"));

                const sortedModels = [...filteredModels].sort((a, b) => a.id.localeCompare(b.id));
                return sortedModels;
            });

        return this.models;
    };
}


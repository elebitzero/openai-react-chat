import {OpenAIModel} from "../models/model";
import {ChatCompletion, ChatMessage} from "../models/ChatCompletion";
import {REACT_APP_OPENAI_API_KEY} from "../config";

export class ChatService {

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

    static fetchModels = async (): Promise<OpenAIModel[]> => {
        console.log('fetch models called');
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${REACT_APP_OPENAI_API_KEY}`,
            },
        });

        if (response.ok) {
            const data = await response.json();

            const models: OpenAIModel[] = data.data;
            const OWNED_BY_FILTER: string[] = [
                'openai'
            ];

            let filteredModels: OpenAIModel[] = models.filter(model => OWNED_BY_FILTER.includes(model.owned_by));

            const sortedModels = [...filteredModels].sort((a, b) => a.id.localeCompare(b.id));
            return sortedModels;
        } else {
            console.error('Error fetching models:', response.status, response.statusText);
            return [];
        }
    };
}


import {OpenAIModel} from "../models/model";
import {ChatCompletion, ChatMessage} from "../models/ChatCompletion";

export class ChatService {


    static async sendMessage(messages: ChatMessage[]): Promise<ChatCompletion> {

        let endpoint = "https://api.openai.com/v1/chat/completions";
        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        };

        const requestBody = {
            model: "gpt-3.5-turbo",
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
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            },
        });

        if (response.ok) {
            const data = await response.json();

            const models: OpenAIModel[] = data.data;
            const OWNED_BY_FILTER: string[] = [
                'openai'
            ];

            return models.filter(model => OWNED_BY_FILTER.includes(model.owned_by));
        } else {
            console.error('Error fetching models:', response.status, response.statusText);
            return [];
        }
    };
}


import {OpenAIModel} from "../models/model";
import {OPENAI_API_KEY} from "../config";
import {CustomError} from "./CustomError";
import {MODELS_ENDPOINT, TTS_ENDPOINT} from "../constants/apiEndpoints";
import {SpeechSettings} from "../models/SpeechSettings"; // Adjust the path as necessary

export class SpeechService {
  private static models: Promise<OpenAIModel[]> | null = null;

  static async textToSpeech(text: string, settings: SpeechSettings): Promise<string> {
    const endpoint = TTS_ENDPOINT;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    };

    if (text.length > 4096) {
      throw new Error("Input text exceeds the maximum length of 4096 characters.");
    }

    if (settings.speed < 0.25 || settings.speed > 4.0) {
      throw new Error("Speed must be between 0.25 and 4.0.");
    }

    const requestBody = {
      model: settings.id,
      voice: settings.voice,
      input: text,
      speed: settings.speed,
      response_format: "mp3",
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

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  static getModels = (): Promise<OpenAIModel[]> => {
    return SpeechService.fetchModels();
  };

  static async fetchModels(): Promise<OpenAIModel[]> {
    if (this.models !== null) {
      return this.models;
    }

    try {
      const response = await fetch(MODELS_ENDPOINT, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error.message);
      }

      const data = await response.json();
      const models: OpenAIModel[] = data.data.filter((model: OpenAIModel) => model.id.includes("tts"));
      this.models = Promise.resolve(models);
      return models;
    } catch (err: any) {
      throw new Error(err.message || err);
    }
  }
}

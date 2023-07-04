import env from './env.json';
import {OpenAIModel} from "./models/model";

export const OPENAI_API_KEY =  (env as any).openapi_key;
export const OPENAI_MODEL_LIST: string[] =  (env as any).default_model_list ?? [];
export const OPENAI_DEFAULT_MODEL: string =  (env as any).default_model;

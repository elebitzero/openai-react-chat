import env from './env.json';

export const OPENAI_API_KEY =  (env as any).openapi_key;
export const OPENAI_MODEL_LIST: string[] =  (env as any).default_model_list ?? [];
export const OPENAI_DEFAULT_MODEL: string =  (env as any).default_model;
export const CHAT_PARAMETERS: any = (env as any).chat_parameters;

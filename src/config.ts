import env from './env.json';
import {OpenAIModel} from "./models/model";

export const REACT_APP_OPENAI_API_KEY =  (env as any).REACT_APP_OPENAI_API_KEY;
export const REACT_APP_OPENAI_MODEL_LIST: string[] =  (env as any).REACT_APP_OPENAI_MODEL_LIST ?? [];
export const REACT_APP_OPENAI_DEFAULT_MODEL: string =  (env as any).REACT_APP_OPENAI_DEFAULT_MODEL;

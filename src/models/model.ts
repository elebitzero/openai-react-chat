export interface ModelPermission {
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    group: null | string;
    is_blocking: boolean;
}

export interface OpenAIModel {
    id: string;
    object: string;
    owned_by: string;
    permission: ModelPermission[];
    context_window: number;
}

export interface OpenAIModelListResponse {
    data: OpenAIModel[];
    object: string;
}

export const contextWindowSizes: { [modelId: string]: number } = {
    "gpt-4-0125-preview": 128000,
    "gpt-4-turbo-preview": 128000,
    "gpt-4-1106-preview": 128000,
    "gpt-4-vision-preview": 128000,
    "gpt-4": 8192,
    "gpt-4-0613": 8192,
    "gpt-4-32k": 32768,
    "gpt-4-32k-0613": 32768,
    "gpt-3.5-turbo-0125": 16385,
    "gpt-3.5-turbo-0301" : 4096,
    "gpt-3.5-turbo": 4096,
    "gpt-3.5-turbo-1106": 16385,
    "gpt-3.5-turbo-instruct": 4096,
    "gpt-3.5-turbo-instruct-0914": 4096,
    "gpt-3.5-turbo-16k": 16385,
    "gpt-3.5-turbo-0613": 4096,
    "gpt-3.5-turbo-16k-0613": 16385
};

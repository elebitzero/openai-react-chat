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
    knowledge_cutoff: string;
}

export interface OpenAIModelListResponse {
    data: OpenAIModel[];
    object: string;
}

export const modelDetails: { [modelId: string]: { contextWindowSize: number, knowledgeCutoffDate: string } } = {
    "gpt-4-0125-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023"},
    "gpt-4-turbo-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023"},
    "gpt-4-1106-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023"},
    "gpt-4-vision-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023"},
    "gpt-4": {contextWindowSize: 8192, knowledgeCutoffDate: "9/2021"},
    "gpt-4-0613": {contextWindowSize: 8192, knowledgeCutoffDate: "9/2021"},
    "gpt-4-32k": {contextWindowSize: 32768, knowledgeCutoffDate: "9/2021"},
    "gpt-4-32k-0613": {contextWindowSize: 32768, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-0125": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-0301": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-1106": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-instruct": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-instruct-0914": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-16k": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-0613": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021"},
    "gpt-3.5-turbo-16k-0613": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021"}
};

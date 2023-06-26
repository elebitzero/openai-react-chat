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
}

export interface OpenAIModelListResponse {
    data: OpenAIModel[];
    object: string;
}

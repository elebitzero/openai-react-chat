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
  image_support: boolean;
  preferred: boolean;
  deprecated: boolean;
}

export interface OpenAIModelListResponse {
  data: OpenAIModel[];
  object: string;
}

export const modelDetails: { [modelId: string]: { contextWindowSize: number, knowledgeCutoffDate: string, imageSupport: boolean, preferred: boolean, deprecated: boolean } } = {
  "chatgpt-4o-latest": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: true, deprecated: false},
  "o1-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "o1-preview-2024-09-12": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "o1-mini": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "o1-mini-2024-09-12": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: true, deprecated: false},
  "gpt-4o-mini-audio-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-mini-audio-preview-2024-12-17": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-audio-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-audio-preview-2024-10-01": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-audio-preview-2024-12-17": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-2024-05-13": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: false, deprecated: false},
  "gpt-4o-2024-08-06": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: false, deprecated: false},
  "gpt-4o-2024-11-20": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: false, deprecated: false},
  "gpt-4o-mini": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: true, deprecated: false},
  "gpt-4o-mini-2024-07-18": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: true, preferred: false, deprecated: false},
  "gpt-4o-mini-realtime-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-mini-realtime-preview-2024-12-17": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-realtime-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-realtime-preview-2024-10-01": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4o-realtime-preview-2024-12-17": {contextWindowSize: 128000, knowledgeCutoffDate: "10/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4-turbo": {contextWindowSize: 128000, knowledgeCutoffDate: "12/2023", imageSupport: true, preferred: false, deprecated: true},
  "gpt-4-turbo-2024-04-09": {contextWindowSize: 128000, knowledgeCutoffDate: "12/2023",  imageSupport: true, preferred: false, deprecated: false},
  "gpt-4-turbo-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "12/2023", imageSupport: false,  preferred: false, deprecated: false},
  "gpt-4-0125-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "12/2023",  imageSupport: false, preferred: false, deprecated: true},
  "gpt-4-1106-vision-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023", imageSupport: true, preferred: false, deprecated: true},
  "gpt-4-1106-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4-vision-preview": {contextWindowSize: 128000, knowledgeCutoffDate: "4/2023", imageSupport: true, preferred: false, deprecated: true},
  "gpt-4": {contextWindowSize: 8192, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: false},
  "gpt-4-0613": {contextWindowSize: 8192, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: false},
  "gpt-4-32k": {contextWindowSize: 32768, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true},
  "gpt-4-32k-0613": {contextWindowSize: 32768, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true},
  "gpt-3.5-turbo": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: false},
  "gpt-3.5-turbo-0125": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: false},
  "gpt-3.5-turbo-0301": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true},
  "gpt-3.5-turbo-1106": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: false},
  "gpt-3.5-turbo-instruct": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: false},
  "gpt-3.5-turbo-instruct-0914": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true},
  "gpt-3.5-turbo-16k": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true},
  "gpt-3.5-turbo-0613": {contextWindowSize: 4096, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true},
  "gpt-3.5-turbo-16k-0613": {contextWindowSize: 16385, knowledgeCutoffDate: "9/2021", imageSupport: false, preferred: false, deprecated: true}
};

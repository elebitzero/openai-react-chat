import React from 'react';
import Select from 'react-select';
import { OpenAIModel } from '../models/model';

interface ModelSelectProps {
    models: OpenAIModel[];
    selectedModel: OpenAIModel | null;
    onModelSelect: (model: OpenAIModel) => void;
    className?: string;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
                                                     models,
                                                     selectedModel,
                                                     onModelSelect,
                                                     className
                                                 }) => {

    const sortedModels = [...models].sort((a, b) => a.id.localeCompare(b.id));

    if (!selectedModel){
        selectedModel = sortedModels[0];
    }

    const options = sortedModels.map((model) => ({
        value: model.id,
        label: model.id,
    }));

    const selectedOption = selectedModel
        ? { value: selectedModel.id, label: selectedModel.id }
        : null;

    const handleModelChange = (selectedOption: any) => {
        const modelId = selectedOption.value;
        const selectedModel = !models
            ? undefined :
            models.find((model) => model.id === modelId);
        if (selectedModel) {
            onModelSelect(selectedModel);
        }
    };

    return (
        <div className="model-toggle">
            <Select
                className="model-toggle-select"
                options={options}
                value={selectedOption}
                onChange={handleModelChange}
                isSearchable={true}
                placeholder="Select a model"
            />
        </div>
    );
};

export default ModelSelect;

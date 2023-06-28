import React from 'react';
import Select from 'react-select';
import { OpenAIModel } from './models/model';

interface ModelToggleProps {
    models: OpenAIModel[];
    selectedModel: OpenAIModel | null;
    onModelSelect: (model: OpenAIModel) => void;
}

const ModelToggle: React.FC<ModelToggleProps> = ({
                                                     models,
                                                     selectedModel,
                                                     onModelSelect,
                                                 }) => {
    const options = models.map((model) => ({
        value: model.id,
        label: model.name,
    }));

    const selectedOption = selectedModel
        ? { value: selectedModel.id, label: selectedModel.name }
        : null;

    const handleModelChange = (selectedOption: any) => {
        const modelId = selectedOption.value;
        const selectedModel = models.find((model) => model.id === modelId);
        if (selectedModel) {
            onModelSelect(selectedModel);
        }
    };

    return (
        <div className="model-toggle">
            <label className="model-toggle-label">Select Model:</label>
            <Select
                className="model-toggle-select"
                options={options}
                value={selectedOption}
                onChange={handleModelChange}
                isSearchable={false}
                placeholder="Select a model"
            />
        </div>
    );
};

export default ModelToggle;

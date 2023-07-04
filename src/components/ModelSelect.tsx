import React, {useEffect, useState} from 'react';
import Select, {SingleValue} from 'react-select';
import {OpenAIModel} from '../models/model';
import {ChatService} from '../service/ChatService';
import {OPENAI_DEFAULT_MODEL} from "../config";

interface ModelSelectProps {
    onModelSelect?: (modelId: string) => void;
    models: OpenAIModel[];
    className?: string;
}

type SelectOption = { label: string; value: string };

const ModelSelect: React.FC<ModelSelectProps> = ({
                                                     onModelSelect,
                                                     models, // Use models from props
                                                     className,
                                                 }) => {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<SelectOption>({
        value: 'model-not-set',
        label: ''
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [isMore, setIsMore] = useState<boolean>(false);
    const SHOW_MORE_MODELS = "Show more models";
    const SHOW_FEWER_MODELS = "Show fewer models";

    useEffect(() => {
        if (models && models.length > 0) {
            const defaultOptions = models.filter(model => !/\-\d{4}$/.test(model.id));
            const moreOptions = models.filter(model => /\-\d{4}$/.test(model.id));

            setOptions([
                ...defaultOptions.map((model) => ({ value: model.id, label: model.id })),
                { value: "more", label: SHOW_MORE_MODELS }
            ]);

            if (OPENAI_DEFAULT_MODEL && OPENAI_DEFAULT_MODEL.length > 0) {
                let found = false;
                for (const model of models) {
                    if (model.id === OPENAI_DEFAULT_MODEL) {
                        setSelectedOption({ value: model.id, label: model.id });
                        found = true;
                        break;
                    }
                }
                if (found) {
                    setLoading(false);
                    return;
                } else {
                    console.log('Model ' + OPENAI_DEFAULT_MODEL + ' not in the list of models');
                }
            }

            // Set the selectedOption to the first model in the list
            const firstModel = models[0];
            setSelectedOption({ value: firstModel.id, label: firstModel.id });
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [models]);

    useEffect(() => {
        ChatService.setSelectedModelId(selectedOption.value);
    }, [selectedOption]);

    const handleModelChange = (option: SingleValue<SelectOption>) => {
        if (option) {
            if (option.value === "more") {
                setOptions([
                    ...models.map((model) => ({value: model.id, label: model.id})),
                    {value: "less", label: SHOW_FEWER_MODELS}
                ]);
                setIsMore(true);
            } else if (option.value === "less") {
                const defaultOptions = models.filter(model => !/\-\d{4}$/.test(model.id));
                setOptions([
                    ...defaultOptions.map((model) => ({value: model.id, label: model.id})),
                    {value: "more", label: SHOW_MORE_MODELS}
                ]);
                setIsMore(false);
            } else {
                const modelId = option.value;
                setSelectedOption({
                    value: option.value,
                    label: option.label
                });
                if (onModelSelect) {
                    onModelSelect(modelId);
                }
                ChatService.setSelectedModelId(modelId);
            }
            setLoading(false);
        } else {
            setLoading(true);
        }
    };

    return (
        <div className='model-toggle'>
            <Select
                className='model-toggle-select'
                options={options}
                value={selectedOption}
                onChange={handleModelChange}
                isSearchable={true}
                placeholder='Select a model'
                isLoading={loading}
                styles={{
                    option: (provided, state) => ({
                        ...provided,
                        color: state.data.value === 'more' || state.data.value === 'less' ? 'blue' : 'black',
                    }),
                }}
            />
        </div>
    );
};

export default ModelSelect;

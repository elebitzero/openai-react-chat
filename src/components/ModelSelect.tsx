import React, {useEffect, useState} from 'react';
import Select, {SingleValue} from 'react-select';
import { OpenAIModel } from '../models/model';
import {REACT_APP_OPENAI_DEFAULT_MODEL, REACT_APP_OPENAI_MODEL_LIST} from "../config";
import {ChatService} from "../service/ChatService";

interface ModelSelectProps {
    onModelSelect?: (modelId: string) => void;
    className?: string;
}

type SelectOption = { label: string; value: string; }

const ModelSelect: React.FC<ModelSelectProps> = ({
                                                     onModelSelect,
                                                     className
                                                 }) => {
    const [models, setModels] = useState<OpenAIModel[]>([]);
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<SelectOption>({value: '', label: 'model-not-set'});

    useEffect(() => {
        console.log('Component mounted');
        return () => console.log('Component unmounted');
    }, []);

    useEffect(() => {
        if (REACT_APP_OPENAI_MODEL_LIST && REACT_APP_OPENAI_MODEL_LIST.length > 0) {
            const models: OpenAIModel[] = REACT_APP_OPENAI_MODEL_LIST.map(id => {
                return {
                    id: id,
                    object: 'model',
                    owned_by: '',
                    permission: [],
                };
            });
            setModels(models);
        } else {
            const getModels = async () => {
                const fetchedModels = await ChatService.fetchModels();
                setModels(fetchedModels);
            };

            getModels().catch((error) => {
                console.error('Error fetching models:', error);
            });
        }
    }, []);  // <- Empty dependency array means this effect runs once on mount

    useEffect(() => {
        console.log('dependency models changed...');
        setOptions(models.map((model) => ({
            value: model.id,
            label: model.id,
        })));

        if (models && models.length > 0) {
            const firstModel = models[0];
            setSelectedOption({value: firstModel.id, label: firstModel.id});
        }
    }, [models]);

    /*    useEffect(() => {
        if (REACT_APP_OPENAI_DEFAULT_MODEL && REACT_APP_OPENAI_DEFAULT_MODEL.length > 0) {
            let found = false;
            for (const model of models) {
                if (model.id === REACT_APP_OPENAI_DEFAULT_MODEL) {
                    setSelectedModel(model);
                    break;
                }
            }
            if (found) {
                return;
            } else {
                console.log('Model '+REACT_APP_OPENAI_DEFAULT_MODEL+' not in the list of models');
            }
        }
        setSelectedModel(models[0]);
    }, [models]);*/

    const handleModelChange = (option: SingleValue<SelectOption>) => {
        debugger;
        if (option) {
            const modelId = option.value;
            setSelectedOption({
                value: option.value,
                label: option.label,
            })
            if (onModelSelect) {
                onModelSelect(modelId);
            }
            ChatService.setSelectedModelId(modelId);
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

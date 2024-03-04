import React, {useContext, useEffect, useState} from 'react';
import Select, {
    ActionMeta,
    components,
    ControlProps,
    CSSObjectWithLabel,
    GroupBase, MultiValue,
    OptionProps,
    SingleValue,
    SingleValueProps,
    StylesConfig
} from 'react-select';
import {OpenAIModel} from '../models/model';
import {ChatService} from '../service/ChatService';
import {NotificationService} from '../service/NotificationService';
import {useTranslation} from 'react-i18next';
import Tooltip from "./Tooltip";
import {DEFAULT_MODEL} from "../constants/appConstants";
import './ModelSelect.css'
import {UserContext} from "../UserContext";

interface ModelSelectProps {
    onModelSelect?: (value: string | null) => void;
    models: OpenAIModel[];
    className?: string;
    allowNone?: boolean;
    allowNoneLabel?: string;
    value: string | null;
}

type SelectOption = { label: string; value: string; info: string };

const NONE_MODEL = {
    value: null,
    label: '(None)',
    info: '?k'
};

const ModelSelect: React.FC<ModelSelectProps> = ({
                                                     onModelSelect,
                                                     models: externalModels,
                                                     className,
                                                     value = null,
                                                     allowNone = false,
                                                     allowNoneLabel = '(None)',
                                                 }) => {
    const { userSettings, setUserSettings } = useContext(UserContext);
    const { t } = useTranslation();
    const [models, setModels] = useState<OpenAIModel[]>([]);
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<SelectOption>();
    const [loading, setLoading] = useState<boolean>(true);
    const SHOW_MORE_MODELS = t('show-more-models');
    const SHOW_FEWER_MODELS = t('show-fewer-models');
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const isDarkMode = () => userSettings.userTheme === 'dark';

    const customStyles: StylesConfig<SelectOption, false> = {
        option: (provided, state) => ({
            ...provided,
            color: state.isSelected ? 'white' : isDarkMode() ? 'white' : 'black',
            backgroundColor: isDarkMode() ? (state.isSelected ? '#4A5568' : state.isFocused ? '#2D3748' : '#1A202C') : state.isSelected ? '#edf2f7' : state.isFocused ? '#F2F2F2' : provided.backgroundColor,
            ':active': {
                backgroundColor: isDarkMode() ? (state.isSelected ? '#4A5568' : '#2D3748') : (state.isSelected ? 'var(--gray-200)' : '#F2F2F2'),
            },
        }),
        control: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode() ? '#2D3748' : 'white',
            color: isDarkMode() ? 'white' : 'black',
            borderColor: isDarkMode() ? '#4A5568' : '#E2E8F0',
            boxShadow: isDarkMode() ? '0 0 0 1px #4A5568' : 'none',
            '&:hover': {
                borderColor: isDarkMode() ? '#4A5568' : '#CBD5E0',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDarkMode() ? 'white' : 'black',
        }),
        // continue customizing other parts as needed
    };


    useEffect(() => {
        if (!models || models.length == 0) {
            setLoading(true);
            ChatService.getModels()
              .then(data => {
                  setModels(data);
              })
              .catch(err => {
                  NotificationService.handleUnexpectedError(err,'Failed to get model list.');
              });
        }
    }, []);

    useEffect(() => {
        if (value) {
            const matchingOption = options.find(option => option.value === value);
            if (matchingOption) {
                setSelectedOption(matchingOption);
            } else {
                console.warn(`No option found for value: ${value}`);
            }
        }
    }, [value]);


    useEffect(() => {
        if (externalModels.length > 0) {
            setModels(externalModels);
        }
        else {
            setLoading(true);
            ChatService.getModels()
              .then(data => {
                  setModels(data);
              })
              .catch(err => {
                  console.error('Error fetching model list', err);
              })
              .finally(() => setLoading(false));
        }
    }, [externalModels]);

    useEffect(() => {
        if (models && models.length > 0) {
            const defaultOptions = models.filter(model => !/-\d{4}$/.test(model.id)).
              filter(model => !/-\d{4}-preview$/.test(model.id));

            let initialOptions = [
                ...(allowNone ? [NONE_MODEL] : []), // Conditionally prepend the NONE_MODEL
                ...defaultOptions,
                { value: "more", label: SHOW_MORE_MODELS, info: '' }
            ];

            setOptions([
                ...defaultOptions.map((model) => ({value: model.id, label: model.id, info: formatContextWindow(model.context_window)})),
                {value: "more", label: SHOW_MORE_MODELS, info: ''}
            ]);
            let defaultModelId = DEFAULT_MODEL;
            if (value) {
                defaultModelId = value;
            }
            if (defaultModelId && defaultModelId.length > 0) {
                let found = false;
                for (const model of models) {
                    if (model.id === defaultModelId) {
                        setSelectedOption({value: model.id, label: model.id, info: formatContextWindow(model.context_window)});
                        found = true;
                        break;
                    }
                }
                if (found) {
                    setLoading(false);
                    return;
                } else {
                    console.warn('Model ' + defaultModelId + ' not in the list of models');
                }
            }

            // else set the selectedOption to the first model in the list
            const firstModel = models[0];
            setSelectedOption({value: firstModel.id, label: firstModel.id, info: formatContextWindow(firstModel.context_window)});
            setLoading(false);
        }
    }, [models]);

    useEffect(() => {
        if (selectedOption) {
            value = selectedOption.value;
            if (onModelSelect) {
                onModelSelect(value);
            }
        }
    }, [selectedOption]);


    const formatContextWindow = (context_window: number) => {
        return Math.round(context_window / 1000)+'k';
    }

    const handleModelChange = (option: SingleValue<SelectOption> | MultiValue<SelectOption>,
                               actionMeta: ActionMeta<SelectOption>) => {
        if (Array.isArray(option)) {
            console.error("Unexpected MultiValue in single-select component", option);
            return;
        }
        option = option as SingleValue<SelectOption>;

        if (option) {
            if (option.value === "more") {
                setOptions([
                    ...models.map((model) => ({value: model.id, label: model.id, info: formatContextWindow(model.context_window)})),
                    {value: "less", label: SHOW_FEWER_MODELS, info: ''}
                ]);
                setMenuIsOpen(true);
            } else if (option.value === "less") {
                const defaultOptions = models.filter(model => !/-\d{4}$/.test(model.id));
                setOptions([
                    ...defaultOptions.map((model) => ({value: model.id, label: model.id, info: formatContextWindow(model.context_window)})),
                    {value: "more", label: SHOW_MORE_MODELS, info: ''}
                ]);
                setMenuIsOpen(true);
            } else {
                const modelId = option.value;
                setSelectedOption({
                    value: option.value,
                    label: option.label,
                    info: option.info
                });
                if (onModelSelect) {
                    onModelSelect(modelId);
                }
                value = modelId;
                setMenuIsOpen(false);
            }
            setLoading(false);
        } else {
            setLoading(true);
            setMenuIsOpen(false);
        }
    };

    const customSingleValue: React.FC<SingleValueProps<SelectOption>> = ({ children, ...props }) => (
      <components.SingleValue {...props}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{props.data.label}</span>
              <Tooltip title={t('context-window')} side="right" sideOffset={10}>
                  <span style={{marginLeft: '10px', fontSize: '0.85rem', color: '#6b7280'}}>{props.data.info}</span>
              </Tooltip>
          </div>
      </components.SingleValue>
    );

    const customOption: React.FC<OptionProps<SelectOption, false>> = (props) => (
      <components.Option {...props}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{props.data.label}</span>
              <Tooltip title={t('context-window')} side="right" sideOffset={10}>
                  <span style={{marginLeft: '10px', fontSize: '0.85rem', color: '#6b7280'}}>{props.data.info}</span>
              </Tooltip>
          </div>
      </components.Option>
    );

    return (
      <div className='model-toggle'>
            <Select
                className='model-toggle-select'
                options={options}
                value={selectedOption}
                onChange={handleModelChange}
                isSearchable={true}
                placeholder={t('select-a-model')}
                isLoading={loading}
                styles={customStyles}
                components={{
                    Option: customOption,
                    SingleValue: customSingleValue,
                }}
                menuIsOpen={menuIsOpen}
                onMenuClose={() => setMenuIsOpen(false)}
                onMenuOpen={() => setMenuIsOpen(true)}
            />
        </div>
    );
};

export default ModelSelect;

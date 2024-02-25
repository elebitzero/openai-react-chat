import React, {useEffect, useState} from 'react';
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
import {OPENAI_DEFAULT_MODEL} from "../config";
import {useTranslation} from 'react-i18next';
import Tooltip from "./Tooltip";
import {DEFAULT_MODEL} from "../constants/appConstants";

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
                                                     models,
                                                     className,
                                                     value = null,
                                                     allowNone = false,
                                                     allowNoneLabel = '(None)',
                                                 }) => {
    const { t } = useTranslation();
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<SelectOption>();
    const [loading, setLoading] = useState<boolean>(true);
    const SHOW_MORE_MODELS = t('show-more-models');
    const SHOW_FEWER_MODELS = t('show-fewer-models');
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const customStyles: StylesConfig<SelectOption, false> = {
        option: (provided: CSSObjectWithLabel, state: OptionProps<SelectOption, false, GroupBase<SelectOption>>) => ({
            ...provided,
            color: state.data.value === 'more' || state.data.value === 'less' ? 'var(--primary)' : 'black',
            backgroundColor: state.isSelected
                ? 'var(--gray-200)'
                : state.isFocused
                    ? '#F2F2F2'
                    : provided.backgroundColor,
            ':active': {
                ...provided[':active'],
                backgroundColor: !state.isDisabled
                    ? (state.isSelected ? 'var(--gray-600)' : '#F2F2F2')
                    : provided[':active'] ? provided[':active'].backgroundColor : undefined,
            },
        }),
        control: (provided: CSSObjectWithLabel, state: ControlProps<SelectOption, false, GroupBase<SelectOption>>) => ({
            ...provided,
            boxShadow: state.isFocused ? '0 0 0 1px var(--gray-600)' : 'none',
            borderColor: state.isFocused ? 'var(--gray-600)' : 'var(--gray-600)',
        }),
        singleValue: (provided, state: SingleValueProps<SelectOption>) => ({
            ...provided,
            color: state.isDisabled ? 'var(--gray-600)' : provided.color,
        }),
        // Add other custom styles if needed for other parts of the select component
    };

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
        } else {
            setLoading(true);
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

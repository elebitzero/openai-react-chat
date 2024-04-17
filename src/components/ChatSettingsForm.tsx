import React, {ChangeEvent, useEffect, useState} from 'react';
import AvatarFieldEditor, {ImageSource} from "./AvatarFieldEditor";
import 'rc-slider/assets/index.css';
import ModelSelect from './ModelSelect';
import TemperatureSlider from './TemperatureSlider';
import TopPSlider from './TopPSlider';
import {ChatSettings} from '../models/ChatSettings';
import {EditableField} from './EditableField';
import {useTranslation} from 'react-i18next';
import {NotificationService} from "../service/NotificationService";
import FormLabel from "./FormLabel";
import {DEFAULT_MODEL} from "../constants/appConstants";

interface ChatSettingsFormProps {
  chatSettings?: ChatSettings;
  readOnly?: boolean;
  onChange?: (updatedChatSettings: ChatSettings) => void;
}

const DUMMY_CHAT_SETTINGS: ChatSettings = {
  id: Date.now(),
  author: 'user',
  icon: null,
  name: '',
  description: '',
  instructions: 'You are a helpful assistant.',
  model: null,
  seed: null,
  temperature: null,
  top_p: null
};

const ChatSettingsForm: React.FC<ChatSettingsFormProps> = ({chatSettings, readOnly = false, onChange = undefined}) => {
  const [formData, setFormData] = useState<ChatSettings>(chatSettings || DUMMY_CHAT_SETTINGS);
  const {t} = useTranslation();

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData]);

  useEffect(() => {
    setFormData(chatSettings || DUMMY_CHAT_SETTINGS);
  }, [chatSettings]);

  const onImageChange = (image: ImageSource) => {
    setFormData({...formData, icon: image});
  };

  const handleInputChange = (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const {name, value, type} = event.target;
    if (type === 'number') {
      setFormData({...formData, [name]: value ? parseFloat(value) : null});
    } else {
      setFormData({...formData, [name]: value});
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    NotificationService.handleSuccess('Form submitted successfully.');
  };

  return (
      <div className="w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto pt-3">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 px-8 pt-6 pb-8 mb-4">
          <AvatarFieldEditor readOnly={readOnly}
                             image={formData?.icon ? formData.icon : {data: null, type: 'raster'}}
                             onImageChange={onImageChange}/>
          <div className="mb-4">
            <FormLabel readOnly={readOnly} label={`${t('name-header')}${readOnly ? '' : ' *'}`} htmlFor="name"
                       value={formData.name || t('non-applicable')}></FormLabel>
            {readOnly ?
                <p className="text-gray-700 dark:text-gray-300">{formData.name || t('non-applicable')}</p> :
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    required={!readOnly}
                    onChange={handleInputChange}
                    placeholder={t('enter-name-placeholder')}
                    autoComplete="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />}
          </div>
          <div className="mb-4">
            <FormLabel readOnly={readOnly} label={t('description-header')} htmlFor="description"
                       value={formData.description || t('non-applicable')}></FormLabel>
            {readOnly ?
                <p className="text-gray-700 dark:text-gray-300">{formData.description || t('non-applicable')}</p> :
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>}
          </div>
          <div className="mb-4">
            <FormLabel readOnly={readOnly} label={t('instructions-header')} htmlFor="instructions"
                       value={formData.instructions || t('non-applicable')}></FormLabel>
            {readOnly ?
                <p className="text-gray-700 dark:text-gray-300">{formData.instructions || t('non-applicable')}</p> :
                <textarea
                    id="instructions"
                    value={formData.instructions}
                    name="instructions"
                    onChange={handleInputChange}
                    className="resize-y border rounded overflow-y-auto h-56 w-full max-h-[60vh] md:max-h-[calc(100vh-300px)] shadow appearance-none py-2 px-3 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>}
          </div>
          <div className="mb-4">
            <EditableField<string | null>
                readOnly={readOnly}
                id="model"
                label={t('model-header')}
                value={formData.model}
                defaultValue={null}
                defaultValueLabel={DEFAULT_MODEL}
                editorComponent={(props) =>
                    <ModelSelect value={formData.model}
                                 onModelSelect={props.onValueChange}
                                 models={[]} allowNone={true}
                                 allowNoneLabel="Default"/>}
                onValueChange={(value: string | null) => {
                  setFormData({...formData, model: value});
                }}
            />
          </div>
          <div className="mb-4">
            <FormLabel readOnly={readOnly} label={t('seed-header')} htmlFor={"seed"}
                       value={formData.seed || t('non-applicable')}></FormLabel>
            {readOnly ?
                <p className="text-gray-700 dark:text-gray-300">{formData.seed || t('non-applicable')}</p> :
                <input
                    type="number"
                    id="seed"
                    name="seed"
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />}
          </div>
          <EditableField<number | null>
              readOnly={readOnly}
              id="temperature"
              label={t('temperature-header')}
              value={formData.temperature}
              defaultValue={1.0}
              defaultValueLabel="1.0"
              editorComponent={TemperatureSlider}
              onValueChange={(value: number | null) => {
                setFormData({...formData, temperature: value});
              }}
          />
          <EditableField<number | null>
              readOnly={readOnly}
              id="top_p"
              label={t('top-p-header')}
              value={formData.top_p}
              defaultValue={1.0}
              defaultValueLabel="1.0"
              editorComponent={TopPSlider}
              onValueChange={(value: number | null) => {
                setFormData({...formData, top_p: value});
              }}
          />
        </form>
      </div>
  );
};

export default ChatSettingsForm;

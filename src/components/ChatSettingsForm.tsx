import React, { useState, ChangeEvent, useEffect } from 'react';
import AvatarFieldEditor, { ImageSource } from "./AvatarFieldEditor";
import 'rc-slider/assets/index.css';
import { OpenAIModel } from '../models/model';
import ModelSelect from './ModelSelect';
import { ChatService } from "../service/ChatService";
import { toast } from "react-toastify";
import TemperatureSlider from './TemperatureSlider';
import TopPSlider from './TopPSlider';
import { ChatSettings } from '../models/ChatSettings';
import { EditableField } from './EditableField';

interface ChatSettingsFormProps {
  chatSettings?: ChatSettings;
  readOnly?: boolean;
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

const ChatSettingsForm: React.FC<ChatSettingsFormProps> = ({ chatSettings, readOnly = false }) => {
  const [models, setModels] = useState<OpenAIModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChatSettings>(chatSettings || DUMMY_CHAT_SETTINGS);

  useEffect(() => {
    ChatService.getModels()
      .then(models => {
        setModels(models);
      })
      .catch(err => {
        if (err && err.message) {
          setError(err.message);
        } else {
          setError('Error fetching model list');
        }
      });
  }, []);

  useEffect(() => {
    error && toast.error(error, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }, [error]);

  useEffect(() => {
    setFormData(chatSettings || DUMMY_CHAT_SETTINGS);
  }, [chatSettings]);

  const onImageChange = (image: ImageSource) => {
    setFormData({ ...formData, icon: image });
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    if (type === 'number') {
      setFormData({ ...formData, [name]: value ? parseFloat(value) : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Providing feedback or further actions here
    toast.success('Form submitted successfully.', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto pt-3">
      <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
            Icon
          </label>
          <AvatarFieldEditor readOnly={readOnly} image={formData?.icon ? formData.icon : {data:null, type:'raster'}} onImageChange={onImageChange}/>
        </div>
        <div className="mb-4">
          <label className={`block text-gray-700 text-sm font-bold mb-2`} htmlFor="name">
            Name {readOnly ? '' : '*'}
          </label>
          {readOnly ? <p className="text-gray-700">{formData.name || "N/A"}</p> :
            <input
              type="text"
              id="name"
              name="name"
              required={!readOnly}
              onChange={handleInputChange}
              placeholder="Enter name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          {readOnly ? <p className="text-gray-700">{formData.description || "N/A"}</p> :
            <textarea
              id="description"
              name="description"
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instructions">
            Instructions
          </label>
          {readOnly ? <p className="text-gray-700">{formData.instructions || "N/A"}</p> :
            <textarea
              id="instructions"
              name="instructions"
              onChange={handleInputChange}
              className="h-56 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>}
        </div>
        <div className="mb-4">
          <EditableField<string | null>
            readOnly={readOnly}
            id="model"
            label="Model"
            defaultValue={null}
            defaultValueLabel={'gpt-4-turbo-preview'}
            editorComponent={(props) =>
              <ModelSelect value={formData.model || 'gpt-4-turbo-preview'}
                           onModelSelect={props.onValueChange}
                           models={models} allowNone={true}
                           allowNoneLabel="Default"/>}
            onValueChange={(value: string | null) => {
              setFormData({...formData, model: value});
            }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seed">
            Seed
          </label>
          {readOnly ? <p className="text-gray-700">{formData.seed || "N/A"}</p> :
            <input
              type="number"
              id="seed"
              name="seed"
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />}
        </div>
        <EditableField<number | null>
          readOnly={readOnly}
          id="temperature"
          label="Temperature"
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
          label="Top P"
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

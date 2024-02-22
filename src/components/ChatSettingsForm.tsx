import React, {useState, ChangeEvent, useEffect} from 'react';
import AvatarFieldEditor, {ImageSource} from "./AvatarFieldEditor";
import 'rc-slider/assets/index.css';
import {OpenAIModel} from '../models/model';
import ModelSelect from './ModelSelect';
import {ChatService} from "../service/ChatService";
import {toast} from "react-toastify";
import EditableField from './EditableField';
import TemperatureSlider from './TemperatureSlider'
import TopPSlider from './TopPSlider';
import { ChatSettings } from '../models/ChatSettings';

interface ChatSettingsFormProps {
  readOnly?: boolean;
}

const ChatSettingsForm: React.FC<ChatSettingsFormProps> = ({readOnly = false}) => {
  const [models, setModels] = useState<OpenAIModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChatSettings>({
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
  });

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
    toast.error(error, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }, [error])

  const onImageChange = (
    image: ImageSource,
  ) => {
    console.log('image.data = '+image.data);
    console.dir(image.data);
    setFormData({...formData, icon: image});
  }

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
    console.log(formData);

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
          <AvatarFieldEditor readOnly={readOnly} image={{data: null, type: 'raster'}} onImageChange={onImageChange}/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name *
          </label>
          {readOnly ? <p className="text-gray-700">{formData.name || "N/A"}</p> :
            <input
              type="text"
              id="name"
              name="name"
              required
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
          defaultValue={null}
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
          defaultValue={null}
          defaultValueLabel="1.0"
          editorComponent={TopPSlider}
          onValueChange={(value: number | null) => {
            setFormData({...formData, top_p: value});
          }}
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={!formData.name}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
            ${!formData.name ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSettingsForm;

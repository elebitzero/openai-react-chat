import {createContext, useContext} from 'react';
import {OpenAIModel} from "./models/model";

interface ModelsContextState {
  models: OpenAIModel[];
  setModels: (models: OpenAIModel[]) => void;
}

const ModelsContext = createContext<ModelsContextState>({
  models: [],
  setModels: () => {
  },
});

export const useModelsContext = () => useContext(ModelsContext);

export default ModelsContext;

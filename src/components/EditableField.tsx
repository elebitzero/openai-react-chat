import React, { useState, ReactElement } from 'react';

export type EditorComponentProps<T> = {
  id: string;
  onValueChange: (value: T) => void;
  value: T;
};

export type EditableFieldProps<T> = {
  id: string,
  label: string;
  defaultValue: T;
  defaultValueLabel: string;
  editorComponent: React.ComponentType<EditorComponentProps<T>>;
  onValueChange: (value: T) => void;
  readOnly?: boolean;
};

export function EditableField<T>({
                                   id,
                                   label,
                                   defaultValue,
                                   defaultValueLabel,
                                   editorComponent: EditorComponent,
                                   onValueChange,
                                   readOnly = false,
                                 }: EditableFieldProps<T>): ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<T>(defaultValue);
  const [tempValue, setTempValue] = useState<T>(defaultValue);

  const isValueSet = (): boolean => {
    return value !== null && value !== undefined;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempValue(value);
  };

  const handleTempValueChange = (newValue: T) => {
    setTempValue(newValue);
  };

  const handleReset = () => {
    setValue(defaultValue);
    onValueChange(defaultValue);
    setTempValue(defaultValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleOk = () => {
    setValue(tempValue);
    onValueChange(tempValue);
    setIsEditing(false);
  };

  function toStringRepresentation(value: T): string {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
      return String(value);
    }
    return JSON.stringify(value);
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}
      </label>
      {!isEditing ? (
        <div className="flex items-center">
          <span id={id} className="text-gray-600 text-sm mr-2">
            {isValueSet() ? toStringRepresentation(value) : defaultValueLabel + ' (default)'}
          </span>
          {!readOnly && (
            <>
              <button
                className="text-blue-500 hover:text-blue-700 text-sm mr-2"
                onClick={handleEdit}
              >
                Change
              </button>
              {isValueSet() && (
                <button
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <EditorComponent onValueChange={handleTempValueChange} value={tempValue} id={id} />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              className="text-blue-500 hover:text-blue-700 text-sm"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="text-blue-500 hover:text-blue-700 text-sm"
              onClick={handleOk}
            >
              OK
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default EditableField;

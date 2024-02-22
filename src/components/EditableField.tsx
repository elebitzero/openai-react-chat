import React, { useState, ReactElement } from 'react';

export type EditorComponentProps<T> = {
  id: string;
  onValueChange: (value: T) => void;
  value: T;
};

export type EditableFieldProps<T> = {
  id: string;
  label: string;
  value?: T | null;
  defaultValue: T;
  defaultValueLabel: string;
  editorComponent: React.ComponentType<EditorComponentProps<T>>;
  onValueChange: (value: T) => void;
  readOnly?: boolean;
};

export function EditableField<T>({
                                   id,
                                   label,
                                   value,
                                   defaultValue,
                                   defaultValueLabel,
                                   editorComponent: EditorComponent,
                                   onValueChange,
                                   readOnly = false,
                                 }: EditableFieldProps<T>): ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const effectiveValue = value !== undefined && value !== null ? value : defaultValue;
  const [tempValue, setTempValue] = useState<T>(effectiveValue);

  const isValueSet = (): boolean => {
    return value !== undefined && value !== null;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempValue(effectiveValue);
  };

  const handleTempValueChange = (newValue: T) => {
    setTempValue(newValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempValue(effectiveValue);
  };

  const handleOk = () => {
    onValueChange(tempValue);
    setIsEditing(false);
  };

  function toStringRepresentation(value: T): string {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
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
          <span className="text-gray-600 text-sm mr-2">
            {isValueSet() ? toStringRepresentation(effectiveValue) : `${defaultValueLabel} (default)`}
          </span>
          {!readOnly && (
            <button className="text-blue-500 hover:text-blue-700 text-sm" onClick={handleEdit}>
              Change
            </button>
          )}
        </div>
      ) : (
        <>
          <EditorComponent id={id} onValueChange={handleTempValueChange} value={tempValue} />
          <div className="flex justify-end space-x-2 mt-2">
            <button className="text-blue-500 hover:text-blue-700 text-sm" onClick={handleCancel}>
              Cancel
            </button>
            {!readOnly && (
              <button className="text-blue-500 hover:text-blue-700 text-sm" onClick={handleOk}>
                OK
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

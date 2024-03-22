import React from 'react';

interface FormLabelProps {
  readOnly?: boolean;
  label: string;
  htmlFor?: string;
  value?: any;
  isModalLabel?: boolean;
  isEditing?: boolean;
}

const FormLabel: React.FC<FormLabelProps> = ({readOnly, isEditing, label, htmlFor, value, isModalLabel}) => {
  const className = !isModalLabel ? "block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" : "";

  return readOnly || !isEditing ? (
      <span className={className}>{label}</span>
  ) : (
      <label className={className} htmlFor={htmlFor}>{label}</label>
  );
};

export default FormLabel;
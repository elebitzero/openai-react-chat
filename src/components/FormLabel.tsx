import React from 'react';

interface FormLabelProps {
    readOnly: boolean;
    label: string;
    htmlFor?: string;
    value?: any;
}

const FormLabel: React.FC<FormLabelProps> = ({ readOnly, label, htmlFor, value }) => {
    return readOnly || !value ? (
        <span className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{label}</span>
    ) : (
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={htmlFor}>{label}</label>
    );
};

export default FormLabel;
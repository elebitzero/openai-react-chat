// Button.tsx
import React, { FC } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean; // Added disabled option
}

const Button: FC<ButtonProps> = ({ onClick, children, variant = 'primary', className, disabled = false }) => {
  const baseStyle = "py-2 px-4 rounded font-medium cursor-pointer";
  const primaryStyle = disabled
    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300"
    : "bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-800 dark:border-gray-300";
  const secondaryStyle = disabled
    ? "bg-transparent text-gray-400 border-gray-300"
    : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700";
  const styles = `${baseStyle} ${variant === 'primary' ? primaryStyle : secondaryStyle} ${className || ''}`;

  return (
    <button onClick={!disabled ? onClick : undefined} className={styles} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;

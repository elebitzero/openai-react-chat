// Button.tsx
import React, {FC} from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'critical';
  className?: string;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({
                                   onClick,
                                   children,
                                   variant = 'primary',
                                   className,
                                   disabled = false,
                                 }) => {
  const baseStyle = "py-2 px-4 rounded font-medium cursor-pointer";
  let variantStyle = "";

  if (variant === 'primary') {
    variantStyle = disabled
        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 border-gray-300"
        : "bg-white dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-800 dark:border-gray-300";
  } else if (variant === 'secondary') {
    variantStyle = disabled
        ? "bg-transparent text-gray-400 border-gray-300"
        : "bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700";
  } else if (variant === 'critical') {
    variantStyle = disabled
        ? "bg-gray-500 text-white hover:bg-gray-700"
        : "bg-red-700 text-white hover:bg-red-500";
  }

  const styles = `${baseStyle} ${variantStyle} ${className || ''}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.stopPropagation();
      e.preventDefault();
      onClick();
    }
  };


  return (
      <button
          onClick={handleClick}
          className={styles}
          disabled={disabled}
      >
        {children}
      </button>
  );
};

export default Button;

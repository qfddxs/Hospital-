import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500 disabled:bg-sky-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-400 disabled:bg-gray-100',
    success: 'bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-500 disabled:bg-teal-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300',
    outline: 'border-2 border-sky-500 text-sky-600 hover:bg-sky-50 focus:ring-sky-500 disabled:border-sky-300 disabled:text-sky-300'
  };

  const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${disabledStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;


import React from 'react';

const ActionButton = ({
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  className = '',
  icon,
  isLoading = false,
}) => {
  const baseStyle = "relative px-6 py-3  font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ease-out flex items-center justify-center space-x-2 premium-button overflow-hidden";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-primary-500/25';
      break;
    case 'secondary':
      variantStyle = 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-500 shadow-secondary-500/25';
      break;
    case 'danger':
      variantStyle = 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-red-500/25';
      break;
  }

  const isDisabled = disabled || isLoading;
  const disabledStyle = isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105 active:scale-100';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className} group`}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon && <span className="w-5 h-5 transition-transform group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default ActionButton;
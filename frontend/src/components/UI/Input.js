import React, { forwardRef } from 'react';

const Input = forwardRef((
  {
    label,
    type = 'text',
    id,
    name,
    value,
    onChange,
    placeholder,
    error,
    helperText,
    className = '',
    inputClassName = '',
    labelClassName = '',
    required = false,
    disabled = false,
    fullWidth = true,
    startIcon,
    endIcon,
    ...props
  },
  ref
) => {
  const baseInputClasses = 'block py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200';
  const errorInputClasses = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const iconClass = `${startIcon ? 'pl-8' : ''} ${endIcon ? 'pr-8' : ''}`;
  
  return (
    <div className={`${className} ${widthClass}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm w-full">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseInputClasses} ${errorInputClasses} ${disabledClasses} ${iconClass} ${inputClassName} min-w-full`}
          {...props}
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>
      {error && helperText && (
        <p className="mt-1 text-sm text-red-600">{helperText}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
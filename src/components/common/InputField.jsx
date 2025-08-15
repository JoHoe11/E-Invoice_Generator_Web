// src/components/common/InputField.jsx
import React from 'react';

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  error = null,
}) {
  const renderInput = () => {
    const baseClasses = `w-full p-2 border rounded bg-white dark:bg-dornBox dark:text-white`;
    const borderClass = error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-dornBorder focus:outline-none focus:ring-2 focus:ring-red-800';
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className={`${baseClasses} ${borderClass}`}
          required={required}
          rows={4}
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${borderClass}`}
        required={required}
      />
    );
  };

  return (
    <div className="mb-4">
  <label className="block mb-2 text-gray-800 dark:text-white">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>

  {renderInput()}

  {error && (
    <p className="text-red-500 text-sm mt-1">
      {error}
    </p>
  )}
</div>

  );
}
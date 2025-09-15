import React from 'react'
import { AlertCircle } from 'lucide-react'

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  placeholder,
  options = [],
  className = '',
  ...props 
}) => {
  const hasError = touched && error

  const handleChange = (e) => {
    onChange(name, e.target.value)
  }

  const handleBlur = () => {
    onBlur(name)
  }

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field ${hasError ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
            {...props}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`input-field ${hasError ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
            rows={4}
            {...props}
          />
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(name, e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...props}
            />
            <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
              {label}
            </label>
          </div>
        )
      
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`input-field ${hasError ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
            {...props}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {hasError && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {hasError && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FormField

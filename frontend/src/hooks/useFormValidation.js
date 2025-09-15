import { useState } from 'react'

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName]
    if (!rules) return ''

    for (const rule of rules) {
      const error = rule(value, values)
      if (error) return error
    }
    return ''
  }

  const validateAll = () => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    
    if (touched[fieldName]) {
      const error = validate(fieldName, value)
      setErrors(prev => ({ ...prev, [fieldName]: error }))
    }
  }

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const error = validate(fieldName, values[fieldName])
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  }
}

// Common validation rules
export const validationRules = {
  required: (value) => !value ? 'This field is required' : '',
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return value && !emailRegex.test(value) ? 'Please enter a valid email address' : ''
  },
  minLength: (min) => (value) => 
    value && value.length < min ? `Must be at least ${min} characters` : '',
  maxLength: (max) => (value) => 
    value && value.length > max ? `Must be no more than ${max} characters` : '',
  number: (value) => {
    const num = Number(value)
    return value && (isNaN(num) || num <= 0) ? 'Must be a positive number' : ''
  },
  dateNotPast: (value) => {
    if (!value) return ''
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate < today ? 'Date cannot be in the past' : ''
  }
}

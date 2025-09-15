export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export const isToday = (dateString) => {
  const today = new Date()
  const date = new Date(dateString)
  return today.toDateString() === date.toDateString()
}

export const isPast = (dateString) => {
  const today = new Date()
  const date = new Date(dateString)
  return date < today
}

export const isFuture = (dateString) => {
  const today = new Date()
  const date = new Date(dateString)
  return date > today
}

export const getDaysUntil = (dateString) => {
  const today = new Date()
  const date = new Date(dateString)
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

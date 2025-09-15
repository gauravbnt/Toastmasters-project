import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      loadingMessage, 
      successMessage, 
      errorMessage = 'An error occurred',
      showSuccess = true,
      showError = true 
    } = options

    try {
      setLoading(true)
      setError(null)
      
      if (loadingMessage) {
        toast.loading(loadingMessage)
      }

      const result = await apiCall()
      
      if (successMessage && showSuccess) {
        toast.dismiss()
        toast.success(successMessage)
      }

      return result
    } catch (err) {
      const message = err.response?.data?.message || errorMessage
      setError(message)
      
      if (showError) {
        toast.dismiss()
        toast.error(message)
      }
      
      throw err
    } finally {
      setLoading(false)
      toast.dismiss()
    }
  }, [])

  return { loading, error, execute }
}

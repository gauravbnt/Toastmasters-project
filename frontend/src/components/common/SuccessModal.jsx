import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully.",
  autoCloseDelay = 3000 // Auto close after 3 seconds
}) => {
  React.useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDelay, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue
          </button>
        </div>
        
        {autoCloseDelay > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            This dialog will close automatically in {Math.ceil(autoCloseDelay / 1000)} seconds
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SuccessModal

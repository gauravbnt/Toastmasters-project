import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  const typeStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  const style = typeStyles[type]
  const IconComponent = style.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`${style.iconColor}`} size={24} />
                  <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">{message}</p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${style.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog

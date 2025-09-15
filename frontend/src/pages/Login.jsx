import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import SuccessModal from '../components/common/SuccessModal'
import ConfirmationModal from '../components/common/ConfirmationModal'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loginData, setLoginData] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmLogin = async () => {
    setShowConfirmModal(false)
    setLoading(true)
    try {
      // Use AuthContext login function which handles the entire login process
      const result = await login({ email, password })
      
      if (result.success) {
        setLoginData(result.user)
        setShowSuccessModal(true)
        
        // Navigate after modal closes or auto-closes
        setTimeout(() => {
          if (result.user.role === 'ADMIN') {
            navigate('/dashboard')
          } else {
            navigate('/member-dashboard')
          }
        }, 3500) // Slightly longer than modal auto-close
      } else {
        toast.error(result.message || 'Login failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Your password"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmLogin}
        title="Confirm Login"
        message="Are you sure you want to log in to the Toastmasters application?"
        confirmText="Yes, Log In"
        cancelText="Cancel"
        type="info"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Login Successful!"
        message={`Welcome back, ${loginData?.name || loginData?.email}! You are logged in as ${loginData?.role === 'ADMIN' ? 'Administrator' : 'Member'}.`}
        autoCloseDelay={3000}
      />
    </div>
  )
}

export default Login

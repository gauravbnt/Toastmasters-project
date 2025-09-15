import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('tm_token')
    const userData = localStorage.getItem('tm_user')
    
    if (token && userData && userData !== 'undefined' && userData !== 'null') {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('tm_token')
        localStorage.removeItem('tm_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      // The response structure is: {message, role, memberId, token?}
      // Create user object from response
      const userData = {
        email: credentials.email,
        role: response.role,
        memberId: response.memberId,
        name: response.name || credentials.email
      }
      
      // Store token if it exists in response
      if (response.token) {
        localStorage.setItem('tm_token', response.token)
      }
      
      localStorage.setItem('tm_user', JSON.stringify(userData))
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('tm_token')
    localStorage.removeItem('tm_user')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

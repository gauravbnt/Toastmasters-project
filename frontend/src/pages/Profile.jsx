import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit, Save, X, Mail, Phone, Calendar, MapPin, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { memberService } from '../services/memberService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { showSuccess, showError } from '../utils/alerts'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth() || {}
  const memberId = user?.memberId

  const [memberData, setMemberData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    joinDate: '',
    isActive: true
  })

  useEffect(() => {
    if (memberId) {
      fetchMemberData()
    }
  }, [memberId])

  const fetchMemberData = async () => {
    setIsLoading(true)
    try {
      const response = await memberService.getMemberById(memberId)
      setMemberData(response)
      setFormData({
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        address: response.address || '',
        occupation: response.occupation || '',
        joinDate: response.joinDate || '',
        isActive: response.isActive !== false
      })
    } catch (error) {
      console.error('Error fetching member data:', error)
      setError('Failed to load profile data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    if (!memberId) {
      showError('Error', 'Member ID not found')
      return
    }

    setIsSaving(true)
    try {
      const updatedData = {
        ...formData,
        memberId: parseInt(memberId)
      }
      
      await memberService.updateMember(memberId, updatedData)
      setMemberData(updatedData)
      setIsEditing(false)
      await showSuccess('Success', 'Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      showError('Error', 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (memberData) {
      setFormData({
        name: memberData.name || '',
        email: memberData.email || '',
        phone: memberData.phone || '',
        address: memberData.address || '',
        occupation: memberData.occupation || '',
        joinDate: memberData.joinDate || '',
        isActive: memberData.isActive !== false
      })
    }
    setIsEditing(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information</p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-white text-white placeholder-gray-200 focus:outline-none focus:border-white"
                      placeholder="Your name"
                    />
                  ) : (
                    memberData?.name || 'Not available'
                  )}
                </h2>
                <p className="text-indigo-100">Member ID: {memberId}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your.email@example.com"
                  />
                ) : (
                  <p className="text-gray-900">{memberData?.email || 'Not available'}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900">{memberData?.phone || 'Not available'}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your address"
                  />
                ) : (
                  <p className="text-gray-900">{memberData?.address || 'Not available'}</p>
                )}
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  Occupation
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your occupation"
                  />
                ) : (
                  <p className="text-gray-900">{memberData?.occupation || 'Not available'}</p>
                )}
              </div>

              {/* Join Date */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Join Date
                </label>
                <p className="text-gray-900">{formatDate(memberData?.joinDate)}</p>
              </div>

              {/* Active Status */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Status
                </label>
                {isEditing ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active member</span>
                  </label>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    memberData?.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {memberData?.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit, Save, X, Mail, Phone, Calendar, MapPin, Briefcase, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { memberService } from '../services/memberService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { showSuccess, showError } from '../utils/alerts'
import toast from 'react-hot-toast'

const MemberProfile = () => {
  const { user } = useAuth() || {}
  const memberId = user?.memberId

  const [memberData, setMemberData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    dateOfBirth: '',
    email: '',
    address: '',
    contact: '',
    doj: '',
    gender: '',
    password: '',
    mentorId: '',
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
        memberId: response.memberId || '',
        name: response.name || '',
        dateOfBirth: response.dateOfBirth || '',
        email: response.email || '',
        address: response.address || '',
        contact: response.contact || '',
        doj: response.doj || '',
        gender: response.gender || '',
        password: '', // Don't populate password for security
        mentorId: response.mentorId || '',
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

    // Validate password if provided
    if (formData.password && formData.password.length < 6) {
      showError('Error', 'Password must be at least 6 characters long')
      return
    }

    setIsSaving(true)
    try {
      // Prepare member data
      const memberData = {
        ...formData,
        memberId: parseInt(memberId)
      }
      
      // Remove password from API call if it's empty (to keep existing password)
      if (!formData.password || formData.password.trim() === '') {
        delete memberData.password;
      }
      
      // Update member data
      await memberService.updateMember(memberId, memberData)
      
      // Update local state (don't store password in state)
      const { password, ...updatedData } = memberData;
      setMemberData(updatedData)
      setIsEditing(false)
      
      toast.success('Profile updated successfully')
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
        memberId: memberData.memberId || '',
        name: memberData.name || '',
        dateOfBirth: memberData.dateOfBirth || '',
        email: memberData.email || '',
        address: memberData.address || '',
        contact: memberData.contact || '',
        doj: memberData.doj || '',
        gender: memberData.gender || '',
        password: '', // Don't populate password for security
        mentorId: memberData.mentorId || '',
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD for input fields
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
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </>
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

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter contact number"
                  />
                ) : (
                  <p className="text-gray-900">{memberData?.contact || 'Not available'}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formatDateForInput(formData.dateOfBirth)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(memberData?.dateOfBirth)}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{memberData?.gender || 'Not available'}</p>
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

              {/* Mentor ID */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  Mentor ID
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="mentorId"
                    value={formData.mentorId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter mentor ID"
                  />
                ) : (
                  <p className="text-gray-900">{memberData?.mentorId || 'Not assigned'}</p>
                )}
              </div>

              {/* Password Field (only shown in edit mode) */}
              {isEditing && (
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Lock className="w-4 h-4 mr-2 text-gray-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter new password (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Leave empty to keep current password</p>
                </div>
              )}

              {/* Date of Joining */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Date of Joining
                </label>
                <p className="text-gray-900">{formatDate(memberData?.doj)}</p>
              </div>

              {/* Status (Read-only) */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  memberData?.isActive !== false 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {memberData?.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

export default MemberProfile

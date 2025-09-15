import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Save, X, Calendar, User, ChevronUp, ChevronDown } from 'lucide-react'
import { rolePreferenceService } from '../services/rolePreferenceService'
import { roleService } from '../services/roleService'
import { meetingService } from '../services/meetingService'
import LoadingSpinner from './common/LoadingSpinner'
import toast from 'react-hot-toast'

const RolePreferences = ({ memberId, meetingId, onClose }) => {
  const [roles, setRoles] = useState([])
  const [meeting, setMeeting] = useState(null)
  const [preferences, setPreferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [memberId, meetingId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rolesData, meetingData, preferencesData] = await Promise.all([
        roleService.getAllRoles(),
        meetingService.getMeetingById(meetingId),
        rolePreferenceService.getRolePreferences(memberId, meetingId).catch(() => [])
      ])
      
      setRoles(rolesData || [])
      setMeeting(meetingData)
      // Extract roleIds from the new RolePreferenceResponseDTO structure
      const roleIds = Array.isArray(preferencesData) 
        ? preferencesData.map(pref => pref.roleId).filter(Boolean) 
        : []
      setPreferences(roleIds)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load role preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = (roleId) => {
    setPreferences(prev => {
      const newPrefs = [...prev]
      const index = newPrefs.indexOf(roleId)
      
      if (index > -1) {
        // Remove role
        newPrefs.splice(index, 1)
      } else {
        // Add role (max 3 preferences)
        if (newPrefs.length < 3) {
          newPrefs.push(roleId)
        } else {
          toast.error('You can select maximum 3 role preferences')
          return prev
        }
      }
      
      return newPrefs
    })
  }

  const movePreference = (roleId, direction) => {
    setPreferences(prev => {
      const newPrefs = [...prev]
      const index = newPrefs.indexOf(roleId)
      
      if (index === -1) return prev
      
      if (direction === 'up' && index > 0) {
        [newPrefs[index], newPrefs[index - 1]] = [newPrefs[index - 1], newPrefs[index]]
      } else if (direction === 'down' && index < newPrefs.length - 1) {
        [newPrefs[index], newPrefs[index + 1]] = [newPrefs[index + 1], newPrefs[index]]
      }
      
      return newPrefs
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Transform preferences array to match RolePreferenceRequestDTO structure
      const preferenceRequests = preferences.map((roleId, index) => ({
        memberId,
        meetingId,
        roleId,
        prefOrder: index + 1
      }))
      
      await rolePreferenceService.setRolePreferences(preferenceRequests)
      toast.success('Role preferences saved successfully')
      onClose?.(true)
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save role preferences')
    } finally {
      setSaving(false)
    }
  }

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.roleId === roleId)
    return role ? role.roleName : roleId
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Role Preferences</h2>
              {meeting && (
                <p className="text-indigo-100 mt-1">
                  {meeting.title} - {formatDate(meeting.date)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-indigo-200 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Star className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">How to set preferences</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select up to 3 roles you'd prefer to take in this meeting</li>
                  <li>• Use the arrows to reorder your preferences (1st choice, 2nd choice, 3rd choice)</li>
                  <li>• Your preferences help with automatic role assignment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Preferences */}
          {preferences.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Your Preferences (in order)</h3>
              <div className="space-y-2">
                {preferences.map((roleId, index) => (
                  <div key={roleId} className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{getRoleName(roleId)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => movePreference(roleId, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => movePreference(roleId, 'down')}
                        disabled={index === preferences.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRoleToggle(roleId)}
                        className="p-1 text-red-400 hover:text-red-600 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Roles */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Available Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((role) => {
                const isSelected = preferences.includes(role.roleId)
                return (
                  <button
                    key={role.roleId}
                    onClick={() => handleRoleToggle(role.roleId)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{role.roleName}</h4>
                        {role.description && (
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                          {preferences.indexOf(role.roleId) + 1}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default RolePreferences

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { roleAssignmentService } from '../services/roleAssignmentService'
import { rolePreferenceService } from '../services/rolePreferenceService'
import { memberRoleService } from '../services/memberRoleService'
import { roleService } from '../services/roleService'
import LoadingSpinner from './common/LoadingSpinner'
import toast from 'react-hot-toast'

const RoleAssignmentModal = ({ isOpen, onClose, meetingId, member, onAssignmentComplete }) => {
  const [availableRoles, setAvailableRoles] = useState([])
  const [preferredRoles, setPreferredRoles] = useState([])
  const [pastRoles, setPastRoles] = useState([])
  const [selectedRoles, setSelectedRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (isOpen && meetingId && member) {
      fetchRoleData()
    }
  }, [isOpen, meetingId, member])

  const fetchRoleData = async () => {
    try {
      setLoading(true)
      
      // Fetch available roles for the meeting
      const [availableRolesRes, preferredRolesRes, pastRolesRes] = await Promise.allSettled([
        roleAssignmentService.getAvailableRolesWithCounts(meetingId),
        rolePreferenceService.getRolePreferences(member.memberId, meetingId),
        memberRoleService.getMemberRoleHistory(member.memberId)
      ])

      if (availableRolesRes.status === 'fulfilled') {
        setAvailableRoles(availableRolesRes.value || [])
      } else {
        console.error('Failed to fetch available roles:', availableRolesRes.reason)
      }

      if (preferredRolesRes.status === 'fulfilled') {
        setPreferredRoles(preferredRolesRes.value || [])
      } else {
        console.error('Failed to fetch preferred roles:', preferredRolesRes.reason)
      }

      if (pastRolesRes.status === 'fulfilled') {
        setPastRoles(pastRolesRes.value || [])
      } else {
        console.error('Failed to fetch past roles:', pastRolesRes.reason)
      }
    } catch (error) {
      console.error('Error fetching role data:', error)
      toast.error('Failed to load role data')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => {
      const isSelected = prev.some(r => r.roleId === role.roleId)
      
      if (isSelected) {
        return prev.filter(r => r.roleId !== role.roleId)
      } else {
        // Check if role is still available
        const availableRole = availableRoles.find(ar => ar.roleId === role.roleId)
        if (availableRole && availableRole.remainingCount > 0) {
          return [...prev, role]
        } else {
          toast.error(`Role ${role.roleName} is no longer available`)
          return prev
        }
      }
    })
  }

  const handleAssignRoles = async () => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role')
      return
    }

    try {
      setAssigning(true)
      const roleIds = selectedRoles.map(role => role.roleId)
      
      await roleAssignmentService.assignRoles(meetingId, member.memberId, roleIds)
      
      toast.success(`Roles assigned to ${member.name} successfully`)
      
      // Call the callback to refresh parent component
      if (onAssignmentComplete) {
        onAssignmentComplete()
      }
      
      onClose()
    } catch (error) {
      console.error('Error assigning roles:', error)
      toast.error('Failed to assign roles')
    } finally {
      setAssigning(false)
    }
  }

  const getRoleAvailabilityStatus = (role) => {
    const availableRole = availableRoles.find(ar => ar.roleId === role.roleId)
    if (!availableRole) return { available: false, remaining: 0 }
    return { available: availableRole.remainingCount > 0, remaining: availableRole.remainingCount }
  }

  const isRolePreferred = (role) => {
    return preferredRoles.some(pr => pr.roleId === role.roleId)
  }

  const getPastRoleCount = (role) => {
    return pastRoles.filter(pr => pr.roleId === role.roleId).length
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Assign Roles</h2>
                <p className="text-sm text-gray-600">
                  {member.name} - {member.email}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preferred Roles Section */}
                {preferredRoles.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Star className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="text-lg font-medium text-green-800">Preferred Roles</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferredRoles.map((role) => (
                        <span
                          key={role.roleId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {role.roleName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Roles Section */}
                {pastRoles.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium text-blue-800">Past Roles Experience</h3>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(
                        pastRoles.reduce((acc, role) => {
                          acc[role.roleName] = (acc[role.roleName] || 0) + 1
                          return acc
                        }, {})
                      ).map(([roleName, count]) => (
                        <div key={roleName} className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">{roleName}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {count} time{count > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Roles Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Roles</h3>
                  {availableRoles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No roles available for this meeting
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableRoles.map((role) => {
                        const status = getRoleAvailabilityStatus(role)
                        const isSelected = selectedRoles.some(r => r.roleId === role.roleId)
                        const preferred = isRolePreferred(role)
                        const pastCount = getPastRoleCount(role)

                        return (
                          <div
                            key={role.roleId}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : status.available
                                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                : 'border-gray-200 bg-gray-100 opacity-50'
                            }`}
                            onClick={() => status.available && handleRoleToggle(role)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{role.roleName}</h4>
                                  {preferred && (
                                    <Star className="h-4 w-4 text-yellow-500" title="Preferred role" />
                                  )}
                                  {pastCount > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {pastCount}x
                                    </span>
                                  )}
                                </div>
                                {role.roleDescription && (
                                  <p className="text-sm text-gray-600 mt-1">{role.roleDescription}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {isSelected ? (
                                  <CheckCircle className="h-5 w-5 text-blue-500" />
                                ) : status.available ? (
                                  <div className="text-right">
                                    <span className="text-xs text-gray-500">
                                      {status.remaining} left
                                    </span>
                                  </div>
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Roles Summary */}
                {selectedRoles.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-800 mb-3">Selected Roles ({selectedRoles.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map((role) => (
                        <span
                          key={role.roleId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {role.roleName}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRoleToggle(role)
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignRoles}
              disabled={assigning || selectedRoles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? 'Assigning...' : `Assign ${selectedRoles.length} Role${selectedRoles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RoleAssignmentModal

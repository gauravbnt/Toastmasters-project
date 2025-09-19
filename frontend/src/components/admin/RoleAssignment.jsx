import React, { useState, useEffect } from 'react'
import { memberRoleAssignService } from '../../services/memberRoleAssignService'
import { memberService } from '../../services/memberService'
import { memberAvailabilityService } from '../../services/memberAvailabilityService'
import { rolePreferenceService } from '../../services/rolePreferenceService'
import { toast } from 'react-hot-toast'

const RoleAssignment = () => {
  const [members, setMembers] = useState([])
  const [meetings, setMeetings] = useState([])
  const [roles, setRoles] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState('')
  const [assignments, setAssignments] = useState([])
  const [availableMembers, setAvailableMembers] = useState([])
  const [memberPreferences, setMemberPreferences] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Fetch all required data
      const [membersData, meetingsData, rolesData] = await Promise.all([
        memberService.getAllMembers(),
        memberRoleAssignService.getAllMeetings(),
        memberRoleAssignService.getAllRoles()
      ])

      setMembers(membersData)
      setMeetings(meetingsData)
      setRoles(rolesData)

      // Auto-select the first meeting if available
      if (meetingsData.length > 0) {
        setSelectedMeeting(meetingsData[0].id)
      }
    } catch (error) {
      toast.error('Failed to load initial data')
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedMeeting) {
      fetchMeetingData()
    }
  }, [selectedMeeting])

  const fetchMeetingData = async () => {
    setLoading(true)
    try {
      // Fetch assignments, available members, and role preferences in parallel
      const [assignmentsData, memberStatuses, preferencesData] = await Promise.all([
        memberRoleAssignService.getAssignmentsByMeeting(selectedMeeting),
        memberAvailabilityService.getMemberStatuses(selectedMeeting),
        rolePreferenceService.getMeetingRolePreferences(selectedMeeting)
      ])

      setAssignments(assignmentsData)
      
      // Set available members (only those with AVAILABLE status)
      setAvailableMembers(memberStatuses.AVAILABLE || [])
      
      // Process role preferences into a member_id -> preferences map
      const preferencesMap = {}
      if (Array.isArray(preferencesData)) {
        preferencesData.forEach(pref => {
          if (!preferencesMap[pref.memberId]) {
            preferencesMap[pref.memberId] = []
          }
          preferencesMap[pref.memberId].push(pref)
        })
      }
      setMemberPreferences(preferencesMap)
      
    } catch (error) {
      console.error('Error fetching meeting data:', error)
      setAssignments([])
      setAvailableMembers([])
      setMemberPreferences({})
    } finally {
      setLoading(false)
    }
  }

  const handleRoleAssignment = (memberId, roleId) => {
    setAssignments(prev => {
      const existingIndex = prev.findIndex(assignment => 
        assignment.memberId === memberId && assignment.meetingId === selectedMeeting
      )

      if (existingIndex >= 0) {
        // Update existing assignment
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          roleId: roleId || null
        }
        return updated.filter(assignment => assignment.roleId) // Remove if roleId is null
      } else if (roleId) {
        // Add new assignment
        return [...prev, {
          memberId,
          roleId,
          meetingId: selectedMeeting
        }]
      }
      return prev
    })
  }

  // Get available roles for assignment (excluding already assigned roles)
  const getAvailableRoles = () => {
    const assignedRoleIds = assignments.map(a => a.roleId)
    return roles.filter(role => !assignedRoleIds.includes(role.id))
  }

  const getMemberRolePreference = (memberId) => {
    const preferences = memberPreferences[memberId]
    if (preferences && preferences.length > 0) {
      // Return the first (highest priority) preference
      return preferences[0].roleId
    }
    return null
  }

  const getAssignedRole = (memberId) => {
    const assignment = assignments.find(a => 
      a.memberId === memberId && a.meetingId === selectedMeeting
    )
    return assignment ? assignment.roleId : null
  }

  const saveAssignments = async () => {
    setSaving(true)
    try {
      // Format assignments for the backend
      const assignmentData = assignments.map(assignment => ({
        memberId: assignment.memberId,
        roleId: assignment.roleId,
        meetingId: assignment.meetingId
      }))

      await memberRoleAssignService.assignRoles(assignmentData)
      toast.success('Role assignments saved successfully!')
      
      // Refresh assignments
      await fetchMeetingData()
    } catch (error) {
      toast.error('Failed to save role assignments')
      console.error('Error saving assignments:', error)
    } finally {
      setSaving(false)
    }
  }

  const getMemberName = (member) => {
    return member.name || member.email || `Member ${member.id}`
  }

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    return role ? role.name : 'Unknown Role'
  }

  const getMeetingDate = (meeting) => {
    return meeting.date ? new Date(meeting.date).toLocaleDateString() : 'No Date'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Role Assignment</h2>
        <button
          onClick={saveAssignments}
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Assignments'}
        </button>
      </div>

      {/* Meeting Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Meeting
        </label>
        <select
          value={selectedMeeting}
          onChange={(e) => setSelectedMeeting(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {meetings.map(meeting => (
            <option key={meeting.id} value={meeting.id}>
              {getMeetingDate(meeting)} - {meeting.meetingTheme || 'No Theme'}
            </option>
          ))}
        </select>
      </div>

      {/* Role Assignment Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Assign Roles for {selectedMeeting ? getMeetingDate(meetings.find(m => m.id === selectedMeeting)) : ''}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Assign roles to members based on their preferences
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferred Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableMembers.map(member => {
                const preferredRole = getMemberRolePreference(member.memberId)
                const assignedRoleId = getAssignedRole(member.memberId)
                const availableRoles = getAvailableRoles()
                
                return (
                  <tr key={member.memberId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {preferredRole ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getRoleName(preferredRole)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No preference</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={assignedRoleId || ''}
                        onChange={(e) => handleRoleAssignment(member.memberId, e.target.value ? parseInt(e.target.value) : null)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={assignedRoleId} // Disable if already assigned
                      >
                        <option value="">Select Role</option>
                        {availableRoles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedRoleId && (
                        <button
                          onClick={() => handleRoleAssignment(member.memberId, null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {availableMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No members have marked availability for this meeting</p>
          </div>
        )}
      </div>

      {/* Assignment Summary */}
      {assignments.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Assignment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map(assignment => {
              const member = availableMembers.find(m => m.memberId === assignment.memberId)
              const role = roles.find(r => r.id === assignment.roleId)
              
              return (
                <div key={`${assignment.memberId}-${assignment.roleId}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-medium">
                        {member ? member.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member ? member.name : 'Unknown Member'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {role ? role.name : 'Unknown Role'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleAssignment

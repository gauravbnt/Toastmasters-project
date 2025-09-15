import api from './api'

export const roleAssignmentService = {
  // Assign roles to a member for a specific meeting
  assignRoles: async (meetingId, memberId, roleIds) => {
    const response = await api.post(`/member-roles/assign`, {
      meetingId,
      memberId,
      roleIds
    })
    return response.data
  },

  // Get all role assignments for a meeting
  getMeetingRoleAssignments: async (meetingId) => {
    const response = await api.get(`/member-roles/meeting/${meetingId}/assignments`)
    return response.data
  },

  // Remove a role assignment
  removeRoleAssignment: async (assignmentId) => {
    const response = await api.delete(`/member-roles/assignment/${assignmentId}`)
    return response.data
  },

  // Get available roles for a meeting (with remaining counts)
  getAvailableRolesWithCounts: async (meetingId) => {
    const response = await api.get(`/roles/meeting/${meetingId}/available-with-counts`)
    return response.data
  },

  // Get member's role preferences for a meeting
  getMemberRolePreferences: async (memberId, meetingId) => {
    const response = await api.get(`/role-preferences/member/${memberId}/meeting/${meetingId}`)
    return response.data
  },

  // Get member's past role assignments
  getMemberPastRoles: async (memberId) => {
    const response = await api.get(`/member-roles/member/${memberId}/past-assignments`)
    return response.data
  },

  // Get meeting roles configuration
  getMeetingRoles: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}/roles`)
    return response.data
  }
}

export default roleAssignmentService

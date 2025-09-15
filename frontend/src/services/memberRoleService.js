import api from './api'

export const memberRoleService = {
  // Get role assignments for a specific member
  getMemberRoleHistory: async (memberId) => {
    const response = await api.get(`/member-roles/member/${memberId}`)
    return response.data
  },

  // Get role assignments for a specific meeting
  getRoleAssignmentsByMeeting: async (meetingId) => {
    const response = await api.get(`/member-roles/meeting/${meetingId}`)
    return response.data
  },

  // Get member's upcoming role assignments
  getMemberUpcomingRoles: async (memberId) => {
    try {
      const response = await api.get(`/member-roles/member/${memberId}/upcoming`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`No upcoming roles found for member ${memberId}`)
        return [] // Return empty array for 404
      }
      throw error // Re-throw other errors
    }
  },

  // Get member's role statistics
  getMemberRoleStats: async (memberId) => {
    try {
      const response = await api.get(`/member-roles/member/${memberId}/stats`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`No role statistics found for member ${memberId}`)
        return null // Return null for 404
      }
      throw error // Re-throw other errors
    }
  },
}

export default memberRoleService

import api from './api'

export const rolePreferenceService = {
  // Get role preferences for a member and meeting
  getRolePreferences: async (memberId, meetingId) => {
    const response = await api.get(`/role-preferences/member/${memberId}/meeting/${meetingId}`)
    return response.data
  },

  // Set role preferences for a member and meeting - sends array of RolePreferenceRequestDTO
  setRolePreferences: async (preferences) => {
    // Transform the preferences array to match RolePreferenceRequestDTO structure
    const requestDTO = preferences.map((pref, index) => ({
      memberId: pref.memberId,
      meetingId: pref.meetingId,
      roleId: pref.roleId,
      prefOrder: index + 1 // 1-based ordering as per backend expectation
    }))
    
    const response = await api.post('/role-preferences/add', requestDTO)
    return response.data
  },

  // Get all role preferences for a meeting (admin view)
  getMeetingRolePreferences: async (meetingId) => {
    const response = await api.get(`/role-preferences/meeting/${meetingId}`)
    return response.data
  },

  // Get available roles for a meeting
  getAvailableRolesForMeeting: async (meetingId) => {
    const response = await api.get(`/role-preferences/meeting/${meetingId}/available-roles`)
    return response.data
  },

  // Helper method to create role preference request object
  createPreferenceRequest: (memberId, meetingId, roleId, prefOrder) => {
    return {
      memberId,
      meetingId,
      roleId,
      prefOrder
    }
  }
}

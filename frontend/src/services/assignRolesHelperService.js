import api from './api'

export const assignRolesHelperService = {
  // Get all required data for role assignment in a single call
  getAssignRolesData: async (meetingId) => {
    try {
      console.log(`Fetching role assignment data for meeting ${meetingId}...`)
      const response = await api.get(`/assign/get/${meetingId}`)
      console.log('Role assignment data response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching role assignment data:', error)
      return []
    }
  }
}

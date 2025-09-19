import api from './api'

export const memberRoleAssignService = {
  // Get role assignments for a specific meeting
  getAssignmentsByMeeting: async (meetingId) => {
    try {
      // Validate meeting ID
      if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
        console.warn('Invalid meeting ID provided:', meetingId)
        return []
      }
      
      console.log(`Fetching role assignments for meeting ${meetingId}...`)
      const response = await api.get(`/role-assign/meeting/${meetingId}`)
      console.log('Role assignments response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching role assignments:', error)
      return []
    }
  },

  // Get role assignments for a specific member
  getAssignmentsByMember: async (memberId) => {
    try {
      console.log(`Fetching role assignments for member ${memberId}...`)
      const response = await api.get(`/role-assign/member/${memberId}`)
      console.log('Member role assignments response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching member role assignments:', error)
      return []
    }
  },

  // Assign roles to a member for a meeting
  assignRoles: async (assignmentData) => {
    try {
      console.log('Assigning roles:', assignmentData)
      const response = await api.post('/role-assign/assign', assignmentData)
      console.log('Role assignment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error assigning roles:', error)
      throw error
    }
  },

  // Update a role assignment
  updateAssignment: async (assignmentId, assignmentData) => {
    try {
      console.log(`Updating assignment ${assignmentId}:`, assignmentData)
      const response = await api.put(`/member-role-assign/${assignmentId}`, assignmentData)
      console.log('Assignment update response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating assignment:', error)
      throw error
    }
  },

  // Delete a role assignment
  deleteAssignment: async (assignmentId) => {
    try {
      console.log(`Deleting assignment ${assignmentId}`)
      const response = await api.delete(`/member-role-assign/${assignmentId}`)
      console.log('Assignment deletion response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error deleting assignment:', error)
      throw error
    }
  },

  // Get all role assignments
  getAllAssignments: async () => {
    try {
      console.log('Fetching all role assignments...')
      const response = await api.get('/member-role-assign/all')
      console.log('All assignments response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching all assignments:', error)
      return []
    }
  },

  // Get all meetings for role assignment
  getAllMeetings: async () => {
    try {
      console.log('Fetching all meetings for role assignment...')
      const response = await api.get('/meetings/all')
      console.log('Meetings response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching meetings:', error)
      return []
    }
  },

  // Get all roles for role assignment
  getAllRoles: async () => {
    try {
      console.log('Fetching all roles for role assignment...')
      const response = await api.get('/roles/all')
      console.log('Roles response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching roles:', error)
      return []
    }
  }
}

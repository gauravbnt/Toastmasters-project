import api from './api'
import { toast } from 'react-hot-toast'

export const memberService = {
  // Get all members
  getAllMembers: async () => {
    try {
      console.log('Fetching all members...')
      const response = await api.get('/members/all')
      console.log('Members response:', response.data)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching members:', error)
      return []
    }
  },

  // Get member by ID
  getMemberById: async (id) => {
    const response = await api.get(`/members/${id}`)
    return response.data
  },

  // Add new member
  addMember: async (memberData) => {
    const response = await api.post('/members/add', memberData)
    console.log("Generated Member ID:", response.data.memberId)

    return response.data
  },

  // Update member
  updateMember: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData)
    return response.data
  },

  // Delete member
  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`)
    return response.data
  },

  // Get active members using client-side filtering
  getActiveMembers: async () => {
    try {
      console.log('Fetching active members...');
      // Get all members and filter for active ones
      const allMembers = await memberService.getAllMembers();
      const activeMembers = allMembers.filter(member => member.isActive === true);
      console.log(`Found ${activeMembers.length} active members out of ${allMembers.length} total members`);
      return activeMembers;
    } catch (error) {
      console.error('Error fetching active members:', error);
      toast.error('Failed to load active members');
      return [];
    }
  },

  // Change member password
  changePassword: async (memberId, passwordData) => {
    try {
      const response = await api.put(`/members/${memberId}/password`, passwordData)
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}

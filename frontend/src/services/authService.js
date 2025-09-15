import api from './api'
import { memberService } from './memberService'
import { showSuccess, showError, showLoading, closeLoading } from '../utils/alerts'

export const authService = {
  login: async ({ email, password }) => {
    showLoading('Signing in...')
    try {
      console.log('Attempting login with:', { email })
      const res = await api.post('/api/auth/login', { email, password })
      console.log('Login response:', res.data)
      closeLoading()
      
      // If memberId is missing and user is a MEMBER, try to find it
      if (!res.data.memberId && res.data.role === 'MEMBER') {
        console.warn('Member ID missing in login response, attempting to find by email...')
        try {
          // Try to get member by email using the members list
          try {
            const members = await memberService.getAllMembers();
            const member = members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
            if (member?.id) {
              res.data.memberId = member.id;
              console.log('Found member in members list:', res.data.memberId);
              return res.data;
            }
          } catch (error) {
            console.error('Error fetching members:', error);
          }
          
          // Fallback: Get all members and filter
          const members = await memberService.getAllMembers()
          console.log('Fetched members:', members)
          
          // Find member by email (case insensitive)
          const member = members.find(m => 
            m.email && m.email.toLowerCase() === email.toLowerCase()
          )
          
          if (member) {
            console.log('Found matching member in full list:', member)
            res.data.memberId = member.id || member.memberId || member.userId
            console.log('Using memberId from full list:', res.data.memberId)
          } else {
            console.warn(`No member found with email: ${email}`)
            // If no member found, create a new one if needed
            try {
              const newMember = await memberService.addMember({ email })
              if (newMember?.id) {
                res.data.memberId = newMember.id
                console.log('Created new member with ID:', res.data.memberId)
              }
            } catch (createError) {
              console.error('Failed to create new member:', createError)
            }
          }
        } catch (memberError) {
          console.error('Error handling member data:', memberError)
          // Don't fail login, just log the error
        }
      }
      
      await showSuccess('Success', 'Login successful')
      return res.data
    } catch (error) {
      closeLoading()
      console.error('Login error:', error)
      let errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      showError('Login Failed', errorMessage)
      throw error
    }
  },
}

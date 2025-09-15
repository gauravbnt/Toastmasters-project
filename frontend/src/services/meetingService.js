import api from './api'

export const meetingService = {
  // Get all meetings
  getAllMeetings: async () => {
    const response = await api.get('/meetings/getall')
    return response.data
  },

  // Get meeting by ID
  getMeetingById: async (id) => {
    // Ensure ID is a number
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid meeting ID');
    }
    console.log(`Fetching meeting with ID: ${numericId}`);
    const response = await api.get(`/meetings/${numericId}`);
    console.log('Meeting API response:', JSON.stringify(response.data, null, 2));
    return response.data;
  },

  // Create new meeting
  createMeeting: async (meetingData) => {
    try {
      // Ensure meetingType is a valid enum value
      const validMeetingTypes = ['REGULAR', 'CONTEST', 'SPECIAL'];
      const meetingType = meetingData.meetingType?.toUpperCase();
      
      if (!validMeetingTypes.includes(meetingType)) {
        throw new Error(`Invalid meeting type: ${meetingType}. Must be one of: ${validMeetingTypes.join(', ')}`);}
      
      // Format roles to match backend's expected format
      const roles = (meetingData.roles || []).map(role => ({
        roleId: String(role.roleId), // Keep roleId as string to match database
        count: Number(role.count) || 1
      }));
      
      // Create a clean payload with only the expected fields
      const payload = {
        meetingTheme: String(meetingData.meetingTheme || '').trim(),
        meetingType: meetingType,
        date: String(meetingData.date || ''),
        startTime: String(meetingData.startTime || ''),
        endTime: String(meetingData.endTime || ''),
        location: String(meetingData.location || '').trim(),
        roles: roles,
        unavailableMembersCount: Number(meetingData.unavailableMembersCount) || 0
      };
      
      console.log('Sending meeting creation request with payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post('/meetings/add', payload);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Ensure the response includes the meeting ID
      const result = {
        ...response.data,
        meetingId: response.data.meetingId || response.data.id
      };
      
      if (!result.meetingId) {
        console.warn('Meeting created but no meetingId in response:', response.data);
      }
      
      console.log('Meeting created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating meeting:', error);
      if (error.response) {
        console.error('Complete error response:', JSON.stringify(error.response, null, 2));
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Extract error message from response if available
        let errorMessage = 'Failed to create meeting';
        if (error.response.data) {
          // Try to get validation errors if they exist
          if (error.response.data.errors) {
            errorMessage = Object.entries(error.response.data.errors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        throw error;
      }
    }
  },

  // Update meeting
  updateMeeting: async (id, meetingData) => {
    try {
      // Ensure ID is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid meeting ID');
      }
      
      // Ensure meetingType is a valid enum value
      const validMeetingTypes = ['REGULAR', 'CONTEST', 'SPECIAL'];
      const meetingType = meetingData.meetingType?.toUpperCase();
      
      if (!validMeetingTypes.includes(meetingType)) {
        throw new Error(`Invalid meeting type: ${meetingType}. Must be one of: ${validMeetingTypes.join(', ')}`);
      }
      
      // Format roles to match backend's expected format
      const roles = (meetingData.roles || []).map(role => ({
        roleId: String(role.roleId), // Keep roleId as string to match database
        count: Number(role.count) || 1
      }));
      
      // Create a clean payload with only the expected fields
      const payload = {
        meetingTheme: String(meetingData.meetingTheme || '').trim(),
        meetingType: meetingType,
        date: String(meetingData.date || ''),
        startTime: String(meetingData.startTime || ''),
        endTime: String(meetingData.endTime || ''),
        location: String(meetingData.location || '').trim(),
        roles: roles,
        unavailableMembersCount: Number(meetingData.unavailableMembersCount) || 0
      };
      
      // Validate required fields
      if (!payload.meetingTheme) {
        throw new Error('Meeting theme is required');
      }
      if (!payload.date) {
        throw new Error('Date is required');
      }
      if (!payload.startTime || !payload.endTime) {
        throw new Error('Start time and end time are required');
      }
      
      console.log(`Updating meeting ${numericId} with payload:`, JSON.stringify(payload, null, 2));
      console.log('Individual roles being sent:', roles);
      
      // Log the full request details
      console.log('Sending request to:', `/meetings/${numericId}`);
      console.log('Request method: PUT');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      const response = await api.put(`/meetings/${numericId}`, payload);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      console.log(`Meeting ${numericId} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      if (error.response) {
        console.error('Complete error response:', JSON.stringify(error.response, null, 2));
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Extract error message from response if available
        let errorMessage = 'Failed to update meeting';
        const responseData = error.response.data;
        
        if (responseData) {
          // Try to get validation errors if they exist
          if (responseData.errors) {
            errorMessage = Object.entries(responseData.errors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'object') {
            // Try to stringify the entire response data if it's an object
            errorMessage = JSON.stringify(responseData, null, 2);
          }
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        console.error('Request setup error:', error.message);
        throw error;
      }
    }
  },

  // Delete meeting
  deleteMeeting: async (id) => {
    try {
      // Ensure ID is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid meeting ID');
      }
      
      console.log(`Deleting meeting with ID: ${numericId}`);
      const response = await api.delete(`/meetings/${numericId}`);
      console.log(`Meeting ${numericId} deleted successfully`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting meeting ${id}:`, error);
      if (error.response) {
        console.error('Complete error response:', JSON.stringify(error.response, null, 2));
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Extract error message from response if available
        let errorMessage = 'Failed to delete meeting';
        if (error.response.data) {
          // Try to get validation errors if they exist
          if (error.response.data.errors) {
            errorMessage = Object.entries(error.response.data.errors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        console.error('Request setup error:', error.message);
        throw error;
      }
    }
  },

  // Get upcoming meetings (filter from all meetings)
  getUpcomingMeetings: async () => {
    const response = await api.get('/meetings/getall')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const extractDate = (m) => new Date(m.date || m.meetingDate || m.meeting_date)
    return response.data.filter(meeting => {
      const meetingDate = extractDate(meeting)
      return meetingDate >= today && !isNaN(meetingDate.getTime())
    })
  },

  // Get past meetings (filter from all meetings)
  getPastMeetings: async () => {
    const response = await api.get('/meetings/getall')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const extractDate = (m) => new Date(m.date || m.meetingDate || m.meeting_date)
    return response.data.filter(meeting => {
      const meetingDate = extractDate(meeting)
      return meetingDate < today && !isNaN(meetingDate.getTime())
    })
  },

  // Get today's meetings (filter from all meetings)
  getTodaysMeetings: async () => {
    const response = await api.get('/meetings/getall')
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const extractDate = (m) => new Date(m.date || m.meetingDate || m.meeting_date)
    return response.data.filter(meeting => {
      const d = extractDate(meeting)
      if (isNaN(d.getTime())) return false
      const meetingDateStr = d.toISOString().split('T')[0]
      return meetingDateStr === todayStr
    })
  }
}

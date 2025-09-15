import api from './api';
import { showSuccess, showError, showLoading, closeLoading } from '../utils/alerts';

const memberAvailabilityService = {
  // Get member statuses for a specific meeting
  async getMemberStatuses(meetingId) {
    try {
      // Ensure meetingId is a number
      const cleanMeetingId = Number(meetingId);
      if (isNaN(cleanMeetingId)) {
        throw new Error('Invalid meeting ID');
      }
      
      console.log('Fetching member statuses for meeting ID:', cleanMeetingId);
      
      // Use the updated backend endpoint
      const response = await api.get(`/availabilities/meeting/${cleanMeetingId}/statuses`);
      
      // The backend now returns data grouped by status directly
      // Convert the response to match our frontend structure
      const groupedData = response.data;
      
      // Debug: Log the actual response to see the structure
      console.log('Backend response structure:', JSON.stringify(groupedData, null, 2));
      
      // Transform the grouped data to our expected format
      const result = {
        AVAILABLE: [],
        UNAVAILABLE: [],
        MAYBE: [],
        PENDING: []
      };
      
      // Process each status group
      Object.keys(groupedData).forEach(status => {
        if (groupedData[status] && Array.isArray(groupedData[status])) {
          console.log(`Processing ${status} group with ${groupedData[status].length} members:`, groupedData[status]);
          result[status] = groupedData[status].map(item => {
            console.log('Individual item:', item);
            return {
              memberId: item.memberId || item.memId || item.id,
              name: item.memberName || item.name || item.member?.name || 'Unknown Member',
              email: item.memberEmail || item.email || item.member?.email || ''
            };
          });
          console.log(`Final ${status} array length:`, result[status].length);
        } else {
          console.log(`${status} group is empty or not an array:`, groupedData[status]);
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching member statuses:', error);
      // Return empty arrays for all statuses in case of error
      return {
        AVAILABLE: [],
        UNAVAILABLE: [],
        MAYBE: [],
        PENDING: []
      };
    }
  },

  // Get availability summary for a meeting
  async getAvailabilitySummary(meetingId) {
    try {
      const cleanMeetingId = Number(meetingId);
      if (isNaN(cleanMeetingId)) {
        throw new Error('Invalid meeting ID');
      }
      
      console.log('Fetching availability summary for meeting ID:', cleanMeetingId);
      
      // Use the new summary endpoint
      const response = await api.get(`/availabilities/meeting/${cleanMeetingId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability summary:', error);
      throw error;
    }
  },

  // Create or update availability for a member
  async createAvailability(requestData) {
    showLoading('Updating availability...');
    try {
      console.log('Creating/Updating availability with data:', JSON.stringify(requestData, null, 2));
      
      // Validate required fields
      if (!requestData.memberId || !requestData.meetingId || !requestData.avaStatus) {
        const error = new Error('Missing required fields');
        error.details = {
          received: requestData,
          required: ['memberId', 'meetingId', 'avaStatus']
        };
        console.error('Validation error:', error);
        throw error;
      }

      // Ensure status is valid
      const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'MAYBE', 'PENDING'];
      const status = requestData.avaStatus.toUpperCase();
      if (!validStatuses.includes(status)) {
        const error = new Error('Invalid status value');
        error.details = {
          received: requestData.avaStatus,
          validValues: validStatuses.join(', ')
        };
        console.error('Validation error:', error);
        throw error;
      }

      // Prepare the request with explicit Content-Type and ensure proper enum value
      // The backend expects avaStatus to be an enum value (not a string)
      const payload = {
        memberId: Number(requestData.memberId),
        meetingId: Number(requestData.meetingId),
        avaStatus: status // This should match the exact enum value on the backend
      };
      
      console.log('Prepared payload:', JSON.stringify(payload, null, 2));
      console.log('Sending request to /availabilities/create-or-update with:', payload);
      
      // First try to update if exists, if not create new
      try {
        console.log('Sending request to /availabilities/create-or-update with payload:', JSON.stringify(payload, null, 2));
        
        const response = await api.post('/availabilities/create-or-update', 
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            validateStatus: (status) => {
              console.log('Response status:', status);
              return status < 500; // Reject only if status is 500 or above
            }
          }
        );
        
        console.log('Raw response:', response);
        
        // If successful, return the response
        if (response.status >= 200 && response.status < 300) {
          console.log('Success response from server:', response.data);
          await showSuccess('Success', 'Availability updated successfully');
          return response.data;
        }
        
        // Handle 4xx errors
        const error = new Error(`Request failed with status ${response.status}: ${response.statusText || 'Unknown error'}`);
        error.response = response;
        error.status = response.status;
        error.data = response.data;
        console.error('API Error:', {
          message: error.message,
          status: error.status,
          response: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        throw error;
        
      } catch (error) {
        // If the endpoint doesn't exist, try the old endpoint
        if (error.response?.status === 404) {
          console.log('update-or-create endpoint not found, trying add endpoint');
          return this.handleLegacyCreate(payload);
        }
        
        // Re-throw any other errors
        throw error;
      }
      
      console.log('Response from server:', response.data);
      await showSuccess('Success', 'Availability updated successfully');
      return response.data;
    } catch (error) {
      closeLoading();
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.status,
        data: error.data,
        stack: error.stack,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        },
        details: error.details
      };
      
      console.error('Error creating availability:', JSON.stringify(errorDetails, null, 2));
      
      let errorMessage = 'Failed to update availability';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await showError('Update Failed', errorMessage);
      throw error;
    }
  },
  // Handle legacy create endpoint for backward compatibility
  async handleLegacyCreate(payload) {
    try {
      console.log('Trying legacy create endpoint with:', payload);
      const response = await api.post('/availabilities/add', payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: status => status < 500
      });

      if (response.status === 400 && 
          response.data?.message?.includes('duplicate key value violates unique constraint')) {
        // If we get a duplicate key error, try to update the existing record
        console.log('Duplicate entry found, attempting to update existing record');
        return this.updateAvailability(payload);
      }

      if (response.status >= 400) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = response;
        error.status = response.status;
        error.data = response.data;
        throw error;
      }

      return response.data;
    } catch (error) {
      console.error('Error in handleLegacyCreate:', error);
      throw error;
    }
  },

  // Update an existing availability
  async updateAvailability(updateData) {
    showLoading('Updating availability...');
    try {
      const { memberId, meetingId, avaStatus } = updateData;
      console.log(`Updating availability for member ${memberId} and meeting ${meetingId}`);
      
      // First, get the existing record ID
      const allAvailabilities = await this.getAllAvailabilities();
      const existing = allAvailabilities.find(
        a => a.memberId === memberId && a.meetingId === meetingId
      );
      
      if (!existing) {
        throw new Error('Existing availability not found for update');
      }
      
      // Now update the existing record
      const response = await api.put(`/availabilities/${existing.id}`, { avaStatus });
      await showSuccess('Success', 'Availability updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating availability:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Failed to update availability';
      await showError('Update Failed', errorMessage);
      throw error;
    } finally {
      closeLoading();
    }
  },

  async getAvailabilityById(avId) {
    try {
      const cleanAvId = Number(avId);
      if (isNaN(cleanAvId)) {
        throw new Error('Invalid availability ID');
      }
      
      console.log('Fetching availability by ID:', cleanAvId);
      
      // Use the updated endpoint
      const response = await api.get(`/availabilities/${cleanAvId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability by ID:', error);
      throw error;
    }
  },

  async getAllAvailabilities(memberId = null) {
    console.log('Fetching all availabilities', { memberId });
    const url = memberId ? `/availabilities/member/${memberId}` : '/availabilities';
    const response = await api.get(url);
    return response.data;
  },
  
  
  

  async getAvailableMembers(meetingId) {
    try {
      const cleanMeetingId = Number(meetingId);
      if (isNaN(cleanMeetingId)) {
        throw new Error('Invalid meeting ID');
      }
      
      // Get all statuses and filter for available members
      const statusData = await this.getMemberStatuses(cleanMeetingId);
      return statusData.AVAILABLE || [];
    } catch (error) {
      console.error('Error fetching available members:', error);
      throw error;
    }
  },

  async getMemberAvailability(memberId) {
    try {
      return await this.getAllAvailabilities(memberId);
    } catch (error) {
      console.error('Error fetching member-specific availability:', error);
      throw error;
    }
  },

  async saveRolePreferences(memberId, meetingId, preferences) {
    try {
      console.log('Saving role preferences:', { memberId, meetingId, preferences });
      
      // Transform preferences to match RolePreferenceRequestDTO structure
      const requestDTO = preferences.map((pref, index) => ({
        memberId: Number(memberId),
        meetingId: Number(meetingId),
        roleId: pref.roleId,
        prefOrder: index + 1 // 1-based ordering as per backend expectation
      }));
      
      console.log('Sending preferences data:', requestDTO);
      
      // Send the data in the format the backend expects (array of RolePreferenceRequestDTO)
      const response = await api.post('/role-preferences/add', requestDTO);
      
      console.log('Save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving role preferences:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  async getRolePreferences(memberId, meetingId) {
    try {
      const response = await api.get(`/role-preferences/member/${memberId}/meeting/${meetingId}`);
      console.log('Raw role preferences response:', response.data);
      
      // The backend returns an array with roleIds, but we need to fetch role details
      if (response.data && response.data.length > 0) {
        const preferencesData = response.data[0]; // Get the first item
        if (preferencesData.roleIds && preferencesData.roleIds.length > 0) {
          // Fetch role details for each role ID
          const rolePromises = preferencesData.roleIds.map(roleId => 
            api.get(`/roles/${roleId}`)
          );
          
          const roleResponses = await Promise.all(rolePromises);
          
          return roleResponses.map((roleResponse, index) => ({
            roleId: preferencesData.roleIds[index],
            roleName: roleResponse.data.roleName,
            preferenceOrder: index + 1
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching role preferences:', error);
      return [];
    }
  },

  async getAvailableRolesForMeeting(meetingId) {
    try {
      // Use the correct backend endpoint for meeting-specific available roles
      const response = await api.get(`/role-preferences/meeting/${meetingId}/available-roles`);
      console.log('Available roles response:', response.data);
      
      // Transform the response to match our expected format and remove duplicates
      const uniqueRoles = new Map(); // Use Map to remove duplicates by roleId
      
      response.data.forEach(role => {
        if (role.roleId && !uniqueRoles.has(role.roleId)) {
          uniqueRoles.set(role.roleId, {
            roleId: role.roleId,
            roleName: role.roleName,
            roleDescription: role.roleDescription
          });
        }
      });
      
      const formattedRoles = Array.from(uniqueRoles.values());
      console.log('Formatted unique roles:', formattedRoles);
      
      return formattedRoles;
    } catch (error) {
      console.error('Error fetching available roles for meeting:', error);
      return [];
    }
  }
};

export default memberAvailabilityService;

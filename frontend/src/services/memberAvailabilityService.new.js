import api from './api';
import { showSuccess, showError, showLoading, closeLoading } from '../utils/alerts';

const memberAvailabilityService = {
  // Get member statuses for a specific meeting
  async getMemberStatuses(meetingId) {
    try {
      const cleanMeetingId = Number(meetingId);
      if (isNaN(cleanMeetingId)) {
        throw new Error('Invalid meeting ID');
      }
      
      const response = await api.get(`/availabilities/meeting/${cleanMeetingId}/statuses`);
      const groupedData = response.data;
      
      const result = {
        AVAILABLE: [],
        UNAVAILABLE: [],
        MAYBE: [],
        PENDING: []
      };
      
      Object.keys(groupedData).forEach(status => {
        if (groupedData[status] && Array.isArray(groupedData[status])) {
          result[status] = groupedData[status].map(item => ({
            memberId: item.memberId || item.memId || item.id,
            name: item.memberName || item.name || item.member?.name || 'Unknown Member',
            email: item.memberEmail || item.email || item.member?.email || ''
          }));
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching member statuses:', error);
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
      if (!requestData.memberId || !requestData.meetingId || !requestData.avaStatus) {
        throw new Error('Missing required fields: memberId, meetingId, avaStatus');
      }

      const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'MAYBE', 'PENDING'];
      const status = requestData.avaStatus.toUpperCase();
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
      }

      const payload = {
        memberId: Number(requestData.memberId),
        meetingId: Number(requestData.meetingId),
        avaStatus: status
      };
      
      const response = await api.post('/availabilities/create-or-update', 
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );
      
      if (response.status === 404) {
        return this.handleLegacyCreate(payload);
      }
      
      if (response.status >= 400) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = response;
        throw error;
      }
      
      await showSuccess('Success', 'Availability updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating availability:', error);
      await showError('Update Failed', error.response?.data?.message || error.message);
      throw error;
    } finally {
      closeLoading();
    }
  },

  // Handle legacy create endpoint for backward compatibility
  async handleLegacyCreate(payload) {
    try {
      const response = await api.post('/availabilities/add', payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: status => status < 500
      });

      if (response.status === 400 && 
          response.data?.message?.includes('duplicate key value violates unique constraint')) {
        return this.updateAvailability(payload);
      }

      if (response.status >= 400) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = response;
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
      const { memberId, meetingId } = updateData;
      const allAvailabilities = await this.getAllAvailabilities();
      const existing = allAvailabilities.find(
        a => a.memberId === memberId && a.meetingId === meetingId
      );
      
      if (!existing) {
        throw new Error('Existing availability not found for update');
      }
      
      const response = await api.put(`/availabilities/${existing.id}`, { 
        avaStatus: updateData.avaStatus 
      });
      
      await showSuccess('Success', 'Availability updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating availability:', error);
      await showError('Update Failed', error.response?.data?.message || error.message);
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
      const response = await api.get(`/availabilities/${cleanAvId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availability by ID:', error);
      throw error;
    }
  },

  async getAllAvailabilities() {
    try {
      const response = await api.get('/availabilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching all availabilities:', error);
      throw error;
    }
  },

  async getAvailableMembers(meetingId) {
    try {
      const cleanMeetingId = Number(meetingId);
      if (isNaN(cleanMeetingId)) {
        throw new Error('Invalid meeting ID');
      }
      const statusData = await this.getMemberStatuses(cleanMeetingId);
      return statusData.AVAILABLE || [];
    } catch (error) {
      console.error('Error fetching available members:', error);
      throw error;
    }
  },

  async getMemberAvailability(memberId) {
    try {
      const allAvailabilities = await this.getAllAvailabilities();
      return allAvailabilities.filter(avail => Number(avail.memberId) === Number(memberId));
    } catch (error) {
      console.error('Error fetching member availability:', error);
      throw error;
    }
  },

  async saveRolePreferences(memberId, meetingId, preferences) {
    try {
      const response = await api.post('/role-preferences', {
        memberId,
        meetingId,
        preferences: preferences.map(pref => ({
          roleId: pref.roleId,
          preferenceOrder: pref.preferenceOrder
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Error saving role preferences:', error);
      throw error;
    }
  },

  async getRolePreferences(memberId, meetingId) {
    try {
      const response = await api.get(`/role-preferences/member/${memberId}/meeting/${meetingId}`);
      if (response.data && response.data.preferences) {
        return response.data.preferences.map(pref => ({
          roleId: pref.role.id,
          roleName: pref.role.name,
          preferenceOrder: pref.prefOrder
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching role preferences:', error);
      return [];
    }
  },

  async getAvailableRolesForMeeting(meetingId) {
    try {
      const response = await api.get(`/role-preferences/meeting/${meetingId}/available-roles`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available roles for meeting:', error);
      return [];
    }
  }
};

export default memberAvailabilityService;

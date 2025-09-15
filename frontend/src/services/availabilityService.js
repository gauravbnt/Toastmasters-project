import api from './api'

export const availabilityService = {
  // ✅ Get all availability records
  getAllAvailability: async () => {
    const response = await api.get('/availabilities')
    return response.data
  },

  // ✅ Get availability statuses by Meeting ID → "/availabilities/meeting/{id}/statuses"
  getAvailabilityByMeetingId: async (meetingId) => {
    const response = await api.get(`/availabilities/meeting/${meetingId}/statuses`)
    return response.data
  },

  // ✅ Get availability summary by Meeting ID → "/availabilities/meeting/{id}/summary"
  getAvailabilitySummaryByMeetingId: async (meetingId) => {
    const response = await api.get(`/availabilities/meeting/${meetingId}/summary`)
    return response.data
  },

  // ✅ Get availability by Member ID → "/availabilities/member/{id}"
  getAvailabilityByMemberId: async (memberId) => {
    const response = await api.get(`/availabilities/member/${memberId}`)
    return response.data
  },

  // ✅ Create availability → "/availabilities/add"
  createAvailability: async (availabilityData) => {
    const response = await api.post('/availabilities/add', availabilityData)
    return response.data
  },

  // ✅ Update availability by ID → "/availabilities/{id}"
  updateAvailability: async (id, availabilityData) => {
    const response = await api.put(`/availabilities/${id}`, availabilityData)
    return response.data
  },

  // ✅ Delete availability by ID → "/availabilities/{id}"
  deleteAvailability: async (id) => {
    const response = await api.delete(`/availabilities/${id}`)
    return response.data
  }
}

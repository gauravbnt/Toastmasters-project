import api from './api'

export const agendaService = {
  // Get all agenda items
  getAllAgendaItems: async () => {
    const response = await api.get('/agenda')
    return response.data
  },

  // Get agenda items by meeting ID
  getAgendaByMeetingId: async (meetingId) => {
    const response = await api.get(`/agenda/meeting/${meetingId}`)
    return response.data
  },

  // Get agenda item by ID
  getAgendaById: async (id) => {
    const response = await api.get(`/agenda/${id}`)
    return response.data
  },

  // Create new agenda item
  createAgendaItem: async (agendaData) => {
    const response = await api.post('/agenda', agendaData)
    return response.data
  },

  // Update agenda item
  updateAgendaItem: async (id, agendaData) => {
    const response = await api.put(`/agenda/${id}`, agendaData)
    return response.data
  },

  // Delete agenda item
  deleteAgendaItem: async (id) => {
    const response = await api.delete(`/agenda/${id}`)
    return response.data
  }
}

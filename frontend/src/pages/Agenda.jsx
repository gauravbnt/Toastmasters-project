import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Clock, User, Calendar } from 'lucide-react'
import { agendaService } from '../services/agendaService'
import { meetingService } from '../services/meetingService'
import { memberService } from '../services/memberService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import SearchFilter from '../components/common/SearchFilter'
import toast from 'react-hot-toast'

const Agenda = () => {
  const [agendaItems, setAgendaItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [meetings, setMeetings] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterValue, setFilterValue] = useState('')

  const [formData, setFormData] = useState({
    meetingId: '',
    topic: '',
    speakerId: '',
    duration: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterItems()
  }, [agendaItems, searchTerm, filterValue])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [agendaData, meetingsData, membersData] = await Promise.all([
        agendaService.getAllAgendaItems(),
        meetingService.getAllMeetings(),
        memberService.getActiveMembers()
      ])
      
      setAgendaItems(agendaData)
      setMeetings(meetingsData)
      setMembers(membersData)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = agendaItems

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.topic.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterValue) {
      filtered = filtered.filter(item => item.meetingId.toString() === filterValue)
    }

    setFilteredItems(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        meetingId: parseInt(formData.meetingId),
        speakerId: parseInt(formData.speakerId),
        duration: parseInt(formData.duration)
      }

      if (editingItem) {
        await agendaService.updateAgendaItem(editingItem.agendaId, submitData)
        toast.success('Agenda item updated successfully')
      } else {
        await agendaService.createAgendaItem(submitData)
        toast.success('Agenda item created successfully')
      }
      
      setIsModalOpen(false)
      setEditingItem(null)
      setFormData({ meetingId: '', topic: '', speakerId: '', duration: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to save agenda item')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      meetingId: item.meetingId.toString(),
      topic: item.topic,
      speakerId: item.speakerId.toString(),
      duration: item.duration.toString()
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (agendaId) => {
    if (window.confirm('Are you sure you want to delete this agenda item?')) {
      try {
        await agendaService.deleteAgendaItem(agendaId)
        toast.success('Agenda item deleted successfully')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete agenda item')
      }
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({ meetingId: '', topic: '', speakerId: '', duration: '' })
    setIsModalOpen(true)
  }

  const getMeetingTitle = (meetingId) => {
    const meeting = meetings.find(m => m.meetingId === meetingId)
    return meeting ? meeting.title : 'Unknown Meeting'
  }

  const getMemberName = (memberId) => {
    const member = members.find(m => m.memberId === memberId)
    return member ? member.name : 'Unknown Member'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMeetingDate = (meetingId) => {
    const meeting = meetings.find(m => m.meetingId === meetingId)
    return meeting ? formatDate(meeting.date) : ''
  }

  const filterOptions = meetings.map(meeting => ({
    value: meeting.meetingId.toString(),
    label: `${meeting.title} - ${formatDate(meeting.date)}`
  }))

  // Group agenda items by meeting
  const groupedItems = filteredItems.reduce((groups, item) => {
    const meetingId = item.meetingId
    if (!groups[meetingId]) {
      groups[meetingId] = []
    }
    groups[meetingId].push(item)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Agenda Item</span>
        </button>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={filterOptions}
        placeholder="Search agenda items..."
        filterLabel="All Meetings"
      />

      <div className="space-y-8">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agenda items</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new agenda item.</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([meetingId, items]) => (
            <motion.div
              key={meetingId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getMeetingTitle(parseInt(meetingId))}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getMeetingDate(parseInt(meetingId))}
                </p>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.agendaId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{item.topic}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User size={16} />
                          <span>{getMemberName(item.speakerId)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{item.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.agendaId)}
                        className="p-2 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Agenda Item' : 'Add New Agenda Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting
            </label>
            <select
              required
              value={formData.meetingId}
              onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
              className="input-field"
            >
              <option value="">Select meeting</option>
              {meetings.map((meeting) => (
                <option key={meeting.meetingId} value={meeting.meetingId}>
                  {meeting.title} - {formatDate(meeting.date)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="input-field"
              placeholder="Enter agenda topic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speaker
            </label>
            <select
              required
              value={formData.speakerId}
              onChange={(e) => setFormData({ ...formData, speakerId: e.target.value })}
              className="input-field"
            >
              <option value="">Select speaker</option>
              {members.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              required
              min="1"
              max="120"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="input-field"
              placeholder="Enter duration in minutes"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Update' : 'Create'} Agenda Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Agenda

import React, { useState, useEffect } from 'react'
import { meetingService } from '../../services/meetingService'
import { memberRoleAssignService } from '../../services/memberRoleAssignService'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ChevronRight,
  UserCheck,
  AlertCircle,
  List,
  Play,
  Archive,
  Search,
  X
} from 'lucide-react'

const RoleAssignmentOverview = () => {
  const [meetings, setMeetings] = useState([])
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMeetingsAndAssignments()
  }, [])

  const fetchMeetingsAndAssignments = async () => {
    try {
      setLoading(true)
      
      // Fetch all meetings
      const meetingsData = await meetingService.getAllMeetings()
      console.log('Meetings data:', meetingsData)
      setMeetings(meetingsData)

      // Filter out meetings with invalid IDs and log warnings
      const validMeetings = meetingsData.filter(meeting => {
        if (!meeting || !meeting.id) {
          console.warn('Meeting with invalid ID found:', meeting)
          return false
        }
        return true
      })

      console.log('Valid meetings:', validMeetings)

      // Fetch assignments for all valid meetings
      const assignmentsPromises = validMeetings.map(meeting => 
        memberRoleAssignService.getAssignmentsByMeeting(meeting.id)
          .catch(() => []) // Handle errors gracefully
      )
      
      const assignmentsResults = await Promise.all(assignmentsPromises)
      
      // Create assignments object with meetingId as key
      const assignmentsMap = {}
      validMeetings.forEach((meeting, index) => {
        assignmentsMap[meeting.id] = assignmentsResults[index] || []
      })
      
      // Also include meetings with invalid IDs in the map (with empty assignments)
      meetingsData.forEach(meeting => {
        if (!meeting || !meeting.id) {
          console.warn('Skipping meeting with invalid ID in assignments map:', meeting)
          return
        }
        if (!assignmentsMap[meeting.id]) {
          console.log(`Adding empty assignments for meeting ID: ${meeting.id}`)
          assignmentsMap[meeting.id] = []
        }
      })
      
      console.log('Final assignments map:', assignmentsMap)
      
      setAssignments(assignmentsMap)
    } catch (error) {
      console.error('Error fetching meetings and assignments:', error)
      setError('Failed to load meetings data')
    } finally {
      setLoading(false)
    }
  }

  const getMeetingTypeColor = (type) => {
    const colors = {
      'Regular': 'bg-blue-100 text-blue-800',
      'Contest': 'bg-purple-100 text-purple-800',
      'Special': 'bg-green-100 text-green-800',
      'Workshop': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getMeetingStatus = (meeting) => {
    const now = new Date()
    const meetingDate = new Date(meeting.date)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    today.setHours(0, 0, 0, 0)
    meetingDate.setHours(0, 0, 0, 0)
    
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const startTime = meeting.startTime ? 
      parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0
    const endTime = meeting.endTime ? 
      parseInt(meeting.endTime.split(':')[0]) * 60 + parseInt(meeting.endTime.split(':')[1]) : 1440
    
    const isToday = meetingDate.getTime() === today.getTime()
    const isOngoing = isToday && currentTime >= startTime && currentTime <= endTime
    
    if (isOngoing) {
      return { status: 'Ongoing', color: 'bg-green-100 text-green-800' }
    } else if (meetingDate.getTime() > today.getTime()) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
    } else if (meetingDate.getTime() < today.getTime()) {
      return { status: 'Previous', color: 'bg-gray-100 text-gray-800' }
    } else {
      // Today but not ongoing (either not started yet or already ended)
      if (currentTime < startTime) {
        return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
      } else {
        return { status: 'Previous', color: 'bg-gray-100 text-gray-800' }
      }
    }
  }

  // Helper function to categorize meetings
  const categorizeMeetings = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    today.setHours(0, 0, 0, 0)
    
    return meetings.reduce((acc, meeting) => {
      const meetingDate = new Date(meeting.date)
      meetingDate.setHours(0, 0, 0, 0)
      
      // Check if meeting is ongoing (today and within time range)
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const startTime = meeting.startTime ? 
        parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0
      const endTime = meeting.endTime ? 
        parseInt(meeting.endTime.split(':')[0]) * 60 + parseInt(meeting.endTime.split(':')[1]) : 1440
      
      const isOngoing = meetingDate.getTime() === today.getTime() && currentTime >= startTime && currentTime <= endTime
      
      if (isOngoing) {
        acc.ongoing.push(meeting)
      } else if (meetingDate.getTime() > today.getTime()) {
        acc.upcoming.push(meeting)
      } else if (meetingDate.getTime() < today.getTime()) {
        acc.previous.push(meeting)
      } else {
        // Today but not ongoing (either not started yet or already ended)
        if (currentTime < startTime) {
          acc.upcoming.push(meeting)
        } else {
          acc.previous.push(meeting)
        }
      }
      
      acc.all.push(meeting)
      return acc
    }, { all: [], upcoming: [], ongoing: [], previous: [] })
  }

  const filterMeetings = (meetings) => {
    if (!searchTerm.trim()) return meetings
    
    return meetings.filter(meeting => 
      meeting.meetingTheme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.meetingId?.toString().includes(searchTerm)
    )
  }

  const getFilteredMeetings = () => {
    const categorized = categorizeMeetings()
    const tabMeetings = categorized[activeTab] || []
    const filtered = filterMeetings(tabMeetings)
    
    // Sort within each category
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      
      if (activeTab === 'previous') {
        // Previous meetings: newest first
        return dateB - dateA
      } else {
        // Upcoming/ongoing: earliest first
        return dateA - dateB
      }
    })
  }

  const getAssignmentCount = (meetingId) => {
    return assignments[meetingId]?.length || 0
  }

  const getMeetingDate = (meeting) => {
    return meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'No Date'
  }

  const getMeetingTime = (meeting) => {
    return meeting.startTime && meeting.endTime ? `${meeting.startTime} - ${meeting.endTime}` : meeting.time || 'No Time'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Meetings</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  const categorized = categorizeMeetings()
  const filteredMeetings = getFilteredMeetings()

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Role Assignment</h3>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search meetings by theme, location, type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meeting Category Tabs */}
      <div className="border-b border-gray-200 px-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <List className="inline-block mr-2" size={16} />
            All Meetings ({filterMeetings(categorized.all).length}{searchTerm ? ` of ${categorized.all.length}` : ''})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="inline-block mr-2" size={16} />
            Upcoming ({filterMeetings(categorized.upcoming).length}{searchTerm ? ` of ${categorized.upcoming.length}` : ''})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ongoing'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Play className="inline-block mr-2" size={16} />
            Ongoing ({filterMeetings(categorized.ongoing).length}{searchTerm ? ` of ${categorized.ongoing.length}` : ''})
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'previous'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Archive className="inline-block mr-2" size={16} />
            Previous ({filterMeetings(categorized.previous).length}{searchTerm ? ` of ${categorized.previous.length}` : ''})
          </button>
        </nav>
      </div>

      {/* Meetings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles Assigned</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMeetings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No meetings match your search criteria' : (
                    <>
                      {activeTab === 'all' && 'No meetings found'}
                      {activeTab === 'upcoming' && 'No upcoming meetings'}
                      {activeTab === 'ongoing' && 'No ongoing meetings'}
                      {activeTab === 'previous' && 'No previous meetings'}
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredMeetings.map((meeting) => {
                const meetingStatus = getMeetingStatus(meeting)
                const assignmentCount = getAssignmentCount(meeting.id)
                const now = new Date()
                const meetingDate = new Date(meeting.date)
                const isToday = meetingDate.toDateString() === now.toDateString()
                const currentTime = now.getHours() * 60 + now.getMinutes()
                const startTime = meeting.startTime ? 
                  parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0
                const endTime = meeting.endTime ? 
                  parseInt(meeting.endTime.split(':')[0]) * 60 + parseInt(meeting.endTime.split(':')[1]) : 1440
                const isOngoing = isToday && currentTime >= startTime && currentTime <= endTime

                return (
                  <tr key={meeting.id} className={`hover:bg-gray-50 ${isOngoing ? 'bg-green-50 border-l-4 border-green-400' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{meeting.meetingTheme || 'Untitled Meeting'}</div>
                        {isOngoing && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Play className="w-3 h-3 mr-1" />
                            Live
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{meeting.meetingId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(meeting.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMeetingTime(meeting)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meeting.location || 'No Location'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMeetingTypeColor(meeting.type)}`}>
                        {meeting.type || 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {assignmentCount} role{assignmentCount !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {meeting.id ? (
                        <Link
                          to={`/admin/role-assignment/${meeting.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Assign Roles
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-gray-400 bg-gray-100 cursor-not-allowed">
                          Assign Roles
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RoleAssignmentOverview

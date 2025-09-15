import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, Users, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import memberAvailabilityService from '../services/memberAvailabilityService'
import { meetingService } from '../services/meetingService'
import { memberService } from '../services/memberService'
import memberRoleService from '../services/memberRoleService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import SearchFilter from '../components/common/SearchFilter'
import toast from 'react-hot-toast'

const Availability = () => {
  const [membersByStatus, setMembersByStatus] = useState({
    AVAILABLE: [],
    UNAVAILABLE: [],
    MAYBE: [],
    PENDING: []
  })
  const [availabilitySummary, setAvailabilitySummary] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState('')
  const [selectedMeetingDetails, setSelectedMeetingDetails] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedMeeting) {
      fetchAvailabilityData(selectedMeeting)
      // Find and set the selected meeting details
      const meeting = meetings.find(m => m.meetingId.toString() === selectedMeeting)
      setSelectedMeetingDetails(meeting || null)
    } else {
      setSelectedMeetingDetails(null)
    }
  }, [selectedMeeting, meetings])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [meetingsData, membersData] = await Promise.all([
        meetingService.getUpcomingMeetings(),
        memberService.getAllMembers()
      ])
      
      setMeetings(meetingsData)
      setMembers(membersData)
      
      if (meetingsData.length > 0) {
        setSelectedMeeting(meetingsData[0].meetingId.toString())
      }
    } catch (error) {
      toast.error('Failed to fetch initial data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailabilityData = async (meetingId) => {
    try {
      const [statusData, summaryData] = await Promise.all([
        memberAvailabilityService.getMemberStatuses(meetingId),
        memberAvailabilityService.getAvailabilitySummary(meetingId)
      ])
      
      setMembersByStatus(statusData)
      setAvailabilitySummary(summaryData)
    } catch (error) {
      console.error('Error fetching availability data:', error)
      toast.error('Failed to fetch availability data')
    }
  }

  const handleAvailabilityChange = async (memberId, meetingId, status) => {
    try {
      await memberAvailabilityService.createAvailability({
        memberId: parseInt(memberId),
        meetingId: parseInt(meetingId),
        avaStatus: status
      })

      toast.success('Availability updated successfully')
      fetchAvailabilityData(meetingId)
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredMeetings = meetings

  const filteredMembers = searchTerm
    ? members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : members

  const filterOptions = meetings.map(meeting => ({
    value: meeting.meetingId.toString(),
    label: `${meeting.title} - ${formatDate(meeting.date)}`
  }))

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'UNAVAILABLE':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'MAYBE':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-50 border-green-200'
      case 'UNAVAILABLE':
        return 'bg-red-50 border-red-200'
      case 'MAYBE':
        return 'bg-yellow-50 border-yellow-200'
      case 'PENDING':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Availability</h1>
        <p className="text-gray-600">Manage member availability for meetings.</p>
      </div>

      {/* Meeting Selection and Details */}
      <div className="space-y-6">
        {/* Meeting Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <label htmlFor="meeting-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Meeting
              </label>
              <select
                id="meeting-select"
                value={selectedMeeting}
                onChange={(e) => setSelectedMeeting(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a meeting...</option>
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
          </div>
        </div>

        {/* Meeting Details */}
        {selectedMeetingDetails && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedMeetingDetails.title || 'No Title'}</h3>
                {selectedMeetingDetails.meetingTheme && (
                  <p className="text-gray-600 mt-1">{selectedMeetingDetails.meetingTheme}</p>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      {formatDate(selectedMeetingDetails.date)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      {selectedMeetingDetails.startTime} - {selectedMeetingDetails.endTime}
                    </span>
                  </div>
                  {selectedMeetingDetails.location && (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">
                        {selectedMeetingDetails.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Meeting Type</h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedMeetingDetails.meetingType || 'Regular'}
                </span>
                {selectedMeetingDetails.description && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm">{selectedMeetingDetails.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedMeeting && availabilitySummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{availabilitySummary.AVAILABLE}</p>
                  <p className="text-sm text-green-700">Available</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-red-900">{availabilitySummary.UNAVAILABLE}</p>
                  <p className="text-sm text-red-700">Unavailable</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{availabilitySummary.MAYBE}</p>
                  <p className="text-sm text-yellow-700">Maybe</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-gray-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{availabilitySummary.PENDING}</p>
                  <p className="text-sm text-gray-700">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member Lists by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(membersByStatus).map(([status, members]) => (
              <div key={status} className={`rounded-lg border-2 ${getStatusColor(status)} p-4`}>
                <div className="flex items-center mb-4">
                  {getStatusIcon(status)}
                  <h3 className="ml-2 text-lg font-semibold text-gray-900 capitalize">
                    {status.toLowerCase()} ({members.length})
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No members in this category</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.memberId} className="bg-white rounded-md p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!selectedMeeting && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meeting selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a meeting to view member availability.</p>
        </div>
      )}
    </div>
  )
}

export default Availability

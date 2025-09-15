import React, { useState } from 'react'
import { Search, Users, CheckCircle, XCircle, AlertCircle, Clock, Eye, X, Calendar, MapPin, User, Mail, Phone, UserCheck, Hash, Home } from 'lucide-react'
import memberAvailabilityService from '../services/memberAvailabilityService'
import { meetingService } from '../services/meetingService'
import { memberService } from '../services/memberService'
import { toast } from 'react-hot-toast'

const MemberAvailability = () => {
  const [meetingId, setMeetingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [membersByStatus, setMembersByStatus] = useState({
    AVAILABLE: [],
    UNAVAILABLE: [],
    MAYBE: [],
    PENDING: []
  })
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [memberSearchTerm, setMemberSearchTerm] = useState('')

  const handleSearch = async () => {
    if (!meetingId.trim()) {
      toast.error('Please enter a meeting ID')
      return
    }

    setLoading(true)
    setError('')
    setHasSearched(false)
    
    try {
      const processedMeetingId = parseInt(meetingId, 10)
      if (isNaN(processedMeetingId)) {
        throw new Error('Please enter a valid meeting ID')
      }

      const data = await memberAvailabilityService.getMemberStatuses(processedMeetingId)
      setMembersByStatus(data)
      setHasSearched(true)
      
      // Load meeting details for the view meeting functionality
      try {
        const meetingData = await meetingService.getMeetingById(processedMeetingId)
        setSelectedMeeting(meetingData)
      } catch (meetingErr) {
        console.error('Error loading meeting details:', meetingErr)
      }
    } catch (err) {
      console.error('Error fetching member statuses:', err)
      setError(err.message || 'Failed to fetch member availability data')
      toast.error(err.message || 'Failed to fetch member availability data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="text-green-600" size={20} />
      case 'UNAVAILABLE':
        return <XCircle className="text-red-600" size={20} />
      case 'MAYBE':
        return <AlertCircle className="text-yellow-600" size={20} />
      default:
        return <Clock className="text-gray-400" size={20} />
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
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTotalMembers = () => {
    return Object.values(membersByStatus).reduce((total, members) => total + members.length, 0)
  }

  const getResponseCount = () => {
    return membersByStatus.AVAILABLE.length + membersByStatus.UNAVAILABLE.length + membersByStatus.MAYBE.length
  }

  const filterMembers = (members) => {
    if (!memberSearchTerm.trim()) return members
    
    return members.filter(member => 
      member.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
    )
  }

  const handleViewMember = async (member) => {
    try {
      // Fetch detailed member information
      const memberDetails = await memberService.getMemberById(member.memberId)
      setSelectedMember(memberDetails)
      setShowMemberModal(true)
    } catch (error) {
      console.error('Error fetching member details:', error)
      toast.error('Failed to load member details')
    }
  }

  const handleViewMeeting = () => {
    if (selectedMeeting) {
      setShowMeetingModal(true)
    } else {
      toast.error('Meeting details not available')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Availability</h1>
          <p className="text-gray-600 mt-1">View member availability by meeting ID</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search by Meeting ID</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting ID
            </label>
            <input
              id="meetingId"
              type="number"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID (e.g., 1, 2, 3...)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search size={16} />
            )}
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <>
          {/* Meeting Info and Summary Cards */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting ID: {meetingId}
            </h2>
            {selectedMeeting && (
              <button
                onClick={handleViewMeeting}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Eye className="h-4 w-4" />
                <span>View Meeting Details</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={20} />
                <div className="text-sm font-medium text-green-700">Available</div>
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {membersByStatus.AVAILABLE.length}
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center space-x-2">
                <XCircle className="text-red-600" size={20} />
                <div className="text-sm font-medium text-red-700">Not Available</div>
              </div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {selectedMeeting?.unavailableMembersCount ?? membersByStatus.UNAVAILABLE.length}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <div className="text-sm font-medium text-yellow-700">Maybe</div>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {membersByStatus.MAYBE.length}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-600" size={20} />
                <div className="text-sm font-medium text-gray-700">Pending</div>
              </div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {membersByStatus.PENDING.length}
              </div>
            </div>
          </div>

          {/* Response Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Summary</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Response Rate: {getTotalMembers() > 0 ? Math.round((getResponseCount() / getTotalMembers()) * 100) : 0}%</span>
              <span>{getResponseCount()} of {getTotalMembers()} responded</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getTotalMembers() > 0 ? (getResponseCount() / getTotalMembers()) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Member Search Bar */}
          {getTotalMembers() > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {memberSearchTerm && (
                  <button
                    onClick={() => setMemberSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Member Lists by Status */}
          <div className="space-y-6">
            {Object.entries(membersByStatus)
              .filter(([_, members]) => members.length > 0)
              .map(([status, members]) => {
                const filteredMembers = filterMembers(members);
                return (
                  <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className={`px-6 py-4 border-b ${getStatusColor(status)}`}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {status.replace('_', ' ')} ({filteredMembers.length}{memberSearchTerm ? ` of ${members.length}` : ''})
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      {filteredMembers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          {memberSearchTerm ? 'No members match your search' : 'No members in this category'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredMembers.map((member, index) => (
                            <div key={member.memberId || member.email || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {member.name
                                  ?.split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {member.name || 'Unknown Member'}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {member.email || 'No email'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleViewMember(member)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-md transition-colors duration-200"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              <span>View</span>
                            </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {getTotalMembers() === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
              <p className="text-gray-500">
                No member availability data found for meeting ID {meetingId}.
              </p>
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Member Availability</h3>
          <p className="text-gray-500">
            Enter a meeting ID above to view member availability organized by status.
          </p>
        </div>
      )}

      {/* Member Detail Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Member Details</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedMember.name}</h4>
                  <p className="text-gray-600">Member ID: {selectedMember.memberId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-900">{selectedMember.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Contact:</span>
                    <span className="text-sm text-gray-900">{selectedMember.contact || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Gender:</span>
                    <span className="text-sm text-gray-900">{selectedMember.gender || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Age:</span>
                    <span className="text-sm text-gray-900">{selectedMember.age || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Date of Joining:</span>
                    <span className="text-sm text-gray-900">{selectedMember.doj || 'Not available'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Mentor ID:</span>
                    <span className="text-sm text-gray-900">{selectedMember.mentorId || 'No mentor assigned'}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">Address:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedMember.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Meeting Details</h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Meeting Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{selectedMeeting.meetingTheme}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Date:</span>
                    <span className="text-sm text-gray-900">{selectedMeeting.date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Time:</span>
                    <span className="text-sm text-gray-900">{selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Location:</span>
                    <span className="text-sm text-gray-900">{selectedMeeting.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Type:</span>
                    <span className="text-sm text-gray-900">{selectedMeeting.meetingType}</span>
                  </div>
                </div>
              </div>
              
              {/* Meeting Roles */}
              {selectedMeeting.meetingRoles && selectedMeeting.meetingRoles.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Meeting Roles</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {selectedMeeting.meetingRoles.map((meetingRole, index) => (
                        <div key={index} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {meetingRole.role?.roleName || 'Unknown Role'}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {meetingRole.role?.roleDescription || 'No description available'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Count: {meetingRole.count || 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Availability Summary */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Availability Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Response Rate</span>
                    <span className="text-sm font-bold text-gray-900">
                      {getTotalMembers() > 0 ? Math.round((getResponseCount() / getTotalMembers()) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${getTotalMembers() > 0 ? (getResponseCount() / getTotalMembers()) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {getResponseCount()} of {getTotalMembers()} members responded
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberAvailability

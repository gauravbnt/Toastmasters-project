import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import { roleAssignmentService } from '../../services/roleAssignmentService';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, Users, Zap, UserPlus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RoleAssignmentModal from '../../components/RoleAssignmentModal';
import { toast } from 'react-hot-toast';

const AdminAvailability = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  const [availableMembers, setAvailableMembers] = useState({});
  const [roleAssignments, setRoleAssignments] = useState({});
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetingsWithAvailability();
  }, []);

  const fetchMeetingsWithAvailability = async () => {
    try {
      setLoading(true);
      const meetingsData = await meetingService.getUpcomingMeetings();
      
      // Fetch availability summary for each meeting
      const meetingsWithAvailability = await Promise.all(
        meetingsData.map(async (meeting) => {
          try {
            const summary = await memberAvailabilityService.getAvailabilitySummary(meeting.meetingId);
            return {
              ...meeting,
              availabilitySummary: summary
            };
          } catch (error) {
            console.error(`Error fetching availability for meeting ${meeting.meetingId}:`, error);
            return {
              ...meeting,
              availabilitySummary: null
            };
          }
        })
      );

      setMeetings(meetingsWithAvailability);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async (meetingId) => {
    if (availableMembers[meetingId]) return; // Already fetched
    
    try {
      setLoadingMembers(prev => ({ ...prev, [meetingId]: true }));
      const memberStatuses = await memberAvailabilityService.getMemberStatuses(meetingId);
      const assignments = await roleAssignmentService.getMeetingRoleAssignments(meetingId);
      
      setAvailableMembers(prev => ({
        ...prev,
        [meetingId]: memberStatuses.AVAILABLE || []
      }));
      
      setRoleAssignments(prev => ({
        ...prev,
        [meetingId]: assignments || []
      }));
    } catch (error) {
      console.error(`Error fetching available members for meeting ${meetingId}:`, error);
      toast.error('Failed to load available members');
    } finally {
      setLoadingMembers(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  const handleAssignRoles = (member, meeting) => {
    setSelectedMember(member);
    setSelectedMeeting(meeting);
    setShowRoleModal(true);
  };

  const handleAssignmentComplete = () => {
    // Refresh the data for the selected meeting
    if (selectedMeeting) {
      delete availableMembers[selectedMeeting.meetingId];
      delete roleAssignments[selectedMeeting.meetingId];
      fetchAvailableMembers(selectedMeeting.meetingId);
    }
    setShowRoleModal(false);
    setSelectedMember(null);
    setSelectedMeeting(null);
  };

  const getAssignedRolesForMember = (memberId, meetingId) => {
    const assignments = roleAssignments[meetingId] || [];
    return assignments.filter(assignment => assignment.memberId === memberId);
  };

  const isMemberAssigned = (memberId, meetingId) => {
    const assignedRoles = getAssignedRolesForMember(memberId, meetingId);
    return assignedRoles.length > 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleMeetingDetails = (meetingId) => {
    setExpandedMeeting(expandedMeeting === meetingId ? null : meetingId);
    if (expandedMeeting !== meetingId) {
      fetchAvailableMembers(meetingId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'UNAVAILABLE':
        return 'bg-red-100 text-red-800';
      case 'MAYBE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'UNAVAILABLE':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'MAYBE':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Availability</h1>
        <p className="text-gray-600">View and manage member availability across all meetings</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {meetings.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No upcoming meetings found.
            </li>
          ) : (
            meetings.map((meeting) => (
              <li key={meeting.meetingId} className="border-b border-gray-200">
                <div 
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleMeetingDetails(meeting.meetingId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {meeting.title || 'Untitled Meeting'}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {formatDate(meeting.date)}
                        </div>
                        {meeting.location && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {meeting.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      {meeting.availabilitySummary && (
                        <div className="flex space-x-2">
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            {meeting.availabilitySummary.AVAILABLE || 0}
                          </div>
                          <div className="flex items-center text-sm text-yellow-600">
                            <AlertCircle className="h-5 w-5 mr-1" />
                            {meeting.availabilitySummary.MAYBE || 0}
                          </div>
                          <div className="flex items-center text-sm text-red-600">
                            <XCircle className="h-5 w-5 mr-1" />
                            {meeting.availabilitySummary.UNAVAILABLE || 0}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-5 w-5 mr-1" />
                            {meeting.availabilitySummary.PENDING || 0}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/role-assignment/${meeting.meetingId}`);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Assign Roles
                      </button>
                      <svg
                        className={`ml-2 h-5 w-5 text-gray-400 transform ${
                          expandedMeeting === meeting.meetingId ? 'rotate-180' : ''
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedMeeting === meeting.meetingId && (
                  <div className="px-4 py-4 sm:px-6 bg-gray-50">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Available Members</h3>
                      </div>
                      
                      {loadingMembers[meeting.meetingId] ? (
                        <div className="flex items-center justify-center py-4">
                          <LoadingSpinner size="md" />
                        </div>
                      ) : availableMembers[meeting.meetingId]?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {availableMembers[meeting.meetingId].map((member) => (
                            <div
                              key={member.memberId}
                              className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-indigo-600">
                                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.firstName} {member.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isMemberAssigned(member.memberId, meeting.meetingId) ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Assigned
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignRoles(member, meeting);
                                      }}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Assign
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {getAssignedRolesForMember(member.memberId, meeting.meetingId).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Assigned Roles:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {getAssignedRolesForMember(member.memberId, meeting.meetingId).map((assignment) => (
                                      <span
                                        key={assignment.assignmentId}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {assignment.roleName}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Users className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No available members</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            No members have marked themselves as available for this meeting.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {showRoleModal && selectedMember && selectedMeeting && (
        <RoleAssignmentModal
          member={selectedMember}
          meeting={selectedMeeting}
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedMember(null);
            setSelectedMeeting(null);
          }}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}
    </div>
  );
};

export default AdminAvailability;

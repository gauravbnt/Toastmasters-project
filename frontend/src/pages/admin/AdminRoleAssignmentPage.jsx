import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { memberService } from '../../services/memberService';
import { rolePreferenceService } from '../../services/rolePreferenceService';
import { memberRoleAssignService } from '../../services/memberRoleAssignService';
import { roleService } from '../../services/roleService';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import { assignRolesHelperService } from '../../services/assignRolesHelperService';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Users, 
  User, 
  Star,
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AdminRoleAssignmentPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [meetingRoles, setMeetingRoles] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPreferences, setMemberPreferences] = useState([]);
  const [memberPastRoles, setMemberPastRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [memberAssignments, setMemberAssignments] = useState([]); // Current role assignments for the meeting
  const [meetingPreferences, setMeetingPreferences] = useState([]); // All members' preferences for this meeting
  const [availableRolesForMeeting, setAvailableRolesForMeeting] = useState([]); // Available roles for this meeting
  const [memberAvailability, setMemberAvailability] = useState({}); // Real availability data for members
  const [availabilityStatuses, setAvailabilityStatuses] = useState({}); // Grouped availability by status
  const [roleFilter, setRoleFilter] = useState('all'); // Filter members by preferred role
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState('');
  const [assignRolesData, setAssignRolesData] = useState([]); // Consolidated data from assign roles helper

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      
      // Validate meetingId parameter
      if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
        console.error('Invalid meetingId parameter:', meetingId);
        toast.error('Invalid meeting ID. Please select a valid meeting.');
        navigate('/role-assignment');
        return;
      }
      
      console.log('Attempting to fetch meeting with ID:', meetingId, 'Type:', typeof meetingId);
      
      // Fetch meeting details
      const meetingData = await meetingService.getMeetingById(meetingId);
      setMeeting(meetingData);

      // Fetch available members for this meeting
      const membersData = await memberService.getActiveMembers();
      setAvailableMembers(membersData);

      // Fetch available roles for this meeting
      const rolesData = await roleService.getAllRoles();
      setMeetingRoles(rolesData);

      // Fetch all members' role preferences for this meeting
      const preferencesData = await rolePreferenceService.getMeetingRolePreferences(meetingId);
      setMeetingPreferences(preferencesData);
      console.log('Meeting preferences:', preferencesData);

      // Fetch available roles for this meeting
      const availableRolesData = await rolePreferenceService.getAvailableRolesForMeeting(meetingId);
      setAvailableRolesForMeeting(availableRolesData);
      console.log('Available roles for meeting:', availableRolesData);

      // Fetch member assignments for this meeting
      const assignmentsData = await memberRoleAssignService.getAssignmentsByMeeting(meetingId);
      setMemberAssignments(assignmentsData);
      console.log('Member assignments data:', assignmentsData);

      // Fetch consolidated role assignment data
      const assignRolesHelperData = await assignRolesHelperService.getAssignRolesData(meetingId);
      setAssignRolesData(assignRolesHelperData);
      console.log('Assign roles helper data:', assignRolesHelperData);

      // Fetch member availability data for this meeting
      const availabilityData = await memberAvailabilityService.getMemberStatuses(meetingId);
      setAvailabilityStatuses(availabilityData);
      console.log('Member availability data:', availabilityData);

      // Create member availability lookup object
      const availabilityLookup = {};
      Object.keys(availabilityData).forEach(status => {
        availabilityData[status].forEach(member => {
          availabilityLookup[member.memberId] = {
            status: status,
            name: member.name,
            email: member.email
          };
        });
      });
      setMemberAvailability(availabilityLookup);
      console.log('Member availability lookup:', availabilityLookup);

    } catch (error) {
      console.error('Error fetching meeting data:', error);
      toast.error('Failed to load meeting data');
      navigate('/admin/availability');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = async (member) => {
    try {
      setSelectedMember(member);
      
      // Fetch member's role preferences for this meeting
      const preferences = await rolePreferenceService.getRolePreferences(member.memberId, meetingId);
      setMemberPreferences(preferences);

      // Fetch member's past role assignments
      const pastAssignments = await memberRoleAssignService.getAssignmentsByMember(member.memberId);
      setMemberPastRoles(pastAssignments);

      // Reset selected roles
      setSelectedRoles([]);

    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load member data');
    }
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        // Limit to 2 roles maximum
        if (prev.length >= 2) {
          toast.error('Maximum 2 roles can be assigned to a member');
          return prev;
        }
        return [...prev, roleId];
      }
    });
  };

  const handleAssignRoles = async () => {
    if (!selectedMember || selectedRoles.length === 0) {
      toast.error('Please select a member and at least one role');
      return;
    }

    try {
      setAssigning(true);

      // Create assignments for each selected role
      const assignmentPromises = selectedRoles.map(roleId =>
        memberRoleAssignService.createAssignment({
          memberId: selectedMember.memberId,
          roleId: roleId,
          meetingId: meetingId,
        })
      );

      await Promise.all(assignmentPromises);

      toast.success('Roles assigned successfully!');
      
      // Reset selection
      setSelectedMember(null);
      setSelectedRoles([]);
      
      // Refresh data
      await fetchMeetingData();
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    } finally {
      setAssigning(false);
    }
  };

  const handleRoleAssignment = async () => {
    if (!selectedMember || selectedRoles.length === 0) {
      toast.error('Please select a member and at least one role');
      return;
    }

    try {
      setAssigning(true);

      // Create assignments for each selected role
      const assignmentPromises = selectedRoles.map(roleId =>
        memberRoleAssignService.createAssignment({
          memberId: selectedMember.memberId,
          roleId: roleId,
          meetingId: meetingId,
        })
      );

      await Promise.all(assignmentPromises);

      toast.success('Roles assigned successfully!');
      
      // Reset selection
      setSelectedMember(null);
      setSelectedRoles([]);
      
      // Refresh data
      await fetchMeetingData();
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignRoleClick = (member) => {
    setSelectedMemberForModal(member);
    setSelectedRoleForAssignment('');
    setIsModalOpen(true);
  };

  const handleModalRoleAssignment = async () => {
    if (!selectedMemberForModal || !selectedRoleForAssignment) {
      toast.error('Please select a role');
      return;
    }

    try {
      setAssigning(true);

      // Create assignment
      await memberRoleAssignService.createAssignment({
        memberId: selectedMemberForModal.memberId,
        roleId: parseInt(selectedRoleForAssignment),
        meetingId: meetingId,
      });

      toast.success('Role assigned successfully!');
      setIsModalOpen(false);
      setSelectedMemberForModal(null);
      setSelectedRoleForAssignment('');
      
      // Refresh data
      await fetchMeetingData();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAssigning(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemberForModal(null);
    setSelectedRoleForAssignment('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleName = (roleId) => {
    const role = meetingRoles.find(r => r.roleId === roleId);
    return role ? role.roleName : 'Unknown Role';
  };

  // Get member's preferences for this meeting
  const getMemberPreferences = (memberId) => {
    return meetingPreferences.filter(pref => pref.memberId === memberId);
  };

  // Check if a member is available for this meeting
  const isMemberAvailable = (memberId) => {
    const availability = memberAvailability[memberId];
    if (!availability) {
      // If no availability data, assume they are not available
      return false;
    }
    // Only AVAILABLE status members can be assigned roles
    return availability.status === 'AVAILABLE';
  };

  // Get member's availability status
  const getMemberAvailabilityStatus = (memberId) => {
    const availability = memberAvailability[memberId];
    return availability ? availability.status : 'UNKNOWN';
  };

  // Get availability status color and icon
  const getAvailabilityStatusInfo = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { color: 'green', icon: CheckCircle, text: 'Available' };
      case 'UNAVAILABLE':
        return { color: 'red', icon: XCircle, text: 'Unavailable' };
      case 'MAYBE':
        return { color: 'yellow', icon: AlertCircle, text: 'Maybe' };
      case 'PENDING':
        return { color: 'gray', icon: Clock, text: 'Pending' };
      default:
        return { color: 'gray', icon: AlertCircle, text: 'Unknown' };
    }
  };

  // Get available roles for this meeting (filtered from all roles)
  const getMeetingAvailableRoles = () => {
    if (availableRolesForMeeting.length > 0) {
      return availableRolesForMeeting;
    }
    // Fallback to all roles if meeting-specific roles not available
    return meetingRoles;
  };

  // Get member's preferred role names
  const getMemberPreferredRoleNames = (memberId) => {
    const preferences = getMemberPreferences(memberId);
    return preferences.map(pref => getRoleName(pref.roleId)).filter(name => name !== 'Unknown Role');
  };

  // Filter members based on selected role preference
  const getFilteredMembers = () => {
    if (roleFilter === 'all') {
      return availableMembers;
    }
    
    if (roleFilter === 'no-preference') {
      return availableMembers.filter(member => {
        const preferences = getMemberPreferences(member.memberId);
        return preferences.length === 0;
      });
    }
    
    return availableMembers.filter(member => {
      const preferences = getMemberPreferences(member.memberId);
      return preferences.some(pref => pref.roleId === parseInt(roleFilter));
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/availability')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Availability
          </button>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role Assignment</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Assign roles to members for this meeting
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-900">{meeting.title}</h2>
                <p className="text-sm text-gray-500">{formatDate(meeting.date)}</p>
                {meeting.location && (
                  <p className="text-sm text-gray-500">{meeting.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* All Members with Preferred Roles */}
          <div className="col-span-1">
            {/* Available Members Table */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Users className="h-5 w-5 inline mr-2" />
                  Available Members & Role Assignment
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pref 1
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pref 2
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pref 3
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assign Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {availableMembers
                        .filter(member => isMemberAvailable(member.memberId))
                        .map((member) => {
                          const preferredRoleNames = getMemberPreferredRoleNames(member.memberId);
                          const assignedRoles = memberAssignments
                            .filter(assignment => assignment.memberId === member.memberId)
                            .map(assignment => getRoleName(assignment.roleId));
                          
                          return (
                            <tr key={member.memberId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {member.memberId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {preferredRoleNames[0] || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {preferredRoleNames[1] || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {preferredRoleNames[2] || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {assignedRoles.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {assignedRoles.map((roleName, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {roleName}
                                      </span>
                                    ))}
                                    <button
                                      onClick={() => handleAssignRoleClick(member)}
                                      className="ml-2 text-indigo-600 hover:text-indigo-900 text-xs"
                                    >
                                      Change
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAssignRoleClick(member)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Assign Role
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Available Members by Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Users className="h-5 w-5 inline mr-2" />
                  Availability Status
                </h3>
                
                <div className="space-y-4">
                  {/* Available Members */}
                  {availabilityStatuses.AVAILABLE && availabilityStatuses.AVAILABLE.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Available ({availabilityStatuses.AVAILABLE.length})
                      </h4>
                      <div className="space-y-2">
                        {availabilityStatuses.AVAILABLE.map(availabilityMember => {
                          const member = availableMembers.find(m => m.memberId === availabilityMember.memberId);
                          if (!member) return null;
                          
                          const preferredRoleNames = getMemberPreferredRoleNames(member.memberId);
                          const statusInfo = getAvailabilityStatusInfo('AVAILABLE');
                          
                          return (
                            <button
                              key={member.memberId}
                              onClick={() => handleMemberSelect(member)}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                selectedMember?.memberId === member.memberId
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.firstName} {member.lastName}
                                    </p>
                                    <statusInfo.icon className={`h-4 w-4 text-${statusInfo.color}-500`} />
                                  </div>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                  {preferredRoleNames.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 mb-1">Preferred roles:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {preferredRoleNames.slice(0, 2).map((roleName, index) => (
                                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            {roleName}
                                          </span>
                                        ))}
                                        {preferredRoleNames.length > 2 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            +{preferredRoleNames.length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Maybe Available Members */}
                  {availabilityStatuses.MAYBE && availabilityStatuses.MAYBE.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Maybe Available ({availabilityStatuses.MAYBE.length})
                      </h4>
                      <div className="space-y-2">
                        {availabilityStatuses.MAYBE.map(availabilityMember => {
                          const member = availableMembers.find(m => m.memberId === availabilityMember.memberId);
                          if (!member) return null;
                          
                          const preferredRoleNames = getMemberPreferredRoleNames(member.memberId);
                          const statusInfo = getAvailabilityStatusInfo('MAYBE');
                          
                          return (
                            <button
                              key={member.memberId}
                              onClick={() => handleMemberSelect(member)}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                selectedMember?.memberId === member.memberId
                                  ? 'bg-yellow-50 border-yellow-200'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.firstName} {member.lastName}
                                    </p>
                                    <statusInfo.icon className={`h-4 w-4 text-${statusInfo.color}-500`} />
                                  </div>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                  {preferredRoleNames.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 mb-1">Preferred roles:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {preferredRoleNames.slice(0, 2).map((roleName, index) => (
                                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            {roleName}
                                          </span>
                                        ))}
                                        {preferredRoleNames.length > 2 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            +{preferredRoleNames.length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Unavailable Members */}
                  {availabilityStatuses.UNAVAILABLE && availabilityStatuses.UNAVAILABLE.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-1" />
                        Unavailable ({availabilityStatuses.UNAVAILABLE.length})
                      </h4>
                      <div className="space-y-2">
                        {availabilityStatuses.UNAVAILABLE.map(availabilityMember => {
                          const member = availableMembers.find(m => m.memberId === availabilityMember.memberId);
                          if (!member) return null;
                          
                          const preferredRoleNames = getMemberPreferredRoleNames(member.memberId);
                          const statusInfo = getAvailabilityStatusInfo('UNAVAILABLE');
                          
                          return (
                            <button
                              key={member.memberId}
                              onClick={() => handleMemberSelect(member)}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                selectedMember?.memberId === member.memberId
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.firstName} {member.lastName}
                                    </p>
                                    <statusInfo.icon className={`h-4 w-4 text-${statusInfo.color}-500`} />
                                  </div>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                  {preferredRoleNames.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 mb-1">Preferred roles:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {preferredRoleNames.slice(0, 2).map((roleName, index) => (
                                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            {roleName}
                                          </span>
                                        ))}
                                        {preferredRoleNames.length > 2 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            +{preferredRoleNames.length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pending Members */}
                  {availabilityStatuses.PENDING && availabilityStatuses.PENDING.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending ({availabilityStatuses.PENDING.length})
                      </h4>
                      <div className="space-y-2">
                        {availabilityStatuses.PENDING.map(availabilityMember => {
                          const member = availableMembers.find(m => m.memberId === availabilityMember.memberId);
                          if (!member) return null;
                          
                          const preferredRoleNames = getMemberPreferredRoleNames(member.memberId);
                          const statusInfo = getAvailabilityStatusInfo('PENDING');
                          
                          return (
                            <button
                              key={member.memberId}
                              onClick={() => handleMemberSelect(member)}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                selectedMember?.memberId === member.memberId
                                  ? 'bg-gray-50 border-gray-200'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.firstName} {member.lastName}
                                    </p>
                                    <statusInfo.icon className={`h-4 w-4 text-${statusInfo.color}-500`} />
                                  </div>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                  {preferredRoleNames.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 mb-1">Preferred roles:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {preferredRoleNames.slice(0, 2).map((roleName, index) => (
                                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            {roleName}
                                          </span>
                                        ))}
                                        {preferredRoleNames.length > 2 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                            +{preferredRoleNames.length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No availability data */}
                  {(!availabilityStatuses.AVAILABLE || availabilityStatuses.AVAILABLE.length === 0) &&
                   (!availabilityStatuses.MAYBE || availabilityStatuses.MAYBE.length === 0) &&
                   (!availabilityStatuses.UNAVAILABLE || availabilityStatuses.UNAVAILABLE.length === 0) &&
                   (!availabilityStatuses.PENDING || availabilityStatuses.PENDING.length === 0) && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No availability data found for this meeting</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Role to {selectedMemberForModal?.firstName} {selectedMemberForModal?.lastName}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role:
                </label>
                <select
                  id="role-select"
                  value={selectedRoleForAssignment}
                  onChange={(e) => setSelectedRoleForAssignment(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Choose a role...</option>
                  {getMeetingAvailableRoles().map(role => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMemberForModal && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Member Preferences:</h4>
                  <div className="text-sm text-gray-600">
                    {getMemberPreferredRoleNames(selectedMemberForModal.memberId).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {getMemberPreferredRoleNames(selectedMemberForModal.memberId).map((roleName, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {roleName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No preferences set</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalRoleAssignment}
                  disabled={assigning || !selectedRoleForAssignment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Assigning...
                    </div>
                  ) : (
                    'Assign Role'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoleAssignmentPage;

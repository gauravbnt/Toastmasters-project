import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { memberService } from '../../services/memberService';
import { rolePreferenceService } from '../../services/rolePreferenceService';
import { memberRoleAssignService } from '../../services/memberRoleAssignService';
import { roleService } from '../../services/roleService';
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
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      
      // Fetch meeting details
      const meetingData = await meetingService.getMeetingById(meetingId);
      setMeeting(meetingData);

      // Fetch available members for this meeting
      const membersData = await memberService.getActiveMembers();
      setAvailableMembers(membersData);

      // Fetch available roles for this meeting
      const rolesData = await roleService.getAllRoles();
      setMeetingRoles(rolesData);

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

      // Create assignment data
      const assignmentData = selectedRoles.map(roleId => ({
        meetingId: Number(meetingId),
        memberId: selectedMember.memberId,
        roleId: Number(roleId),
        assignedBy: 'ADMIN', // This should come from auth context
        assignedDate: new Date().toISOString().split('T')[0]
      }));

      // Assign roles
      await memberRoleAssignService.assignRoles(assignmentData);

      toast.success('Roles assigned successfully');
      
      // Reset selection
      setSelectedMember(null);
      setSelectedRoles([]);
      setMemberPreferences([]);
      setMemberPastRoles([]);

    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    } finally {
      setAssigning(false);
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Members */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Users className="h-5 w-5 inline mr-2" />
                  Available Members
                </h3>
                
                <div className="space-y-2">
                  {availableMembers.map(member => (
                    <button
                      key={member.memberId}
                      onClick={() => handleMemberSelect(member)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedMember?.memberId === member.memberId
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Member Details and Role Assignment */}
          <div className="lg:col-span-2">
            {selectedMember ? (
              <div className="space-y-6">
                {/* Selected Member Info */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      <User className="h-5 w-5 inline mr-2" />
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Role Preferences */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          <Star className="h-4 w-4 inline mr-1" />
                          Preferred Roles
                        </h4>
                        {memberPreferences.length > 0 ? (
                          <div className="space-y-2">
                            {memberPreferences.map(pref => (
                              <div key={pref.roleId} className="flex items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                                <Star className="h-4 w-4 text-yellow-600 mr-2" />
                                <span className="text-sm text-gray-700">{getRoleName(pref.roleId)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No role preferences set</p>
                        )}
                      </div>

                      {/* Past Roles */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Past Roles
                        </h4>
                        {memberPastRoles.length > 0 ? (
                          <div className="space-y-2">
                            {memberPastRoles.slice(0, 5).map(assignment => (
                              <div key={assignment.assignmentId} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm text-gray-700">{getRoleName(assignment.roleId)}</span>
                              </div>
                            ))}
                            {memberPastRoles.length > 5 && (
                              <p className="text-xs text-gray-500">+{memberPastRoles.length - 5} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No past role assignments</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Assign Roles (Select up to 2)
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {meetingRoles.map(role => (
                        <button
                          key={role.roleId}
                          onClick={() => handleRoleToggle(role.roleId)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            selectedRoles.includes(role.roleId)
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="text-sm font-medium">{role.roleName}</div>
                        </button>
                      ))}
                    </div>

                    {selectedRoles.length > 0 && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm font-medium text-indigo-700 mb-2">Selected Roles:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoles.map(roleId => (
                            <span key={roleId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {getRoleName(roleId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        onClick={handleAssignRoles}
                        disabled={assigning || selectedRoles.length === 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {assigning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Assign Roles
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Member</h3>
                  <p className="text-gray-500">Choose a member from the list to view their preferences and assign roles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleAssignmentPage;

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Star, Award, BarChart3, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { meetingService } from '../services/meetingService'
import { roleService } from '../services/roleService'
import { rolePreferenceService } from '../services/rolePreferenceService'
import memberAvailabilityService from '../services/memberAvailabilityService'
import memberRoleService from '../services/memberRoleService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { showWarning, showSuccess, showError } from '../utils/alerts'
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user } = useAuth() || {}
  const memberId = user?.memberId

  const [meetings, setMeetings] = useState([])
  const [myAvailability, setMyAvailability] = useState({})
  const [rolePreferences, setRolePreferences] = useState({})
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingFor, setSavingFor] = useState(null)

  const STATUS_OPTIONS = [
    { value: 'AVAILABLE', label: 'Available', icon: CheckCircle, color: 'green' },
    { value: 'UNAVAILABLE', label: 'Unavailable', icon: XCircle, color: 'red' },
    { value: 'MAYBE', label: 'Maybe', icon: AlertCircle, color: 'yellow' }
  ]

  const statusClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [meetingsResponse, availabilityResponse, rolesResponse] = 
          await Promise.allSettled([
            meetingService.getUpcomingMeetings(),
            memberAvailabilityService.getMemberAvailability(memberId),
            roleService.getAllRoles()
          ])
        
        setMeetings(meetingsResponse.status === 'fulfilled' ? meetingsResponse.value.data : [])
        setMyAvailability(availabilityResponse.status === 'fulfilled' ? availabilityResponse.value.data : {})
        setRoles(rolesResponse.status === 'fulfilled' ? rolesResponse.value.data : [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load some dashboard data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (memberId) {
      fetchData()
    }
  }, [memberId])

  const handleAvailabilityChange = async (meetingId, status) => {
    // Example of using showWarning
    const confirm = await showWarning(
      'Update Availability',
      `Are you sure you want to set your availability to ${status}?`,
      `Yes, set to ${status}`
    );
    
    if (!confirm.isConfirmed) {
      return; // User cancelled the action
    }
    if (!memberId) {
      console.error('No memberId available');
      showError('You must be logged in to update availability');
      return;
    }
    
    setSavingFor(meetingId);
    try {
      const payload = {
        memberId: parseInt(memberId, 10),
        meetingId: parseInt(meetingId, 10),
        avaStatus: status.toUpperCase()
      };
      
      console.log('Sending availability update with payload:', JSON.stringify(payload, null, 2));
      console.log('API Endpoint:', 'http://localhost:8080/availabilities/add');
      
      const response = await memberAvailabilityService.createAvailability(payload);
      
      console.log('Availability update successful. Response:', response);
      setMyAvailability(prev => ({ ...prev, [meetingId]: status }));
      await showSuccess('Success', `Your availability has been set to ${status}`);
    } catch (error) {
      console.error('Error updating availability:', {
        message: error.message,
        response: error.response?.data,
        status: error.status,
        data: error.data,
        details: error.details,
        fullError: error
      });
      
      // Format a more detailed error message
      let errorMessage = 'Failed to update availability';
      
      if (error.response?.data) {
        // Handle validation errors from the server
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.details) {
        // Handle client-side validation errors
        errorMessage = `Validation error: ${JSON.stringify(error.details)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingFor(null);
    }
  }


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md" role="alert">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome{user?.name ? `, ${user.name}` : ''}! Manage your availability and role preferences.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{meetings?.length || 0}</p>
              <p className="text-sm text-gray-600">Upcoming Meetings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Meetings</h2>
          
          {!meetings || meetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Meetings</h3>
              <p className="text-gray-500">There are no upcoming meetings scheduled at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const currentAvailability = myAvailability[meeting.meetingId];
                const currentRolePreferences = rolePreferences[meeting.meetingId] || [];
                
                return (
                  <div key={meeting.meetingId} className="border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <p className="text-gray-600 mt-1">{formatDate(meeting.date)}</p>
                        {meeting.description && (
                          <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {/* Mark Availability Button */}
                        <a
                          href={`/meetings/${meeting.meetingId}/mark-availability`}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {currentAvailability ? 'Update Availability' : 'Mark Availability'}
                        </a>
                        
                      </div>
                    </div>

                    {/* Status and Role Preferences Display */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Your Status:{" "}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentAvailability
                              ? currentAvailability.status === "AVAILABLE"
                                ? "bg-green-100 text-green-800"
                                : currentAvailability.status === "MAYBE"
                                ? "bg-yellow-100 text-yellow-800"
                                : currentAvailability.status === "UNAVAILABLE"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {currentAvailability && currentAvailability.status
                            ? currentAvailability.status.charAt(0) +
                              currentAvailability.status.slice(1).toLowerCase()
                            : "Not Responded"}
                        </span>
                      </h4>
                      
                      {currentRolePreferences.length > 0 && (
                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 text-indigo-600 mr-2" />
                            <h4 className="text-sm font-medium text-indigo-900">
                              Your Preferred Roles:
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {currentRolePreferences.map((roleId, index) => {
                              const role = roles?.find((r) => r.roleId === roleId);
                              return (
                                <div
                                  key={roleId}
                                  className="flex items-center bg-white border border-indigo-300 rounded-md px-3 py-2 shadow-sm"
                                >
                                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-2">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm text-indigo-900 font-medium">
                                    {role ? role.roleName : "..."}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {currentRolePreferences.length === 0 && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              No role preferences set
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default MemberDashboard;

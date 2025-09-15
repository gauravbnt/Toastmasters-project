import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Tag, UserCheck } from 'lucide-react';

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid meeting ID');
      }
      const data = await meetingService.getMeetingById(numericId);
      
      // Transform the roles data if needed
      const meetingData = {
        ...data,
        // Ensure roles is always an array
        meetingRoles: Array.isArray(data.roles) ? data.roles : []
      };
      
      setMeeting(meetingData);
    } catch (error) {
      console.error('Error loading meeting:', error);
      toast.error('Failed to load meeting details');
      navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center py-8">Loading meeting details...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Meeting not found</p>
        <Link to="/meetings" className="text-indigo-600 hover:text-indigo-800">
          Back to Meetings
        </Link>
      </div>
    );
  }

  const getMeetingTypeColor = (type) => {
    switch (type) {
      case 'REGULAR':
        return 'bg-blue-100 text-blue-800';
      case 'CONTEST':
        return 'bg-red-100 text-red-800';
      case 'SPECIAL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/meetings')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Meetings
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meeting.meetingTheme}</h1>
            <p className="text-sm text-gray-500 mt-1">Meeting ID: {meeting.meetingId}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/meetings/edit/${meeting.meetingId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit Meeting
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to={`/admin/role-assignment/${meeting.meetingId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Roles
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Details Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Meeting Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meeting Type */}
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Meeting Type</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMeetingTypeColor(meeting.meetingType)}`}>
                    {meeting.meetingType}
                  </span>
                </dd>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(meeting.date), 'EEEE, MMMM dd, yyyy')}
                </dd>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {meeting.startTime} - {meeting.endTime}
                </dd>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {meeting.location || 'Not specified'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Roles */}
      <div className="mt-8">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">Meeting Roles</h3>
        </div>
        {meeting.meetingRoles && meeting.meetingRoles.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Meeting Roles</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meeting.roles.map((role, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {role.roleName || 'Unknown Role'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {role.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-line">
                        {role.roleDescription || 'No description available'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No roles have been added to this meeting yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;

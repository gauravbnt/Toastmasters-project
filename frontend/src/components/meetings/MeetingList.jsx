import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Users, CheckCircle, XCircle, HelpCircle, Clock, Check, X, AlertCircle, Calendar, Play, Archive, List, Eye, MapPin, Tag, Search } from 'lucide-react';
import AvailabilityStatusModal from './AvailabilityStatusModal';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getAllMeetings();
      // Sort meetings by date (upcoming first, then by date)
      const sortedMeetings = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMeetings(sortedMeetings);
    } catch (err) {
      setError('Failed to load meetings');
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to categorize meetings
  const categorizeMeetings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    return meetings.reduce((acc, meeting) => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // Check if meeting is ongoing (today and within time range)
      const isToday = meetingDate.getTime() === today.getTime();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = meeting.startTime ? 
        parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0;
      const endTime = meeting.endTime ? 
        parseInt(meeting.endTime.split(':')[0]) * 60 + parseInt(meeting.endTime.split(':')[1]) : 1440;
      
      const isOngoing = isToday && currentTime >= startTime && currentTime <= endTime;
      
      if (isOngoing) {
        acc.ongoing.push(meeting);
      } else if (meetingDate.getTime() > today.getTime()) {
        acc.upcoming.push(meeting);
      } else if (meetingDate.getTime() < today.getTime()) {
        acc.previous.push(meeting);
      } else {
        // Today but not ongoing (either not started yet or already ended)
        if (currentTime < startTime) {
          acc.upcoming.push(meeting);
        } else {
          acc.previous.push(meeting);
        }
      }
      
      acc.all.push(meeting);
      return acc;
    }, { all: [], upcoming: [], ongoing: [], previous: [] });
  };

  const filterMeetings = (meetings) => {
    if (!searchTerm.trim()) return meetings;
    
    return meetings.filter(meeting => 
      meeting.meetingTheme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.meetingType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.meetingId?.toString().includes(searchTerm)
    );
  };

  const getFilteredMeetings = () => {
    const categorized = categorizeMeetings();
    const tabMeetings = categorized[activeTab] || [];
    const filtered = filterMeetings(tabMeetings);
    
    // Sort within each category
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (activeTab === 'previous') {
        // Previous meetings: newest first
        return dateB - dateA;
      } else {
        // Upcoming/ongoing: earliest first
        return dateA - dateB;
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await meetingService.deleteMeeting(id);
        toast.success('Meeting deleted successfully');
        loadMeetings();
      } catch (err) {
        toast.error('Failed to delete meeting');
      }
    }
  };

  const [availabilityCounts, setAvailabilityCounts] = useState({
    AVAILABLE: 0,
    UNAVAILABLE: 0,
    MAYBE: 0,
    PENDING: 0
  });

  const handleViewAvailability = async (meeting) => {
    try {
      setLoading(true);
      setSelectedMeeting(meeting);
      
      // Fetch the availability counts for this meeting
      const response = await memberAvailabilityService.getMemberStatuses(meeting.meetingId);
      
      // Calculate counts for each status
      const counts = {
        AVAILABLE: response.AVAILABLE?.length || 0,
        UNAVAILABLE: response.UNAVAILABLE?.length || 0,
        MAYBE: response.MAYBE?.length || 0,
        PENDING: response.PENDING?.length || 0
      };
      
      setAvailabilityCounts(counts);
      setShowAvailability(true);
    } catch (error) {
      console.error('Error loading availability counts:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMeeting = async (meeting) => {
    try {
      // Fetch complete meeting details
      const meetingDetails = await meetingService.getMeetingById(meeting.meetingId);
      setSelectedMeeting({
        ...meetingDetails,
        // Ensure roles is always an array
        roles: Array.isArray(meetingDetails.roles) ? meetingDetails.roles : []
      });
      setShowMeetingDetail(true);
    } catch (error) {
      console.error('Error loading meeting details:', error);
      toast.error('Failed to load meeting details');
    }
  };
  
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

  if (loading) return <div className="text-center py-8">Loading meetings...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  const categorized = categorizeMeetings();
  const filteredMeetings = getFilteredMeetings();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Meetings</h3>
        <Link
          to="add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Meeting
        </Link>
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMeetings.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
                const now = new Date();
                const meetingDate = new Date(meeting.date);
                const isToday = meetingDate.toDateString() === now.toDateString();
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const startTime = meeting.startTime ? 
                  parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0;
                const endTime = meeting.endTime ? 
                  parseInt(meeting.endTime.split(':')[0]) * 60 + parseInt(meeting.endTime.split(':')[1]) : 1440;
                const isOngoing = isToday && currentTime >= startTime && currentTime <= endTime;

                return (
                  <tr key={meeting.meetingId} className={`hover:bg-gray-50 ${isOngoing ? 'bg-green-50 border-l-4 border-green-400' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{meeting.meetingTheme}</div>
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
                      {meeting.startTime} - {meeting.endTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {meeting.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (meeting.meetingType === 'REGULAR' && 'bg-blue-100 text-blue-800') ||
                      (meeting.meetingType === 'CONTEST' && 'bg-red-100 text-red-800') ||
                      (meeting.meetingType === 'SPECIAL' && 'bg-purple-100 text-purple-800') ||
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {meeting.meetingType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewMeeting(meeting)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-md transition-colors duration-200"
                    title="View Meeting Details"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleViewAvailability(meeting)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="View Member Availability"
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Availability
                  </button>
                  <Link
                    to={`edit/${meeting.meetingId}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800 rounded-md transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(meeting.meetingId)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-md transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Availability Status Modal */}
      {selectedMeeting && (
        <AvailabilityStatusModal
          isOpen={showAvailability}
          onClose={() => setShowAvailability(false)}
          meetingId={selectedMeeting.meetingId}
          meetingTheme={selectedMeeting.meetingTheme}
          initialCounts={availabilityCounts}
        />
      )}

      {/* Meeting Detail Modal */}
      {showMeetingDetail && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.meetingTheme}</h2>
                <button
                  onClick={() => setShowMeetingDetail(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <p className="text-gray-900">
                      {new Date(selectedMeeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      <br />
                      {selectedMeeting.startTime} - {selectedMeeting.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-900">{selectedMeeting.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Meeting Type</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMeetingTypeColor(selectedMeeting.meetingType)}`}>
                      {selectedMeeting.meetingType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Roles</h3>
                {console.log('Selected meeting roles:', selectedMeeting.roles)}
                {selectedMeeting.roles && selectedMeeting.roles.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Count
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedMeeting.roles.map((role, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {role.roleName || 'Unknown Role'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {role.count}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-500 whitespace-pre-line">
                                {role.roleDescription || 'No description available'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No roles have been added to this meeting.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMeetingDetail(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <Link
                  to={`/meetings/edit/${selectedMeeting.meetingId}`}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit Meeting
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingList;

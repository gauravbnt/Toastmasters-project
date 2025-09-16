import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingService } from '../services/meetingService';
import memberAvailabilityService from '../services/memberAvailabilityService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Users, CheckCircle, XCircle, HelpCircle, Clock, Check, X, AlertCircle, Calendar, Play, Archive, List, Eye, MapPin, Tag, Search } from 'lucide-react';

const MemberMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Meetings</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          View all meetings and mark your availability
        </p>
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
              filteredMeetings.map((meeting) => (
                <tr key={meeting.meetingId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{meeting.meetingTheme}</div>
                    <div className="text-sm text-gray-500">ID: {meeting.meetingId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {meeting.startTime || 'N/A'} - {meeting.endTime || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {meeting.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMeetingTypeColor(meeting.meetingType)}`}>
                      <Tag className="h-3 w-3 mr-1" />
                      {meeting.meetingType || 'REGULAR'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/meetings/${meeting.meetingId}/mark-availability`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Availability
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberMeetings;

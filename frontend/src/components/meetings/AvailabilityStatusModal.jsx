import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Clock, HelpCircle, Users } from 'lucide-react';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status, count }) => {
  const statusConfig = {
    AVAILABLE: { color: 'bg-green-100 text-green-800', icon: <Check className="h-4 w-4" /> },
    UNAVAILABLE: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
    MAYBE: { color: 'bg-yellow-100 text-yellow-800', icon: <HelpCircle className="h-4 w-4" /> },
    PENDING: { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" /> }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status]?.color || 'bg-gray-100'}`}>
      {statusConfig[status]?.icon || null}
      <span className="ml-1">{status.replace('_', ' ')}: {count}</span>
    </div>
  );
};

const MemberStatusItem = ({ member, status }) => {
  const statusColors = {
    AVAILABLE: 'bg-green-50 border-green-200',
    UNAVAILABLE: 'bg-red-50 border-red-200',
    MAYBE: 'bg-yellow-50 border-yellow-200',
    PENDING: 'bg-gray-50 border-gray-200'
  };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[status] || 'bg-gray-50'} mb-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {member.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
            <p className="text-xs text-gray-500">{member.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AvailabilityStatusModal = ({ isOpen, onClose, meetingId, meetingTheme, initialCounts }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [membersByStatus, setMembersByStatus] = useState({
    AVAILABLE: [],
    UNAVAILABLE: [],
    MAYBE: [],
    PENDING: []
  });

  useEffect(() => {
    if (isOpen && meetingId) {
      loadMemberStatuses();
    }
  }, [isOpen, meetingId]);

  const loadMemberStatuses = async () => {
    if (!meetingId) {
      console.error('No meeting ID provided for availability check');
      setError('No meeting ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading member statuses for meeting ID:', meetingId, 'Type:', typeof meetingId);
      
      // Ensure meetingId is in the correct format
      let processedMeetingId = meetingId;
      if (typeof meetingId === 'string') {
        // Extract numeric part if it's a string with a numeric ID
        const numericMatch = meetingId.match(/\d+/);
        if (numericMatch) {
          processedMeetingId = parseInt(numericMatch[0], 10);
          console.log('Extracted numeric meeting ID:', processedMeetingId);
        }
      }
      
      const data = await memberAvailabilityService.getMemberStatuses(processedMeetingId);
      
      // Ensure we have all expected statuses
      const defaultStatuses = {
        AVAILABLE: [],
        UNAVAILABLE: [],
        MAYBE: [],
        PENDING: []
      };
      
      setMembersByStatus({
        ...defaultStatuses,
        ...data
      });
    } catch (error) {
      console.error('Error loading member statuses:', error);
      setError('Failed to load member statuses. Please try again.');
      toast.error('Failed to load member statuses');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const counts = initialCounts || {
    AVAILABLE: membersByStatus.AVAILABLE.length,
    UNAVAILABLE: membersByStatus.UNAVAILABLE.length,
    MAYBE: membersByStatus.MAYBE.length,
    PENDING: membersByStatus.PENDING.length
  };

  const totalResponses = counts.AVAILABLE + counts.UNAVAILABLE + counts.MAYBE;
  const totalMembers = Object.values(membersByStatus).reduce(
    (sum, members) => sum + members.length, 0
  );

  const displayMembers = activeTab === 'ALL' 
    ? Object.entries(membersByStatus).flatMap(([status, members]) => 
        members.map(member => ({ ...member, status })))
    : membersByStatus[activeTab]?.map(member => ({ ...member, status: activeTab })) || [];

  const sortedMembers = [...displayMembers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {meetingTheme || 'Meeting'} Availability
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                activeTab === 'ALL' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>All ({totalMembers})</span>
            </button>
            
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  activeTab === status 
                    ? status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      status === 'UNAVAILABLE' ? 'bg-red-100 text-red-800' :
                      status === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'AVAILABLE' && <Check className="h-3.5 w-3.5 mr-1" />}
                {status === 'UNAVAILABLE' && <X className="h-3.5 w-3.5 mr-1" />}
                {status === 'MAYBE' && <HelpCircle className="h-3.5 w-3.5 mr-1" />}
                {status === 'PENDING' && <Clock className="h-3.5 w-3.5 mr-1" />}
                <span>{status.charAt(0) + status.slice(1).toLowerCase()} ({count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-2">
              {sortedMembers.length > 0 ? (
                sortedMembers.map((member) => (
                  <MemberStatusItem 
                    key={`${member.id || member.memberId}-${member.status}`} 
                    member={member} 
                    status={member.status} 
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No members found with status: {activeTab === 'ALL' ? 'All' : activeTab.toLowerCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityStatusModal;

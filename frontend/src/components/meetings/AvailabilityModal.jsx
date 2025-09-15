import React, { useState, useEffect } from 'react';
import { X, Users, Check } from 'lucide-react';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import { toast } from 'react-hot-toast';

const AvailabilityModal = ({ isOpen, onClose, meetingId, meetingTheme }) => {
  const [loading, setLoading] = useState(true);
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    if (isOpen && meetingId) {
      loadAvailableMembers();
    }
  }, [isOpen, meetingId]);

  const loadAvailableMembers = async () => {
    try {
      setLoading(true);
      const data = await memberAvailabilityService.getAvailableMembers(meetingId);
      setAvailableMembers(data);
    } catch (error) {
      toast.error('Failed to load available members');
      console.error('Error loading available members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">
            Available Members - {meetingTheme}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : availableMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members have marked themselves as available for this meeting.
            </div>
          ) : (
            <div className="space-y-2">
              {availableMembers.map((member) => (
                <div
                  key={member.memberId}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-medium">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {member.name}
                      </h4>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm">Available</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;

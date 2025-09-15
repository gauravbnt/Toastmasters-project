import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { meetingService } from '../services/meetingService';
import memberAvailabilityService from '../services/memberAvailabilityService';
import RolePreferenceSelector from '../components/meetings/RolePreferenceSelector';
import { useAuth } from '../context/AuthContext';

const MarkAvailability = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rolePreferences, setRolePreferences] = useState([]);
  
  // Get member ID from auth context
  const memberId = user?.memberId;

  // Fetch meeting details and current availability status
  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated and has a member ID
      if (!user || !memberId) {
        toast.error('Please log in to access this page');
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Get meeting details
        const meetingData = await meetingService.getMeetingById(meetingId);
        setMeeting(meetingData);
        
        // Get current availability status if exists
        try {
          const availability = await memberAvailabilityService.getMemberAvailability(memberId);
          const currentAvailability = availability.find(avail => 
            avail.meetingId.toString() === meetingId
          );
          
          if (currentAvailability) {
            setSelectedStatus(currentAvailability.status);
            
            // Load existing role preferences if available
            const preferences = await memberAvailabilityService.getRolePreferences(
              memberId,
              meetingId
            );
            setRolePreferences(preferences);
          }
        } catch (error) {
          console.error('Error fetching current availability:', error);
        }
      } catch (error) {
        console.error('Error loading meeting details:', error);
        toast.error('Failed to load meeting details');
        navigate('/member-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId, memberId, navigate, user]);

  const handleStatusChange = (status) => {
    setSelectedStatus(selectedStatus === status ? '' : status);
  };

  const handleRolePreferencesChange = (preferences) => {
    setRolePreferences(preferences);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated and has a member ID
    if (!user || !memberId) {
      toast.error('Please log in to update your availability');
      navigate('/login');
      return;
    }
    
    if (!selectedStatus) {
      toast.error('Please select your availability status');
      return;
    }
    
    try {
      setSaving(true);
      
      // Save availability
      await memberAvailabilityService.createAvailability({
        memberId: Number(memberId),
        meetingId: Number(meetingId),
        avaStatus: selectedStatus
      });
      
      // Save role preferences if available
      if (selectedStatus === 'AVAILABLE' && rolePreferences.length > 0) {
        await memberAvailabilityService.saveRolePreferences(
          memberId,
          meetingId,
          rolePreferences
        );
      }
      
      toast.success('Availability updated successfully!');
      navigate('/member-dashboard');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(error.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Meeting not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Mark Your Availability</h1>
          <p className="mt-1 text-gray-600">
            For meeting: <span className="font-medium">{meeting.title}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(meeting.meetingDate).toLocaleDateString()} • {meeting.location}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Are you available for this meeting?
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange('AVAILABLE')}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    selectedStatus === 'AVAILABLE'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Available</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleStatusChange('MAYBE')}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    selectedStatus === 'MAYBE'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Maybe</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleStatusChange('UNAVAILABLE')}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    selectedStatus === 'UNAVAILABLE'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>Not Available</span>
                </button>
              </div>
            </div>
            
            {selectedStatus === 'AVAILABLE' && (
              <div className="mt-6">
                <RolePreferenceSelector
                  meetingId={meetingId}
                  memberId={memberId}
                  onPreferencesChange={handleRolePreferencesChange}
                  initialPreferences={rolePreferences}
                />
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/member-dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedStatus || saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    Save Availability
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAvailability;

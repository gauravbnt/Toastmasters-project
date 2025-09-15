import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import api from '../../services/api';

const RolePreferenceSelector = ({
  meetingId,
  memberId,
  onPreferencesChange,
  initialPreferences = []
}) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchMeetingRoles = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch available roles for the meeting using the service
        const roles = await memberAvailabilityService.getAvailableRolesForMeeting(meetingId);
        
        if (roles && roles.length > 0) {
          // The roles are already formatted correctly from the service, just use them directly
          const formattedRoles = roles
            .filter(role => role.roleId) // Filter out roles with undefined/null IDs
            .map(role => ({
              roleId: role.roleId,
              roleName: role.roleName || `Role ${role.roleId}`,
              roleDescription: role.roleDescription || ''
            }));
          
          if (formattedRoles.length === 0) {
            setError('No valid roles available for this meeting');
            setAvailableRoles([]);
          } else {
            setAvailableRoles(formattedRoles);
          }
        } else {
          setError('No roles available for this meeting');
          setAvailableRoles([]);
        }
      } catch (err) {
        console.error('Error fetching meeting roles:', err);
        setError('Failed to load meeting roles. Please try again.');
        setAvailableRoles([]);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingRoles();
    }
  }, [meetingId]);

  const validatePreferences = (prefs) => {
    if (prefs.length < 1) {
      setValidationError('Please select at least 1 role preference');
      return false;
    }
    if (prefs.length > 3) {
      setValidationError('Please select at most 3 role preferences');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAddPreference = () => {
    if (!selectedRole) return;
    
    // Check if maximum limit reached
    if (preferences.length >= 3) {
      setError('You can select at most 3 role preferences');
      return;
    }
    
    const role = availableRoles.find(r => r.roleId && r.roleId.toString() === selectedRole);
    if (!role) {
      setError('Selected role not found');
      return;
    }

    // Check if role is already in preferences
    if (preferences.some(p => p.roleId && p.roleId.toString() === selectedRole)) {
      setError('This role is already in your preferences');
      return;
    }

    const newPreference = {
      roleId: role.roleId,
      roleName: role.roleName,
      preferenceOrder: preferences.length + 1
    };

    const updatedPreferences = [...preferences, newPreference];
    setPreferences(updatedPreferences);
    onPreferencesChange(updatedPreferences);
    validatePreferences(updatedPreferences);
    setSelectedRole('');
    setError('');
  };

  const handleRemovePreference = (roleId) => {
    const updatedPreferences = preferences
      .filter(p => p.roleId !== roleId)
      .map((p, index) => ({
        ...p,
        preferenceOrder: index + 1
      }));
    
    setPreferences(updatedPreferences);
    onPreferencesChange(updatedPreferences);
    validatePreferences(updatedPreferences);
  };

  const movePreference = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === preferences.length - 1)
    ) {
      return; // Can't move first item up or last item down
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedPreferences = [...preferences];
    
    // Swap the preference order
    const temp = updatedPreferences[index].preferenceOrder;
    updatedPreferences[index].preferenceOrder = updatedPreferences[newIndex].preferenceOrder;
    updatedPreferences[newIndex].preferenceOrder = temp;
    
    // Sort by preference order
    updatedPreferences.sort((a, b) => a.preferenceOrder - b.preferenceOrder);
    
    setPreferences(updatedPreferences);
    onPreferencesChange(updatedPreferences);
  };

  if (loading) {
    return <div className="text-gray-500">Loading available roles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Role Preferences</h3>
          <p className="text-sm text-gray-500">
            Select 1 to 3 roles in order of preference.
            {preferences.length > 0 && ` (${preferences.length}/3 selected)`}
          </p>
        </div>
        {validationError && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {validationError}
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={preferences.length >= 3}
          className="flex-1 min-w-0 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option key="select-default" value="">Select a role...</option>
          {availableRoles
            .filter(role => !preferences.some(p => p.roleId === role.roleId))
            .map((role, index) => (
              <option key={`available-${role.roleId || index}`} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={handleAddPreference}
          disabled={!selectedRole || preferences.length >= 3}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-2">
        {preferences.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No role preferences selected</p>
        ) : (
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {preferences.map((pref, index) => (
              <li key={`pref-${pref.roleId || index}-${index}`} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                  <span className="text-gray-500 w-6">{index + 1}.</span>
                  <span className="ml-2 flex-1 w-0 truncate">
                    {pref.roleName}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => movePreference(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none disabled:opacity-30 rounded-full hover:bg-indigo-50"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePreference(index, 'down')}
                    disabled={index === preferences.length - 1}
                    className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none disabled:opacity-30 rounded-full hover:bg-indigo-50"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePreference(pref.roleId)}
                    className="text-red-400 hover:text-red-500 focus:outline-none"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RolePreferenceSelector;

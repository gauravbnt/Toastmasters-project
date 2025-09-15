import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { roleService } from '../../services/roleService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Minus, X } from 'lucide-react';

const MeetingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleCount, setRoleCount] = useState(1);
  const [meeting, setMeeting] = useState({
    meetingId: 0,
    meetingTheme: '',
    meetingType: 'REGULAR',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '17:30',
    endTime: '19:30',
    location: ''
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getAllRoles();
        setAvailableRoles(data);
      } catch (error) {
        console.error('Error loading roles:', error);
        toast.error('Failed to load roles');
      }
    };

    fetchRoles();

    if (id) loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const numericId = Number(id);
      if (isNaN(numericId)) throw new Error('Invalid meeting ID');

      const data = await meetingService.getMeetingById(numericId);

      const formattedRoles = data.roles?.map(r => ({
        roleId: Number(r.roleId),
        roleName: r.roleName,
        count: r.count || 1
      })) || [];

      setRoles(formattedRoles);

      setMeeting({
        meetingId: Number(data.meetingId),
        meetingTheme: data.meetingTheme || '',
        meetingType: data.meetingType || 'REGULAR',
        date: format(new Date(data.date), 'yyyy-MM-dd'),
        startTime: data.startTime || '17:30',
        endTime: data.endTime || '19:30',
        location: data.location || ''
      });

    } catch (err) {
      toast.error('Failed to load meeting');
      navigate('..');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeeting(prev => ({
      ...prev,
      [name]: name === 'meetingId' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleAddRole = () => {
    if (!selectedRole || roleCount < 1) return;

    const roleExists = roles.find(r => Number(r.roleId) === Number(selectedRole));
    if (roleExists) {
      setRoles(roles.map(r =>
        String(r.roleId) === String(selectedRole)
          ? { ...r, count: r.count + roleCount }
          : r
      ));
    } else {
      const role = availableRoles.find(r => Number(r.roleId) === Number(selectedRole));
      if (role) {
        setRoles([...roles, { 
          ...role, 
          roleId: Number(role.roleId), // Ensure consistent type
          count: roleCount,
          roleName: role.roleName // Ensure role name is included
        }]);
      }
    }

    setSelectedRole('');
    setRoleCount(1);
  };

  const handleRemoveRole = (roleId) => {
    setRoles(roles.filter(r => r.roleId !== roleId));
  };

  const handleUpdateRoleCount = (roleId, newCount) => {
    if (newCount < 1) return;
    setRoles(roles.map(r =>
      r.roleId === roleId ? { ...r, count: newCount } : r
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!meeting.meetingType || !meeting.date || !meeting.startTime || !meeting.endTime) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (roles.length === 0) {
        toast.error('Please add at least one role');
        setLoading(false);
        return;
      }

      console.log('Current roles state:', roles);
      const rolesPayload = roles.map(role => {
        const roleId = String(role.roleId).trim();
        if (!roleId) {
          console.error('Invalid role ID found:', role);
          return null;
        }
        return {
          roleId: roleId,
          count: Math.max(1, Number(role.count) || 1)
        };
      }).filter(Boolean); // Remove any null entries

      if (rolesPayload.length === 0) {
        toast.error('No valid roles to add');
        setLoading(false);
        return;
      }

     // Helper to normalize time to HH:mm:ss
  const normalizeTime = (time) => {
      if (!time) return null;
      const parts = time.split(':');
      if (parts.length === 3) return time;       // already HH:mm:ss
      if (parts.length === 2) return `${time}:00`; // add seconds if HH:mm
      return time; // fallback
  };

  const payload = {
    meetingTheme: meeting.meetingTheme ? meeting.meetingTheme.trim() : null,
    meetingType: meeting.meetingType,
    date: meeting.date,
    startTime: normalizeTime(meeting.startTime),
    endTime: normalizeTime(meeting.endTime),
    location: meeting.location ? meeting.location.trim() : null,
    roles: rolesPayload,
    unavailableMembersCount: 0
  };

      if (id) {
        await meetingService.updateMeeting(Number(id), payload);
        toast.success('Meeting updated successfully');
      } else {
        await meetingService.createMeeting(payload);
        toast.success('Meeting created successfully');
      }

      navigate('/meetings');
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast.error(error.message || 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div className="text-center py-8">Loading meeting data...</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Add New'} Meeting</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {id && (
            <div>
              <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700">
                Meeting ID
              </label>
              <input
                type="text"
                id="meetingId"
                name="meetingId"
                value={meeting.meetingId}
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                disabled
              />
            </div>
          )}
          <div>
            <label htmlFor="meetingTheme" className="block text-sm font-medium text-gray-700">
              Meeting Theme 
            </label>
            <input
              type="text"
              id="meetingTheme"
              name="meetingTheme"
              value={meeting.meetingTheme}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Meeting Roles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="roleSelect"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="roleCount" className="block text-sm font-medium text-gray-700">
                Count
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button type="button" onClick={() => setRoleCount(Math.max(1, roleCount - 1))} className="px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                  <Minus className="h-4 w-4" />
                </button>
                <input type="number" id="roleCount" min="1" value={roleCount} onChange={(e) => setRoleCount(parseInt(e.target.value) || 1)} className="block w-full border-t border-b border-gray-300 py-2 px-3 text-center" />
                <button type="button" onClick={() => setRoleCount(roleCount + 1)} className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button type="button" onClick={handleAddRole} disabled={!selectedRole} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add Role
              </button>
            </div>
          </div>

          {roles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Roles</h4>
              <ul className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <li key={role.roleId} className="px-4 py-3 flex items-center justify-between">
                    <span>{role.roleName}</span>
                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={() => handleUpdateRoleCount(role.roleId, role.count - 1)}><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center">{role.count}</span>
                      <button type="button" onClick={() => handleUpdateRoleCount(role.roleId, role.count + 1)}><Plus className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleRemoveRole(role.roleId)}><X className="h-4 w-4 text-red-600" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700">Meeting Type *</label>
            <select id="meetingType" name="meetingType" value={meeting.meetingType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required>
              <option value="REGULAR">Regular Meeting</option>
              <option value="CONTEST">Contest</option>
              <option value="SPECIAL">Special Meeting</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
            <input type="date" id="date" name="date" value={meeting.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time *</label>
            <input type="time" id="startTime" name="startTime" value={meeting.startTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time *</label>
            <input type="time" id="endTime" name="endTime" value={meeting.endTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id="location" name="location" value={meeting.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {id ? 'Update' : 'Create'} Meeting
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;

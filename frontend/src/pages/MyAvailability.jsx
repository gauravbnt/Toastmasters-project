import React, { useEffect, useMemo, useState } from 'react'
import { Settings, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import memberAvailabilityService from '../services/memberAvailabilityService'
import { meetingService } from '../services/meetingService'
import RolePreferences from '../components/RolePreferences'
import { toast } from 'react-hot-toast'

const STATUS = ['AVAILABLE', 'UNAVAILABLE', 'MAYBE']

const MyAvailability = () => {
  const { user } = useAuth() || {}
  const memberId = user?.memberId

  const [meetings, setMeetings] = useState([])
  const [myAvail, setMyAvail] = useState({}) // meetingId -> avaStatus
  const [loading, setLoading] = useState(false)
  const [savingFor, setSavingFor] = useState(null) // meetingId
  const [showRolePreferences, setShowRolePreferences] = useState(false)
  const [selectedMeetingForPrefs, setSelectedMeetingForPrefs] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!memberId) return
      setLoading(true)
      try {
        const [meetingsData, availabilityData] = await Promise.all([
          meetingService.getUpcomingMeetings(),
          memberAvailabilityService.getAllAvailabilities()
        ])
        
        setMeetings(meetingsData)
        const mine = {}
        for (const a of availabilityData) {
          if (Number(a.memberId) === Number(memberId)) {
            mine[a.meetingId] = a.avaStatus
          }
        }
        setMyAvail(mine)
      } catch (e) {
        toast.error('Failed to load meetings or availability')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [memberId])

  const handleSetStatus = async (meetingId, avaStatus) => {
    if (!memberId) return
    setSavingFor(meetingId)
    try {
      await memberAvailabilityService.createAvailability({
        memberId: parseInt(memberId),
        meetingId: parseInt(meetingId),
        avaStatus
      })
      setMyAvail((prev) => ({ ...prev, [meetingId]: avaStatus }))
      toast.success('Availability updated')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update availability')
    } finally {
      setSavingFor(null)
    }
  }

  const handleOpenRolePreferences = (meetingId) => {
    setSelectedMeetingForPrefs(meetingId)
    setShowRolePreferences(true)
  }

  const handleCloseRolePreferences = () => {
    setShowRolePreferences(false)
    setSelectedMeetingForPrefs(null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">My Availability</h1>

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Preferences</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm text-gray-500">No meetings found</td>
                  </tr>
                )}
                {meetings.map((m) => (
                  <tr key={m.meetingId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{m.title || `Meeting ${m.meetingId}`}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{m.date ? new Date(m.date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="inline-flex gap-2">
                        {STATUS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSetStatus(m.meetingId, s)}
                            className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                              myAvail[m.meetingId] === s
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } ${savingFor === m.meetingId ? 'opacity-70 cursor-wait' : ''}`}
                            disabled={savingFor === m.meetingId}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleOpenRolePreferences(m.meetingId)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Set Preferences
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Preferences Modal */}
      {showRolePreferences && selectedMeetingForPrefs && (
        <RolePreferences
          memberId={memberId}
          meetingId={selectedMeetingForPrefs}
          onClose={handleCloseRolePreferences}
        />
      )}
    </div>
  )
}

export default MyAvailability

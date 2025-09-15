import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, FileText, Clock, TrendingUp, X, User, Mail, Phone } from 'lucide-react'
import { memberService } from '../services/memberService'
import { meetingService } from '../services/meetingService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    upcomingMeetings: 0,
    todaysMeetings: 0,
    totalAgendaItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [todaysMeetings, setTodaysMeetings] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [showActiveMembers, setShowActiveMembers] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [membersRes, upcomingRes, todaysRes] = await Promise.allSettled([
        memberService.getAllMembers(),
        meetingService.getUpcomingMeetings(),
        meetingService.getTodaysMeetings()
      ])

      const members = membersRes.status === 'fulfilled' ? membersRes.value : []
      const upcomingMeetings = upcomingRes.status === 'fulfilled' ? upcomingRes.value : []
      const todaysData = todaysRes.status === 'fulfilled' ? todaysRes.value : []

      if (membersRes.status === 'rejected') {
        console.error('Failed to fetch members:', membersRes.reason)
      }
      if (upcomingRes.status === 'rejected') {
        console.error('Failed to fetch upcoming meetings:', upcomingRes.reason)
      }
      if (todaysRes.status === 'rejected') {
        console.error("Failed to fetch today's meetings:", todaysRes.reason)
      }

      const hasIsActive = members.length > 0 && Object.prototype.hasOwnProperty.call(members[0], 'isActive')
      const activeMembers = hasIsActive ? members.filter(m => m.isActive) : members

      setStats({
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        upcomingMeetings: upcomingMeetings.length,
        todaysMeetings: todaysData.length,
        totalAgendaItems: 0
      })

      setTodaysMeetings(todaysData)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleActiveMembersClick = async () => {
    try {
      setLoading(true)
      const members = await memberService.getActiveMembers()
      setActiveMembers(members)
      setShowActiveMembers(true)
    } catch (error) {
      console.error('Error fetching active members:', error)
      toast.error('Failed to load active members')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      to: '/members'
    },
    {
      title: 'Active Members',
      value: stats.activeMembers,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: handleActiveMembersClick
    },
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingMeetings,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      to: '/meetings'
    },
    {
      title: "Today's Meetings",
      value: stats.todaysMeetings,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      to: '/meetings'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Active Members Modal */}
      <AnimatePresence>
        {showActiveMembers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Active Members ({activeMembers.length})</h2>
                <button onClick={() => setShowActiveMembers(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                {activeMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No active members found</div>
                ) : (
                  <div className="grid gap-4">
                    {activeMembers.map((member) => (
                      <div key={member.memberId} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {member.email}
                            </p>
                            {member.contact && (
                              <p className="text-sm text-gray-500 truncate flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {member.contact}
                              </p>
                            )}
                          </div>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowActiveMembers(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Content */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Toastmasters Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.button
              type="button"
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.onClick ? stat.onClick : () => navigate(stat.to)}
              className={`card ${stat.bgColor} border-none text-left hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Today's Meetings */}
        {todaysMeetings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Meetings</h2>
            <div className="space-y-3">
              {todaysMeetings.map((meeting) => (
                <div
                  key={meeting.meetingId}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{meeting.meetingTitle || meeting.title}</h3>
                    <p className="text-sm text-gray-600">
                      {`${meeting.startTime || ''}${meeting.startTime && meeting.endTime ? ' - ' : ''}${meeting.endTime || ''}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (meeting.meetingType === 'REGULAR' && 'bg-blue-100 text-blue-800') ||
                        (meeting.meetingType === 'CONTEST' && 'bg-red-100 text-red-800') ||
                        (meeting.meetingType === 'SPECIAL' && 'bg-purple-100 text-purple-800') ||
                        'bg-gray-100 text-gray-800'
                      }`}
                      title={meeting.meetingType}
                    >
                      {meeting.meetingType}
                    </span>
                    <Clock size={16} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Today</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/members/add')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="text-blue-600 mb-2" size={24} />
              <h3 className="font-medium text-gray-900">Add New Member</h3>
              <p className="text-sm text-gray-600">Register a new club member</p>
            </button>
            <button
              onClick={() => navigate('/meetings/add')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="text-green-600 mb-2" size={24} />
              <h3 className="font-medium text-gray-900">Schedule Meeting</h3>
              <p className="text-sm text-gray-600">Create a new meeting</p>
            </button>
            <button
              onClick={() => toast('Coming soon: Agenda module', { icon: '⏳' })}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="text-purple-600 mb-2" size={24} />
              <h3 className="font-medium text-gray-900">Create Agenda</h3>
              <p className="text-sm text-gray-600">Add agenda items</p>
            </button>
            <button
              onClick={() => navigate('/roles')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="text-teal-600 mb-2" size={24} />
              <h3 className="font-medium text-gray-900">Manage Roles</h3>
              <p className="text-sm text-gray-600">Meeting roles</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

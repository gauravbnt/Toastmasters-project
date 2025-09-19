import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import Swal from 'sweetalert2'
import { Home, Users, Calendar, Settings, LogOut, User, Menu, X, FileText, Shield } from 'lucide-react'
import ConfirmationModal from '../common/ConfirmationModal'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth() || {}
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check if the current route matches the given path
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    
    // Show SweetAlert after logout
    Swal.fire({
      title: 'Logged Out Successfully!',
      text: 'You have been successfully logged out of your account.',
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
      background: '#f0fdf4',
      color: '#166534',
      iconColor: '#22c55e'
    })
    
    navigate('/')
  }



  // Admin navigation items
  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/meetings', label: 'Meetings', icon: Calendar },
    { path: '/agenda', label: 'Agenda', icon: FileText },
    { path: '/role-assignment', label: 'Role Assignment', icon: Users },
  ]

  // Member navigation items
  const memberNavItems = [
    { path: '/member-dashboard', label: 'Dashboard', icon: Home },
    { path: '/member-profile', label: 'Profile', icon: User },
  ]

  const navItems = user?.role === 'ADMIN' ? adminNavItems : memberNavItems

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to={user?.role === 'ADMIN' ? '/dashboard' : '/member-dashboard'} 
              className="text-xl font-bold text-primary-600"
            >
              Toastmasters
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(path) ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
              
              {/* Meetings Link for Members */}
              {user?.role === 'MEMBER' && (
                <Link
                  to="/member-meetings"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive('/member-meetings') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={18} />
                  <span>Meetings</span>
                </Link>
              )}
            </div>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User size={16} />
              <span>{user?.name || user?.email}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'ADMIN' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-lg transition-colors duration-200"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to log out from the Toastmasters application? You are currently logged in as ${user?.role === 'ADMIN' ? 'Administrator' : 'Member'}.`}
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        type="warning"
      />
    </nav>
  )
}

export default Navbar

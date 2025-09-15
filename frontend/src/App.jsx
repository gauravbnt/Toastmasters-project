import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MemberDashboard from './pages/MemberDashboard';
import MemberProfile from './pages/MemberProfile';
import Members from './pages/Members';
import MemberForm from './components/members/MemberForm';
import MemberList from './components/members/MemberList';
import MemberDetail from './components/members/MemberDetail';
import Meetings from './pages/Meetings';
import MeetingForm from './components/meetings/MeetingForm';
import MeetingList from './components/meetings/MeetingList';
import MeetingDetail from './components/meetings/MeetingDetail';
import Agenda from './pages/Agenda';
import Roles from './pages/Roles';
import RoleForm from './components/roles/RoleForm';
import RoleList from './components/roles/RoleList';
import Availability from './pages/Availability';
import MemberAvailability from './pages/MemberAvailability';
import MarkAvailability from './pages/MarkAvailability';
import MarkAvailabilityPage from './pages/MarkAvailabilityPage';
import AdminAgenda from './pages/admin/AdminAgenda';
import AdminAvailability from './pages/admin/AdminAvailability';
import AdminRoleAssignmentPage from './pages/admin/AdminRoleAssignmentPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth() || {}
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/member-dashboard'} replace />
  }
  
  return children
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth() || {}
  
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/member-dashboard'} replace />
  }
  
  return children
}

// App Content Component
const AppContent = () => {
  const { user } = useAuth() || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className={`container mx-auto px-4 ${user ? 'py-8' : 'py-16'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Default route redirects to login */}
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Admin Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/members" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Members />
            </ProtectedRoute>
          }>
            <Route index element={<MemberList />} />
            <Route path="add" element={<MemberForm />} />
            <Route path="edit/:id" element={<MemberForm />} />
            <Route path="view/:id" element={<MemberDetail />} />
          </Route>

          <Route path="/meetings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Meetings />
            </ProtectedRoute>
          }>
            <Route index element={<MeetingList />} />
            <Route path="add" element={<MeetingForm />} />
            <Route path="edit/:id" element={<MeetingForm />} />
            <Route path="view/:id" element={<MeetingDetail />} />
          </Route>

          <Route path="/roles" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Roles />
            </ProtectedRoute>
          }>
            <Route index element={<RoleList />} />
            <Route path="add" element={<RoleForm />} />
            <Route path="edit/:id" element={<RoleForm />} />
          </Route>

          <Route path="/availability" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Availability />
            </ProtectedRoute>
          } />
          <Route path="/member-availability" element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <MemberAvailability />
            </ProtectedRoute>
          } />
          <Route path="/meetings/:meetingId/mark-availability" element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <MarkAvailabilityPage />
            </ProtectedRoute>
          } />

          {/* Member Routes */}
          <Route path="/member-dashboard" element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/member-profile" element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <MemberProfile />
            </ProtectedRoute>
          } />

          {/* Admin only routes */}
          <Route path="/agenda" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAgenda />
            </ProtectedRoute>
          } />
          <Route path="/admin/availability" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAvailability />
            </ProtectedRoute>
          } />
          <Route path="/admin/role-assignment/:meetingId" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminRoleAssignmentPage />
            </ProtectedRoute>
          } />

          {/* Redirect unknown routes */}
          <Route path="*" element={
            user ? (
              <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/member-dashboard'} replace />
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

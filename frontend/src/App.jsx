import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import StudentDetailPage from './pages/StudentDetailPage'
import RoomsPage from './pages/RoomsPage'
import PaymentsPage from './pages/PaymentsPage'
import ComplaintsPage from './pages/ComplaintsPage'
import LeavesPage from './pages/LeavesPage'
import VisitorsPage from './pages/VisitorsPage'
import NoticesPage from './pages/NoticesPage'
import NotificationsPage from './pages/NotificationsPage'
import StaffPage from './pages/StaffPage'
import ReportsPage from './pages/ReportsPage'
import AuditLogPage from './pages/AuditLogPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LoadingSpinner from './components/common/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  return user ? children : <Navigate to="/login" />
}

function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App

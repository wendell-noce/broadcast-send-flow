import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '../features/auth/components/AuthPage'
import { useAuth } from '../features/auth/hooks/useAuth'
import { ConnectionsPage } from '../features/connections/components/ConnectionsPage'
import { ContactsPage } from '../features/contacts/components/ContactsPage'
import { MessagesPage } from '../features/messages/components/MessagesPage'
import { DashboardLayout } from '../shared/components/DashboardLayout'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Carregando...</div>
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/connections" replace />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
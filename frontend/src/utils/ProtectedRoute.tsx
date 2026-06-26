import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAuthLoading, user } = useAuth()

  if (isAuthLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/products" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
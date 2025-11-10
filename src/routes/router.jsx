import { createBrowserRouter } from 'react-router-dom'
import { SessionProvider } from '../context/SessionContext'
import AuthProtectedRoute from './AuthProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import SignUpPage from '../pages/auth/SignUpPage'
import NotFoundPage from '../pages/NotFoundPage'
import MainLayout from '../components/Layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import CapacidadFormadora from '../pages/CapacidadFormadora'
import SolicitudCupos from '../pages/SolicitudCupos'
import GestionAlumnos from '../pages/GestionAlumnos'
import ControlAsistencia from '../pages/ControlAsistencia'
import Retribuciones from '../pages/Retribuciones'
import GestionDocumental from '../pages/GestionDocumental'
import TestSupabase from '../pages/TestSupabase'
import TestCRUD from '../pages/TestCRUD'
import PortalCentroFormador from '../pages/portal/PortalCentroFormador'
import RegisterCentroPage from '../pages/auth/RegisterCentroPage'
import LoginCentroPage from '../pages/auth/LoginCentroPage'
import { UserRoleProvider } from '../context/UserRoleContext'

// Wrapper para el SessionProvider
function ProvidersWithRole({ children }) {
  return (
    <SessionProvider>
      <UserRoleProvider>
        {children}
      </UserRoleProvider>
    </SessionProvider>
  )
}
function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Providers>
        <LoginPage />
      </Providers>
    ),
  },
  {
    path: '/login',
    element: (
      <Providers>
        <LoginPage />
      </Providers>
    ),
  },
  {
    path: '/signup',
    element: (
      <Providers>
        <SignUpPage />
      </Providers>
    ),
  },
  {
    path: '/registro-centro',
    element: (
      <Providers>
        <RegisterCentroPage />
      </Providers>
    ),
  },
  {
    path: '/login-centro',
    element: (
      <Providers>
        <LoginCentroPage />
      </Providers>
    ),
  },
  {
    path: '/test-supabase',
    element: (
      <Providers>
        <TestSupabase />
      </Providers>
    ),
  },
  {
    path: '/test-crud',
    element: (
      <Providers>
        <TestCRUD />
      </Providers>
    ),
  },
  {
    path: '/',
    element: (
      <ProvidersWithRole>
        <AuthProtectedRoute />
      </ProvidersWithRole>
    ),
    children: [
      {
        path: 'portal-centro',
        element: <PortalCentroFormador />,
      },
      {
        path: 'dashboard',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'capacidad-formadora',
            element: <CapacidadFormadora />,
          },
          {
            path: 'solicitud-cupos',
            element: <SolicitudCupos />,
          },
          {
            path: 'gestion-alumnos',
            element: <GestionAlumnos />,
          },
          {
            path: 'control-asistencia',
            element: <ControlAsistencia />,
          },
          {
            path: 'retribuciones',
            element: <Retribuciones />,
          },
          {
            path: 'gestion-documental',
            element: <GestionDocumental />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router

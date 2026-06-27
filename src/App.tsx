import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PartyPage from './pages/Party'
import ReportPage from './pages/Report'
import TransactionPage from './pages/Transaction'
import MainLayout from './layouts/MainLayout'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoaderProvider } from './contexts/LoaderContext'
import Loader from './utils/Loader'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = sessionStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PrivateRoute>
    <MainLayout>{children}</MainLayout>
  </PrivateRoute>
)

export default function App() {
  return (
    <LoaderProvider>
      <ThemeProvider>
        <Loader />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
          <Route path="/master/party" element={<PrivateLayout><PartyPage /></PrivateLayout>} />
          <Route path="/transaction/add" element={<PrivateLayout><TransactionPage /></PrivateLayout>} />
          <Route path="/report/dues" element={<PrivateLayout><ReportPage /></PrivateLayout>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ThemeProvider>
    </LoaderProvider>
  )
}

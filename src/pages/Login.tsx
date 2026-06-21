import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { login } from '../services/auth.service'
import { toast } from 'react-toastify'
import { setCookie } from '../utils/storage.util'

export default function Login() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { currentTheme } = useTheme()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobile || !password) {
      toast.error('Please enter mobile and password')
      return
    }
    setLoading(true)
    try {
      const res = await login({ mobile, password })
      if (!res?.success) {
        toast.error(res?.message || 'Login failed. Please try again.')
        return
      }
      const data = res.data
      if (!data?.token) {
        toast.error('Login failed. Please try again.')
        return
      }
      setCookie('token', data.token, 7)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (error) {
      const msg =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="1200" height="600" fill="${currentTheme.colors.primary}"/><rect width="1200" height="600" fill="url(%23grid)"/></svg>')`,
        backgroundAttachment: 'fixed',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
        }}
      >
        {/* Card */}
        <div
          style={{
            background: currentTheme.colors.surface,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            padding: '48px 32px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              UKH
            </div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '28px',
                fontWeight: '700',
                color: currentTheme.colors.text,
              }}
            >
              Udhari Khata
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: currentTheme.colors.textLight,
              }}
            >
              Smart Ledger Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Mobile Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentTheme.colors.text,
                  marginBottom: '8px',
                }}
              >
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${currentTheme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.colors.primary}20`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.colors.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentTheme.colors.text,
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${currentTheme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.colors.primary}20`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.colors.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 10px 20px ${currentTheme.colors.primary}40`
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: currentTheme.colors.textLight,
              marginTop: '24px',
              margin: '24px 0 0 0',
            }}
          >
            Secure login with encryption
          </p>
        </div>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-toastify'
import httpService from '../services/apiService'

interface LoginApiResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      _id: string
      name: string
      mobile: string
      email: string
      company: string
    }
  }
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const PhoneIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.31a16 16 0 0 0 6.05 6.05l1.17-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const LockIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const LogInArrowIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)

const ShieldCheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'loginSpin 0.75s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mobileError, setMobileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [mobileFocused, setMobileFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const navigate = useNavigate()
  const { currentTheme } = useTheme()
  const c = currentTheme.colors

  const validate = (): boolean => {
    let valid = true
    if (!mobile.trim()) {
      setMobileError('Mobile number is required')
      valid = false
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      setMobileError('Enter a valid 10-digit mobile number')
      valid = false
    } else {
      setMobileError('')
    }
    if (!password.trim()) {
      setPasswordError('Password is required')
      valid = false
    } else {
      setPasswordError('')
    }
    return valid
  }

  const loginHandler = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await httpService.post<LoginApiResponse>('api/users/login', {
        data: { mobile: mobile.trim(), password: password.trim() },
        token: false,
      })
      if (res?.data?.token) {
        sessionStorage.setItem('token', res.data.token)
        localStorage.setItem('userName', res.data.user.name)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        toast.success(res.message || 'Login successful!')
        navigate('/dashboard')
      }
    } catch {
      // errors handled by httpService
    } finally {
      setLoading(false)
    }
  }

  const iconColor = (focused: boolean, error: string) =>
    error ? c.error : focused ? c.primary : c.textLight

  const borderColor = (focused: boolean, error: string) =>
    error ? c.error : focused ? c.primary : c.border

  const fieldShadow = (focused: boolean, error: string) => {
    if (error) return `0 0 0 4px ${c.error}1A`
    if (focused) return `0 0 0 4px ${c.primary}1A`
    return 'none'
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: `linear-gradient(145deg, ${c.primary} 0%, ${c.secondary} 55%, ${c.accent} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      overflow: 'hidden',
    }}>

      {/* Hex pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
        <defs>
          <pattern id="hexPat" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,2 58,18 58,34 30,50 2,34 2,18" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPat)"/>
      </svg>

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '450px', height: '450px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: '40%', right: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }}/>

      {/* Card */}
      <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: c.surface,
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.2)',
          padding: '44px 36px 36px',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
        }}>

          {/* Top accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '64px', height: '4px',
            background: `linear-gradient(90deg, ${c.primary}, ${c.accent})`,
            borderRadius: '0 0 6px 6px',
          }}/>

          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '76px', height: '76px',
              background: `linear-gradient(145deg, ${c.primary} 0%, ${c.accent} 100%)`,
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: `0 16px 32px ${c.primary}50`,
              position: 'relative',
            }}>
              {/* Ledger book SVG */}
              <svg width="36" height="38" viewBox="0 0 36 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="1" width="26" height="34" rx="4" fill="white" fillOpacity="0.22"/>
                <rect x="5" y="3" width="22" height="30" rx="3" fill="white" fillOpacity="0.18"/>
                <line x1="10" y1="11" x2="23" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="17" x2="23" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="23" x2="18" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="1" x2="5" y2="35" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.35"/>
              </svg>
              {/* Rupee badge */}
              <div style={{
                position: 'absolute', bottom: '6px', right: '6px',
                width: '24px', height: '24px',
                background: 'white', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '800',
                color: c.primary,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>₹</div>
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800', color: c.text, letterSpacing: '-0.5px' }}>
              Udhari Khata
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: c.textLight, letterSpacing: '0.3px' }}>
              Smart Ledger Management System
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ flex: 1, height: '1px', background: c.border }}/>
            <span style={{ fontSize: '10px', color: c.textLight, fontWeight: '700', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>SIGN IN TO CONTINUE</span>
            <div style={{ flex: 1, height: '1px', background: c.border }}/>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Mobile field */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.text, marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Mobile Number
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: `2px solid ${borderColor(mobileFocused, mobileError)}`,
                borderRadius: '10px',
                background: c.background,
                transition: 'border-color 0.25s, box-shadow 0.25s',
                boxShadow: fieldShadow(mobileFocused, mobileError),
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0 13px',
                  color: iconColor(mobileFocused, mobileError),
                  display: 'flex', alignItems: 'center',
                  height: '48px',
                  borderRight: `1px solid ${c.border}`,
                  transition: 'color 0.25s',
                }}>
                  <PhoneIcon color={iconColor(mobileFocused, mobileError)} />
                </div>
                <span style={{ padding: '0 10px 0 12px', fontSize: '14px', fontWeight: '600', color: c.textLight, borderRight: `1px solid ${c.border}`, height: '48px', display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                  +91
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => { setMobile(e.target.value); setMobileError('') }}
                  onFocus={() => setMobileFocused(true)}
                  onBlur={() => setMobileFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && loginHandler()}
                  placeholder="10-digit mobile number"
                  disabled={loading}
                  maxLength={10}
                  style={{
                    flex: 1, padding: '12px 14px',
                    border: 'none', outline: 'none',
                    fontSize: '14px', fontFamily: 'inherit',
                    background: 'transparent',
                    color: c.text, letterSpacing: '0.5px',
                  }}
                />
              </div>
              {mobileError && (
                <p style={{ margin: '6px 2px 0', fontSize: '11px', color: c.error, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircleIcon /> {mobileError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: c.text, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Password
                </label>
                {/* <span style={{ fontSize: '12px', color: c.primary, fontWeight: '500', cursor: 'pointer' }}>
                  Forgot password?
                </span> */}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: `2px solid ${borderColor(passwordFocused, passwordError)}`,
                borderRadius: '10px',
                background: c.background,
                transition: 'border-color 0.25s, box-shadow 0.25s',
                boxShadow: fieldShadow(passwordFocused, passwordError),
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0 13px',
                  color: iconColor(passwordFocused, passwordError),
                  display: 'flex', alignItems: 'center',
                  height: '48px',
                  borderRight: `1px solid ${c.border}`,
                  transition: 'color 0.25s',
                }}>
                  <LockIcon color={iconColor(passwordFocused, passwordError)} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && loginHandler()}
                  placeholder="Enter your password"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '12px 14px',
                    border: 'none', outline: 'none',
                    fontSize: '14px', fontFamily: 'inherit',
                    background: 'transparent',
                    color: c.text,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    padding: '0 14px', border: 'none', background: 'transparent',
                    color: c.textLight, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    height: '48px', transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = c.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = c.textLight)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordError && (
                <p style={{ margin: '6px 2px 0', fontSize: '11px', color: c.error, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircleIcon /> {passwordError}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={loginHandler}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 20px',
                background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
                color: 'white', border: 'none',
                borderRadius: '10px',
                fontSize: '15px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                marginTop: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                letterSpacing: '0.3px',
                boxShadow: `0 8px 20px ${c.primary}40`,
                opacity: loading ? 0.85 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 14px 30px ${c.primary}55`
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 8px 20px ${c.primary}40`
                }
              }}
            >
              {loading ? <><SpinnerIcon /> Signing in...</> : <>Sign In <LogInArrowIcon /></>}
            </button>
          </div>

          {/* Security note */}
          {/* <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '28px', padding: '10px 16px',
            background: `${c.primary}08`,
            borderRadius: '8px',
            border: `1px solid ${c.border}`,
          }}>
            <span style={{ color: c.primary, display: 'flex', alignItems: 'center' }}><ShieldCheckIcon /></span>
            <p style={{ margin: 0, fontSize: '12px', color: c.textLight, fontWeight: '500' }}>
              Protected by 256-bit SSL encryption
            </p>
          </div> */}

          {/* <p style={{ textAlign: 'center', margin: '16px 0 0', fontSize: '11px', color: c.textLight }}>
            Udhari Khata &copy; 2024 &bull; All rights reserved
          </p> */}
        </div>
      </div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

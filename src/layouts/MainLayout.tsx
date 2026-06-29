import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { removeCookie } from '../utils/storage.util'

// ─── Icons ────────────────────────────────────────────────────────────────────

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const LayersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const RepeatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)
const PlusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)
const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ChevronsLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
  </svg>
)
const ChevronsRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
  </svg>
)
const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const PaletteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: 'User', company: 'Udhari Khata' } }
}

const MOBILE_BP = 768

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentTheme, setThemeName, themeName } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()

  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMaster, setOpenMaster] = useState(location.pathname.startsWith('/master'))
  const [openTransaction, setOpenTransaction] = useState(location.pathname.startsWith('/transaction'))
  const [openReport, setOpenReport] = useState(location.pathname.startsWith('/report'))

  // Track viewport width
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BP
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location.pathname, isMobile])

  const isActive = (path: string) => location.pathname === path

  const logout = () => {
    removeCookie('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userName')
    navigate('/login')
  }

  const SIDEBAR_W = isMobile ? 260 : (collapsed ? 72 : 256)

  const menuItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center',
    gap: collapsed && !isMobile ? 0 : '10px',
    padding: collapsed && !isMobile ? '12px 0' : '10px 16px',
    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
    borderRadius: collapsed && !isMobile ? '0' : '10px',
    margin: collapsed && !isMobile ? '2px 0' : '2px 8px',
    cursor: 'pointer', transition: 'all 0.2s',
    color: active ? 'white' : 'rgba(255,255,255,0.7)',
    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
    borderLeft: active && !(collapsed && !isMobile) ? '3px solid rgba(255,255,255,0.9)' : (collapsed && !isMobile) ? 'none' : '3px solid transparent',
    fontWeight: active ? '700' : '500',
    fontSize: '13.5px',
    textDecoration: 'none',
    position: 'relative' as const,
  })

  const subItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px 8px 44px',
    margin: '1px 8px',
    borderRadius: '8px',
    cursor: 'pointer', transition: 'all 0.2s',
    color: active ? 'white' : 'rgba(255,255,255,0.65)',
    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
    fontWeight: active ? '600' : '400',
    fontSize: '13px',
    textDecoration: 'none',
  })

  const themeColors: Record<string, string> = { professional: '#0F4C75', ocean: '#0066CC', warm: '#8B4513' }

  const showCollapsed = collapsed && !isMobile

  const sidebarAside = (
    <aside style={{
      width: `${SIDEBAR_W}px`, flexShrink: 0,
      background: `linear-gradient(180deg, ${c.primary} 0%, ${c.secondary} 100%)`,
      display: 'flex', flexDirection: 'column',
      transition: isMobile ? 'left 0.3s ease' : 'width 0.3s ease',
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      // On mobile: fixed drawer; on desktop: sticky column
      position: isMobile ? 'fixed' : 'sticky',
      top: 0, left: isMobile ? (mobileOpen ? 0 : -SIDEBAR_W) : 'auto',
      height: '100vh', zIndex: isMobile ? 300 : 'auto',
      overflow: 'hidden',
    }}>

      {/* Brand */}
      <div style={{
        padding: showCollapsed ? '20px 0' : '20px 16px',
        display: 'flex', alignItems: 'center',
        gap: showCollapsed ? 0 : '12px',
        justifyContent: showCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        minHeight: '72px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: showCollapsed ? 0 : '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            UK
          </div>
          {!showCollapsed && (
            <div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'white', lineHeight: 1.2 }}>Udhari Khata</p>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: '0.5px' }}>LEDGER MANAGEMENT</p>
            </div>
          )}
        </div>
        {/* Close button on mobile */}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: showCollapsed ? '12px 0' : '12px 0', scrollbarWidth: 'none' }}>

        {/* Dashboard */}
        <Link to="/dashboard" style={menuItemStyle(isActive('/dashboard'))}
          onMouseEnter={e => { if (!isActive('/dashboard')) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { if (!isActive('/dashboard')) e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}><GridIcon /></span>
          {!showCollapsed && <span>Dashboard</span>}
          {showCollapsed && isActive('/dashboard') && (
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '24px', background: 'white', borderRadius: '0 3px 3px 0' }} />
          )}
        </Link>

        {/* Master */}
        <div>
          <div
            onClick={() => !showCollapsed && setOpenMaster(s => !s)}
            style={{ ...menuItemStyle(location.pathname.startsWith('/master')), justifyContent: showCollapsed ? 'center' : 'space-between' }}
            onMouseEnter={e => { if (!location.pathname.startsWith('/master')) e.currentTarget.style.background = showCollapsed ? 'transparent' : 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { if (!location.pathname.startsWith('/master')) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flexShrink: 0, display: 'flex' }}><LayersIcon /></span>
              {!showCollapsed && <span>Master</span>}
            </span>
            {!showCollapsed && (
              <span style={{ color: 'rgba(255,255,255,0.6)', transition: 'transform 0.2s', transform: openMaster ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'flex' }}>
                <ChevronDownIcon />
              </span>
            )}
          </div>
          {!showCollapsed && (
            <div style={{ maxHeight: openMaster ? '120px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <Link to="/master/party" style={subItemStyle(isActive('/master/party'))}
                onMouseEnter={e => { if (!isActive('/master/party')) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!isActive('/master/party')) e.currentTarget.style.background = 'transparent' }}
              >
                <UsersIcon />
                Party
              </Link>
            </div>
          )}
        </div>

        {/* Transaction */}
        <div>
          <div
            onClick={() => !showCollapsed && setOpenTransaction(s => !s)}
            style={{ ...menuItemStyle(location.pathname.startsWith('/transaction')), justifyContent: showCollapsed ? 'center' : 'space-between' }}
            onMouseEnter={e => { if (!location.pathname.startsWith('/transaction')) e.currentTarget.style.background = showCollapsed ? 'transparent' : 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { if (!location.pathname.startsWith('/transaction')) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flexShrink: 0, display: 'flex' }}><RepeatIcon /></span>
              {!showCollapsed && <span>Transaction</span>}
            </span>
            {!showCollapsed && (
              <span style={{ color: 'rgba(255,255,255,0.6)', transition: 'transform 0.2s', transform: openTransaction ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'flex' }}>
                <ChevronDownIcon />
              </span>
            )}
          </div>
          {!showCollapsed && (
            <div style={{ maxHeight: openTransaction ? '120px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <Link to="/transaction/add" style={subItemStyle(isActive('/transaction/add'))}
                onMouseEnter={e => { if (!isActive('/transaction/add')) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!isActive('/transaction/add')) e.currentTarget.style.background = 'transparent' }}
              >
                <PlusCircleIcon />
                Add Transaction
              </Link>
            </div>
          )}
        </div>

        {/* Lena-Dena */}
        <Link to="/lena-dena" style={menuItemStyle(isActive('/lena-dena'))}
          onMouseEnter={e => { if (!isActive('/lena-dena')) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { if (!isActive('/lena-dena')) e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </span>
          {!showCollapsed && <span>Lena-Dena</span>}
          {showCollapsed && isActive('/lena-dena') && (
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '24px', background: 'white', borderRadius: '0 3px 3px 0' }} />
          )}
        </Link>

        {/* Report */}
        <div>
          <div
            onClick={() => !showCollapsed && setOpenReport(s => !s)}
            style={{ ...menuItemStyle(location.pathname.startsWith('/report')), justifyContent: showCollapsed ? 'center' : 'space-between' }}
            onMouseEnter={e => { if (!location.pathname.startsWith('/report')) e.currentTarget.style.background = showCollapsed ? 'transparent' : 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { if (!location.pathname.startsWith('/report')) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flexShrink: 0, display: 'flex' }}><BarChartIcon /></span>
              {!showCollapsed && <span>Report</span>}
            </span>
            {!showCollapsed && (
              <span style={{ color: 'rgba(255,255,255,0.6)', transition: 'transform 0.2s', transform: openReport ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'flex' }}>
                <ChevronDownIcon />
              </span>
            )}
          </div>
          {!showCollapsed && (
            <div style={{ maxHeight: openReport ? '120px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <Link to="/report/dues" style={subItemStyle(isActive('/report/dues'))}
                onMouseEnter={e => { if (!isActive('/report/dues')) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!isActive('/report/dues')) e.currentTarget.style.background = 'transparent' }}
              >
                <FileTextIcon />
                Party Transaction Details
              </Link>
            </div>
          )}
          {!showCollapsed && (
            <div style={{ maxHeight: openReport ? '120px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <Link to="/report/ledger" style={subItemStyle(isActive('/report/ledger'))}
                onMouseEnter={e => { if (!isActive('/report/ledger')) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { if (!isActive('/report/ledger')) e.currentTarget.style.background = 'transparent' }}
              >
                <FileTextIcon />
                Party Ledger Details
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: User + Collapse */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
        {/* User section */}
        {!showCollapsed && (
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: 'white',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.company || 'Udhari Khata'}
              </p>
            </div>
          </div>
        )}

        {/* Theme + Logout + Collapse row */}
        <div style={{
          padding: showCollapsed ? '12px 0' : '8px 16px 14px',
          display: 'flex',
          flexDirection: showCollapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: '8px',
          justifyContent: showCollapsed ? 'center' : 'space-between',
        }}>
          {/* Theme dots */}
          {/* {!showCollapsed && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}><PaletteIcon /></span>
              {(['professional', 'ocean', 'warm'] as const).map(t => (
                <button key={t} onClick={() => setThemeName(t)}
                  title={t}
                  style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: themeColors[t],
                    border: themeName === t ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer', padding: 0, transition: 'transform 0.2s',
                    transform: themeName === t ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )} */}

          {/* Logout */}
          <button onClick={logout}
            title="Logout"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '8px', border: 'none',
              background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            <LogOutIcon />
            {!showCollapsed && 'Logout'}
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(s => !s)}
            style={{
              width: '100%', padding: '10px 0',
              background: 'rgba(0,0,0,0.15)', border: 'none',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', fontSize: '12px', gap: '6px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            {collapsed ? <ChevronsRightIcon /> : <><ChevronsLeftIcon /><span>Collapse</span></>}
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.background, fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* ── Sidebar (fixed on mobile, sticky on desktop) ── */}
      {sidebarAside}

      {/* ── Mobile backdrop overlay ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.52)',
            backdropFilter: 'blur(2px)',
            zIndex: 299,
            animation: 'mlFadeIn 0.2s ease',
          }}
        />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Bar */}
        <header style={{
          height: '64px', flexShrink: 0,
          background: c.surface,
          borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 28px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          position: 'sticky', top: 0, zIndex: 50,
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(s => !s)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  border: `1.5px solid ${c.border}`, background: 'transparent', cursor: 'pointer',
                  color: c.text, transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${c.primary}10`; e.currentTarget.style.borderColor = `${c.primary}40` }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = c.border }}
              >
                <MenuIcon />
              </button>
            )}
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {!isMobile && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`, flexShrink: 0 }} />}
              <span style={{ fontSize: '14px', fontWeight: '600', color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {location.pathname === '/dashboard' ? 'Dashboard' :
                 location.pathname === '/master/party' ? 'Master / Party' :
                 location.pathname.startsWith('/transaction') ? 'Transaction' :
                 location.pathname.startsWith('/report') ? 'Report' : 'Udhari Khata'}
              </span>
            </div>
          </div>

          {/* Right: user info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '14px',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isMobile && (
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: c.text }}>{user?.name || 'User'}</p>
                <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>{user?.company || 'Udhari Khata'}</p>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes mlFadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  )
}

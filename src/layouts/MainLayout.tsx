import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { removeCookie } from '../utils/storage.util'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [openMaster, setOpenMaster] = useState(false)
  const [openTransaction, setOpenTransaction] = useState(false)
  const [openReport, setOpenReport] = useState(false)
  const navigate = useNavigate()
  const { currentTheme, setThemeName, themeName } = useTheme()

  const user = (() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) return JSON.parse(stored)
      const userName = localStorage.getItem('userName')
      const userId = localStorage.getItem('userId')
      if (userName || userId) {
        return {
          _id: userId || '',
          name: userName || 'User',
          mobile: '',
          email: '',
          company: 'Udhari Khata',
        }
      }
      return null
    } catch {
      return null
    }
  })()

  const logout = () => {
    removeCookie('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊', submenu: null },
    {
      label: 'Master',
      icon: '⚙️',
      submenu: [{ label: 'Party', path: '/master/party' }],
    },
    {
      label: 'Transaction',
      icon: '💳',
      submenu: [{ label: 'Add', path: '/transaction/add' }],
    },
    {
      label: 'Report',
      icon: '📈',
      submenu: [{ label: 'Dues Report', path: '/report/dues' }],
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: currentTheme.colors.background,
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? '70px' : '260px',
          background: `linear-gradient(180deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 16px',
            borderBottom: `1px solid ${currentTheme.colors.primary}dd`,
            textAlign: collapsed ? 'center' : 'left',
          }}
        >
          {!collapsed && (
            <>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>Udhari</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Khata</div>
            </>
          )}
          {collapsed && <div style={{ fontSize: '14px', fontWeight: '700' }}>U</div>}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item, idx) => (
              <li key={idx} style={{ margin: 0 }}>
                {item.submenu ? (
                  <>
                    <div
                      onClick={() =>
                        idx === 1
                          ? setOpenMaster((s) => !s)
                          : idx === 2
                            ? setOpenTransaction((s) => !s)
                            : setOpenReport((s) => !s)
                      }
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s',
                        backgroundColor: 'rgba(255, 255, 255, 0)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0)'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      {!collapsed && <span style={{ fontSize: '14px' }}>{item.label}</span>}
                      {!collapsed && (
                        <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
                          {(idx === 1 && openMaster) ||
                          (idx === 2 && openTransaction) ||
                          (idx === 3 && openReport)
                            ? '▼'
                            : '▶'}
                        </span>
                      )}
                    </div>
                    {!collapsed &&
                      ((idx === 1 && openMaster) ||
                        (idx === 2 && openTransaction) ||
                        (idx === 3 && openReport)) && (
                        <ul
                          style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {item.submenu.map((subitem, sidx) => (
                            <li key={sidx}>
                              <Link
                                to={subitem.path}
                                style={{
                                  display: 'block',
                                  padding: '10px 16px 10px 48px',
                                  color: 'rgba(255, 255, 255, 0.9)',
                                  textDecoration: 'none',
                                  fontSize: '13px',
                                  transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                {subitem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </>
                ) : (
                  <Link
                    to={item.path!}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    {!collapsed && item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${currentTheme.colors.primary}dd`,
            textAlign: 'center',
          }}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background 0.2s',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header
          style={{
            height: '64px',
            background: currentTheme.colors.surface,
            borderBottom: `1px solid ${currentTheme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Theme Switcher */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['professional', 'ocean', 'warm'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => setThemeName(theme as any)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: themeName === theme ? '3px solid #333' : '2px solid #ccc',
                    cursor: 'pointer',
                    background:
                      theme === 'professional'
                        ? '#0F4C75'
                        : theme === 'ocean'
                          ? '#0066CC'
                          : '#8B4513',
                    transition: 'all 0.2s',
                  }}
                  title={theme}
                />
              ))}
            </div>

            {/* User Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingRight: '12px',
                borderRight: `1px solid ${currentTheme.colors.border}`,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: currentTheme.colors.text,
                  }}
                >
                  {user?.name || 'User'}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: currentTheme.colors.textLight,
                  }}
                >
                  {user?.company || 'Account'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: currentTheme.colors.error,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}


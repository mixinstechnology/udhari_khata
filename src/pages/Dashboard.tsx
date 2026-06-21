import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function Dashboard() {
  const { currentTheme } = useTheme()

  const userName = localStorage.getItem('userName') || 'User'

  const stats = [
    { label: 'Total Dues', value: '₹25,400', icon: '💰', trend: '+12%' },
    { label: 'Recent Trans.', value: '18', icon: '💳', trend: '+5' },
    { label: 'Active Parties', value: '42', icon: '👥', trend: '-2' },
    { label: 'This Month', value: '₹8,900', icon: '📊', trend: '+8%' },
  ]

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
          borderRadius: '12px',
          padding: '32px',
          color: 'white',
          marginBottom: '32px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          Here's what's happening with your ledger today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid"
        style={{
          marginBottom: '32px',
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: `${currentTheme.colors.primary}15`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  background: currentTheme.colors.success,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {stat.trend}
              </span>
            </div>
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: currentTheme.colors.textLight,
                fontWeight: '500',
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: currentTheme.colors.text,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Quick Actions */}
        <div
          style={{
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: currentTheme.colors.text,
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Add Transaction', icon: '➕', color: currentTheme.colors.primary },
              { label: 'View Dues', icon: '📋', color: currentTheme.colors.secondary },
              { label: 'Manage Parties', icon: '👥', color: currentTheme.colors.accent },
            ].map((action, idx) => (
              <button
                key={idx}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: `${action.color}20`,
                  color: action.color,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${action.color}30`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${action.color}20`
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          style={{
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: currentTheme.colors.text,
            }}
          >
            Recent Transactions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { party: 'Sharma Store', amount: '₹5,000', type: 'Credit', date: 'Today' },
              { party: 'Patel Traders', amount: '₹3,200', type: 'Debit', date: 'Yesterday' },
              { party: 'Singh Brothers', amount: '₹8,900', type: 'Credit', date: '2 days ago' },
            ].map((trans, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: currentTheme.colors.background,
                  borderRadius: '6px',
                  borderLeft: `4px solid ${trans.type === 'Credit' ? currentTheme.colors.success : currentTheme.colors.error}`,
                }}
              >
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: currentTheme.colors.text }}>
                    {trans.party}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: currentTheme.colors.textLight }}>
                    {trans.date}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: trans.type === 'Credit' ? currentTheme.colors.success : currentTheme.colors.error,
                    }}
                  >
                    {trans.amount}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: currentTheme.colors.textLight }}>
                    {trans.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


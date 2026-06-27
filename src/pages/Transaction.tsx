import React, { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useTheme } from '../contexts/ThemeContext'
import { createTransaction, getTransactionList, approveTransaction, rejectTransaction } from '../services/transaction.service'
import { getPartyList } from '../services/party.service'
import type { Transaction, TransactionPayload, TransactionType, PaymentMode } from '../types/transaction.types'
import type { Party } from '../types/party.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

const RepeatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
const TrendingUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)
const TrendingDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
)
const LayersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const BanIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'txnSpin 0.8s linear infinite' }}>
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val: number) =>
  `₹${val?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const todayISO = () => new Date().toISOString().split('T')[0]

const getStoredUser = (): { _id: string; name: string; company: string } => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: 'User', company: '' } }
}

const getPartyName = (tx: Transaction): string => {
  if (tx.partyId && typeof tx.partyId === 'object') return (tx.partyId as { name: string }).name
  return '—'
}

// ─── Default form ─────────────────────────────────────────────────────────────

const emptyForm = (): Omit<TransactionPayload, 'createdBy'> => ({
  partyId: '',
  amount: 0,
  type: 'credit',
  paymentMode: 'CASH',
  transactionDate: todayISO(),
  remark: '',
})

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'Pending',  bg: '#F59E0B18', color: '#F59E0B' },
  APPROVED: { label: 'Approved', bg: '#10B98118', color: '#10B981' },
  REJECTED: { label: 'Rejected', bg: '#EF444418', color: '#EF4444' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionPage() {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [errors, setErrors] = useState<Partial<Record<keyof ReturnType<typeof emptyForm>, string>>>({})

  // ── Filter state ──
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')

  // ── Approve / Reject state ──
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ tx: Transaction } | null>(null)
  const [rejectRemark, setRejectRemark] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [confirmApprove, setConfirmApprove] = useState<Transaction | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user._id) return
    setLoading(true)
    try {
      const res = await getTransactionList(user._id)
      if (res.success) setTransactions(Array.isArray(res.data) ? res.data : [])
    } catch { /* global loader handles error display */ }
    finally { setLoading(false) }
  }, [user._id])

  const fetchParties = useCallback(async () => {
    if (!user._id) return
    try {
      const res = await getPartyList({ createdBy: user._id, page: 1, limit: 1000 })
      if (res.success) setParties(res.data.data)
    } catch { /* silent */ }
  }, [user._id])

  useEffect(() => {
    fetchTransactions()
    fetchParties()
  }, [fetchTransactions, fetchParties])

  const openModal = () => { setForm(emptyForm()); setErrors({}); setShowModal(true) }
  const closeModal = () => { if (!submitting) setShowModal(false) }

  const setField = <K extends keyof ReturnType<typeof emptyForm>>(key: K, val: ReturnType<typeof emptyForm>[K]) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.partyId) e.partyId = 'Party is required'
    if (!form.amount || form.amount <= 0) e.amount = 'Amount must be greater than 0'
    if (!form.transactionDate) e.transactionDate = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: TransactionPayload = { ...form, createdBy: user._id }
      const res = await createTransaction(payload)
      if (res.success) {
        toast.success('Transaction added successfully')
        closeModal()
        fetchTransactions()
      } else {
        toast.error(res.message || 'Failed to add transaction')
      }
    } catch {
      toast.error('Failed to add transaction. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Approve / Reject handlers ──

  const handleApprove = async (tx: Transaction) => {
    setApprovingId(tx._id)
    try {
      const res = await approveTransaction(tx._id, { userId: user._id })
      if (res.success) {
        toast.success('Transaction approved successfully')
        setTransactions(prev => prev.map(t => t._id === tx._id ? { ...t, status: 'APPROVED' as const } : t))
      } else {
        toast.error(res.message || 'Failed to approve transaction')
      }
    } catch {
      toast.error('Failed to approve transaction. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const openRejectModal = (tx: Transaction) => {
    setRejectModal({ tx })
    setRejectRemark('')
  }

  const handleReject = async () => {
    if (!rejectModal) return
    if (!rejectRemark.trim()) { toast.error('Reject remark is required'); return }
    const { tx } = rejectModal
    setRejectingId(tx._id)
    try {
      const res = await rejectTransaction(tx._id, { userId: user._id, rejectRemark: rejectRemark.trim() })
      if (res.success) {
        toast.success('Transaction rejected')
        setTransactions(prev => prev.map(t => t._id === tx._id ? { ...t, status: 'REJECTED', rejectRemark: rejectRemark.trim() } : t))
        setRejectModal(null)
      } else {
        toast.error(res.message || 'Failed to reject transaction')
      }
    } catch {
      toast.error('Failed to reject transaction. Please try again.')
    } finally {
      setRejectingId(null)
    }
  }

  // ── Derived ──

  const filtered = transactions.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    return true
  })

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalDebit  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  const statusCounts = {
    all:      transactions.length,
    pending:  transactions.filter(t => t.status === 'PENDING').length,
    approved: transactions.filter(t => t.status === 'APPROVED').length,
    rejected: transactions.filter(t => t.status === 'REJECTED').length,
  }

  const summaryCards: Array<{
    label: string; value: string; sub: string
    icon: React.ReactNode; color: string; grad: string
    filterKey?: 'PENDING' | 'APPROVED' | 'REJECTED'
  }> = [
    {
      label: 'Total Transactions', value: String(transactions.length),
      sub: filtered.length !== transactions.length ? `${filtered.length} shown` : 'all records',
      icon: <LayersIcon />, color: c.primary, grad: `linear-gradient(135deg,${c.primary},${c.secondary})`,
    },
    {
      label: 'Total Credit', value: formatCurrency(totalCredit),
      sub: `${transactions.filter(t => t.type === 'credit').length} entries`,
      icon: <TrendingUpIcon />, color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)',
    },
    {
      label: 'Total Debit', value: formatCurrency(totalDebit),
      sub: `${transactions.filter(t => t.type === 'debit').length} entries`,
      icon: <TrendingDownIcon />, color: '#EF4444', grad: 'linear-gradient(135deg,#EF4444,#DC2626)',
    },
    {
      label: 'Pending Approval', value: String(statusCounts.pending),
      sub: statusCounts.pending === 1 ? '1 transaction' : `${statusCounts.pending} transactions`,
      icon: <ClockIcon />, color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#D97706)',
      filterKey: 'PENDING',
    },
    {
      label: 'Approved', value: String(statusCounts.approved),
      sub: `${statusCounts.rejected} rejected`,
      icon: <ShieldCheckIcon />, color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)',
      filterKey: 'APPROVED',
    },
  ]

  // ─── Styles ───────────────────────────────────────────────────────────────────

  const thCol: CSSProperties = {
    padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700',
    color: c.textLight, letterSpacing: '0.5px', textTransform: 'uppercase',
    borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap', background: `${c.primary}06`,
  }

  const inputStyle = (hasErr?: boolean): CSSProperties => ({
    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13.5px',
    border: `1.5px solid ${hasErr ? c.error : c.border}`,
    background: c.background, color: c.text, fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  })

  const labelStyle: CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: '600', color: c.textLight,
    marginBottom: '5px', letterSpacing: '0.3px',
  }

  const segBtn = (active: boolean, color: string): CSSProperties => ({
    flex: 1, padding: '8px 0', border: `1.5px solid ${active ? color : c.border}`,
    borderRadius: '8px', background: active ? `${color}18` : 'transparent',
    color: active ? color : c.textLight, fontWeight: active ? '700' : '500',
    fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
  })

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 18px ${c.primary}35` }}>
            <RepeatIcon />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: c.text }}>Transactions</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>Manage credit and debit transactions</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchTransactions}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'transparent', color: c.primary, border: `1.5px solid ${c.primary}40`, borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${c.primary}10` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <RefreshIcon /> Refresh
          </button>
          <button onClick={openModal}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 14px ${c.primary}35` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${c.primary}45` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${c.primary}35` }}
          >
            <PlusIcon /> Add Transaction
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="txn-summary-grid">
        {summaryCards.map((card, i) => {
          const isActiveFilter = card.filterKey && statusFilter === card.filterKey
          return (
            <div key={i}
              onClick={() => card.filterKey && setStatusFilter(isActiveFilter ? 'all' : card.filterKey)}
              style={{ background: c.surface, border: `1.5px solid ${isActiveFilter ? card.color : c.border}`, borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: isActiveFilter ? `0 6px 20px ${card.color}25` : '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.25s', cursor: card.filterKey ? 'pointer' : 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${card.color}25` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isActiveFilter ? `0 6px 20px ${card.color}25` : '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: card.grad }} />
              {isActiveFilter && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: card.color, boxShadow: `0 0 6px ${card.color}` }} />}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.grad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 5px 14px ${card.color}35` }}>
                  {card.icon}
                </div>
                {card.filterKey && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: isActiveFilter ? card.color : c.textLight, background: isActiveFilter ? `${card.color}15` : `${c.border}60`, padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.3px' }}>
                    {isActiveFilter ? 'ACTIVE' : 'FILTER'}
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: c.textLight, fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{card.label}</p>
              <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: card.color }}>{card.value}</p>
              <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* ── Transaction Table ── */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {([
              { key: 'all',      label: 'All',      count: statusCounts.all,      color: c.primary },
              { key: 'PENDING',  label: 'Pending',  count: statusCounts.pending,  color: '#F59E0B' },
              { key: 'APPROVED', label: 'Approved', count: statusCounts.approved, color: '#10B981' },
              { key: 'REJECTED', label: 'Rejected', count: statusCounts.rejected, color: '#EF4444' },
            ] as const).map(({ key, label, count, color }) => {
              const active = statusFilter === key
              return (
                <button key={key} onClick={() => setStatusFilter(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 13px', borderRadius: '20px', border: `1.5px solid ${active ? color : c.border}`, background: active ? `${color}15` : 'transparent', color: active ? color : c.textLight, fontSize: '12px', fontWeight: active ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {label}
                  <span style={{ minWidth: '18px', height: '18px', borderRadius: '10px', background: active ? color : c.border, color: active ? 'white' : c.textLight, fontSize: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {loading ? '…' : count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Type filter pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {([
              { key: 'all',    label: 'All Types', color: c.primary },
              { key: 'credit', label: 'Credit',    color: '#10B981' },
              { key: 'debit',  label: 'Debit',     color: '#EF4444' },
            ] as const).map(({ key, label, color }) => {
              const active = typeFilter === key
              return (
                <button key={key} onClick={() => setTypeFilter(key)}
                  style={{ padding: '5px 13px', borderRadius: '20px', border: `1.5px solid ${active ? color : c.border}`, background: active ? `${color}15` : 'transparent', color: active ? color : c.textLight, fontSize: '12px', fontWeight: active ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Record count bar */}
        <div style={{ padding: '8px 20px', borderBottom: `1px solid ${c.border}`, background: `${c.primary}03` }}>
          <p style={{ margin: 0, fontSize: '12px', color: c.textLight }}>
            {loading ? 'Loading…' : (
              <>
                Showing <strong style={{ color: c.text }}>{filtered.length}</strong> of <strong style={{ color: c.text }}>{transactions.length}</strong> transactions
                {(statusFilter !== 'all' || typeFilter !== 'all') && (
                  <button onClick={() => { setStatusFilter('all'); setTypeFilter('all') }}
                    style={{ marginLeft: '10px', padding: '1px 8px', borderRadius: '4px', border: `1px solid ${c.border}`, background: 'transparent', color: c.textLight, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Clear filters
                  </button>
                )}
              </>
            )}
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['#', 'Party', 'Amount', 'Type', 'Mode', 'Date', 'Status', 'Remark', 'Actions'].map(h => (
                  <th key={h} style={thCol}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ height: '13px', background: c.border, borderRadius: '4px', animation: 'txnPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                      </td>
                    ))}</tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr><td colSpan={9} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: c.textLight }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${c.border}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RepeatIcon /></div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text }}>
                          {transactions.length === 0 ? 'No transactions found' : 'No transactions match the selected filters'}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px' }}>
                          {transactions.length === 0
                            ? 'Click "Add Transaction" to record your first entry'
                            : 'Try adjusting the status or type filter above'}
                        </p>
                        {transactions.length > 0 && (
                          <button onClick={() => { setStatusFilter('all'); setTypeFilter('all') }}
                            style={{ marginTop: '4px', padding: '7px 18px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td></tr>
                  )
                : filtered.map((tx, idx) => {
                    const sc = statusConfig[tx.status] || statusConfig.PENDING
                    return (
                      <tr key={tx._id}
                        onMouseEnter={e => e.currentTarget.style.background = `${c.primary}06`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontWeight: '500' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.text, fontWeight: '600' }}>
                          {getPartyName(tx)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, fontWeight: '700', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: tx.type === 'credit' ? '#10B98118' : '#EF444418', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                            {tx.type === 'credit' ? 'CR' : 'DR'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: `${c.border}60`, color: c.textLight }}>
                            {tx.paymentMode}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, whiteSpace: 'nowrap' }}>
                          {formatDate(tx.transactionDate)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.remark || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
                          {tx.status === 'PENDING' ? (
                            /* ── Pill toggle: Approve | Reject ── */
                            <div style={{ display: 'inline-flex', border: `1.5px solid ${c.border}`, borderRadius: '9px', overflow: 'hidden', opacity: (approvingId && approvingId !== tx._id) || (rejectingId && rejectingId !== tx._id) ? 0.45 : 1, transition: 'opacity 0.2s' }}>
                              {/* Approve half */}
                              <button
                                disabled={!!approvingId || !!rejectingId}
                                onClick={() => setConfirmApprove(tx)}
                                title="Approve this transaction"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 13px', border: 'none', borderRight: `1px solid ${c.border}`, background: approvingId === tx._id ? '#10B98120' : 'transparent', color: '#10B981', fontSize: '11px', fontWeight: '700', cursor: approvingId === tx._id ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
                                onMouseEnter={e => { if (!approvingId && !rejectingId) e.currentTarget.style.background = '#10B98120' }}
                                onMouseLeave={e => { if (approvingId !== tx._id) e.currentTarget.style.background = 'transparent' }}
                              >
                                {approvingId === tx._id ? <SpinnerIcon /> : <CheckIcon />}
                                {approvingId === tx._id ? 'Approving…' : 'Approve'}
                              </button>
                              {/* Reject half */}
                              <button
                                disabled={!!approvingId || !!rejectingId}
                                onClick={() => openRejectModal(tx)}
                                title="Reject this transaction"
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 13px', border: 'none', background: rejectingId === tx._id ? '#EF444420' : 'transparent', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: rejectingId === tx._id ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
                                onMouseEnter={e => { if (!approvingId && !rejectingId) e.currentTarget.style.background = '#EF444420' }}
                                onMouseLeave={e => { if (rejectingId !== tx._id) e.currentTarget.style.background = 'transparent' }}
                              >
                                <BanIcon /> Reject
                              </button>
                            </div>
                          ) : tx.status === 'APPROVED' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '9px', background: '#10B98112', border: '1.5px solid #10B98130', color: '#10B981', fontSize: '11px', fontWeight: '700' }}>
                              <CheckIcon /> Approved
                            </div>
                          ) : (
                            <div title={tx.rejectRemark ? `Reason: ${tx.rejectRemark}` : 'Rejected'} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '9px', background: '#EF444412', border: '1.5px solid #EF444430', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: tx.rejectRemark ? 'help' : 'default' }}>
                              <BanIcon /> Rejected
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Transaction Modal ── */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'txnFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: c.surface, borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'txnSlideUp 0.25s ease', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg,${c.primary}08,transparent)` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: c.text }}>Add Transaction</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>Record a new credit or debit entry</p>
              </div>
              <button onClick={closeModal} disabled={submitting}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: `${c.border}60`, color: c.textLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.error}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${c.border}60`}
              ><XIcon /></button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

              {/* Party */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Party <span style={{ color: c.error }}>*</span></label>
                <select value={form.partyId} onChange={e => setField('partyId', e.target.value)}
                  style={{ ...inputStyle(!!errors.partyId), cursor: 'pointer' }}
                >
                  <option value="">-- Select Party --</option>
                  {parties.map(p => (
                    <option key={p._id} value={p._id}>{p.name} {p.mobile ? `(${p.mobile})` : ''}</option>
                  ))}
                </select>
                {errors.partyId && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{errors.partyId}</p>}
              </div>

              {/* Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Transaction Type <span style={{ color: c.error }}>*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setField('type', 'credit' as TransactionType)}
                    style={segBtn(form.type === 'credit', '#10B981')}>
                    Credit (You will receive)
                  </button>
                  <button type="button" onClick={() => setField('type', 'debit' as TransactionType)}
                    style={segBtn(form.type === 'debit', '#EF4444')}>
                    Debit (You will pay)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Amount (₹) <span style={{ color: c.error }}>*</span></label>
                <input type="number" min="1" step="0.01" placeholder="0.00"
                  value={form.amount || ''}
                  onChange={e => setField('amount', parseFloat(e.target.value) || 0)}
                  style={inputStyle(!!errors.amount)}
                />
                {errors.amount && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{errors.amount}</p>}
              </div>

              {/* Payment Mode + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Payment Mode <span style={{ color: c.error }}>*</span></label>
                  <select value={form.paymentMode} onChange={e => setField('paymentMode', e.target.value as PaymentMode)}
                    style={{ ...inputStyle(), cursor: 'pointer' }}>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Transaction Date <span style={{ color: c.error }}>*</span></label>
                  <input type="date" value={form.transactionDate}
                    onChange={e => setField('transactionDate', e.target.value)}
                    style={inputStyle(!!errors.transactionDate)}
                  />
                  {errors.transactionDate && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{errors.transactionDate}</p>}
                </div>
              </div>

              {/* Remark */}
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Remark</label>
                <textarea rows={2} placeholder="Optional note..."
                  value={form.remark}
                  onChange={e => setField('remark', e.target.value)}
                  style={{ ...inputStyle(), resize: 'none' }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} disabled={submitting}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {submitting ? 'Saving…' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Approve Modal ── */}
      {confirmApprove && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'txnFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget && !approvingId) setConfirmApprove(null) }}
        >
          <div style={{ background: c.surface, borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'txnSlideUp 0.25s ease', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 20px', background: 'linear-gradient(135deg,#10B98108,transparent)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 6px 18px #10B98135' }}>
                <CheckIcon />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '700', color: c.text }}>Approve Transaction?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: c.textLight, lineHeight: '1.5' }}>
                You are about to approve <strong style={{ color: c.text }}>{getPartyName(confirmApprove)}</strong>'s transaction of{' '}
                <strong style={{ color: '#10B981' }}>{formatCurrency(confirmApprove.amount)}</strong>.
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '16px 24px 22px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { if (!approvingId) setConfirmApprove(null) }}
                disabled={!!approvingId}
                style={{ padding: '9px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: approvingId ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const tx = confirmApprove
                  setConfirmApprove(null)
                  await handleApprove(tx)
                }}
                disabled={!!approvingId}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', cursor: approvingId ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}
              >
                {approvingId ? <><SpinnerIcon /> Approving…</> : <><CheckIcon /> Confirm Approve</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Remark Modal ── */}
      {rejectModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'txnFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget && !rejectingId) setRejectModal(null) }}
        >
          <div style={{ background: c.surface, borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'txnSlideUp 0.25s ease', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${c.border}`, background: 'linear-gradient(135deg,#EF444408,transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BanIcon />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: c.text }}>Reject Transaction?</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: c.textLight }}>
                    {getPartyName(rejectModal.tx)} · <strong style={{ color: '#EF4444' }}>{formatCurrency(rejectModal.tx.amount)}</strong> · This cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: c.textLight, marginBottom: '6px', letterSpacing: '0.3px' }}>
                Reason for rejection <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                rows={3}
                autoFocus
                placeholder="e.g. Wrong entry, duplicate transaction…"
                value={rejectRemark}
                onChange={e => setRejectRemark(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13.5px', border: `1.5px solid ${rejectRemark.trim() ? c.border : '#EF444440'}`, background: c.background, color: c.text, fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button
                  onClick={() => { if (!rejectingId) setRejectModal(null) }}
                  disabled={!!rejectingId}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: rejectingId ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!!rejectingId || !rejectRemark.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'white', cursor: rejectingId || !rejectRemark.trim() ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: !rejectRemark.trim() ? 0.6 : 1, transition: 'all 0.2s' }}
                >
                  {rejectingId ? <><SpinnerIcon /> Rejecting…</> : <><BanIcon /> Confirm Reject</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes txnPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes txnFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes txnSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes txnSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .txn-summary-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:24px; }

        @media(max-width:1280px) { .txn-summary-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:768px)  { .txn-summary-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px)  { .txn-summary-grid{grid-template-columns:1fr;} }
      `}</style>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'react-toastify'
import { useTheme } from '../contexts/ThemeContext'
import {
  createLenaDena,
  getLenaDenaList,
  approveLenaDena,
  rejectLenaDena,
} from '../services/LenaDena.service'
import { getPartyList } from '../services/party.service'
import { LenaDena, LenaDenaType, LenaDenaStatus } from '../types/lenadena.types'
import { Party } from '../types/party.types'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const BanIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
)
const TrendingDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
)
const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'ld-spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: 'User' } }
}

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const todayIso = () => new Date().toISOString().split('T')[0]

// ─── Config ───────────────────────────────────────────────────────────────────
const statusConfig: Record<LenaDenaStatus, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'Pending',  bg: '#F59E0B18', color: '#F59E0B' },
  APPROVED: { label: 'Approved', bg: '#10B98118', color: '#10B981' },
  REJECTED: { label: 'Rejected', bg: '#EF444418', color: '#EF4444' },
}

const typeConfig: Record<LenaDenaType, { label: string; color: string; bg: string }> = {
  lena: { label: 'Lena', color: '#10B981', bg: '#10B98118' },
  dena: { label: 'Dena', color: '#EF4444', bg: '#EF444418' },
}

const entryColor = (type: LenaDenaType) => type === 'lena' ? '#10B981' : '#EF4444'

// ─── Component ────────────────────────────────────────────────────────────────
export default function LenaDenaPage() {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()

  const FETCH_LIMIT = 10000
  const PAGE_SIZE   = 10

  // ── List state ──
  const [entries, setEntries] = useState<LenaDena[]>([])
  const [total,   setTotal]   = useState(0)

  // ── Client-side pagination ──
  const [ldPage, setLdPage] = useState(1)

  // ── Filters ──
  const [statusFilter, setStatusFilter] = useState<'all' | LenaDenaStatus>('all')
  const [typeFilter,   setTypeFilter]   = useState<'all' | LenaDenaType>('all')

  // ── Action state ──
  const [approvingId,    setApprovingId]    = useState<string | null>(null)
  const [confirmApprove, setConfirmApprove] = useState<LenaDena | null>(null)
  const [rejectModal,    setRejectModal]    = useState<LenaDena | null>(null)
  const [rejectRemark,   setRejectRemark]   = useState('')
  const [rejectingId,    setRejectingId]    = useState<string | null>(null)

  // ── Add modal ──
  const [showAdd,    setShowAdd]    = useState(false)
  const [parties,    setParties]    = useState<Party[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    partyId: '',
    type: 'lena' as LenaDenaType,
    amount: '',
    date: todayIso(),
    remark: '',
  })

  // ── Fetch ──
  const fetchEntries = useCallback(async () => {
    try {
      const res = await getLenaDenaList({ createdBy: user._id, page: 1, limit: FETCH_LIMIT })
      if (res.success) {
        setEntries(res.data)
        setTotal(res.total)
      }
    } catch {
      toast.error('Failed to fetch Lena-Dena entries')
    }
  }, [user._id])

  const fetchParties = useCallback(async () => {
    try {
      const res = await getPartyList({ createdBy: user._id, page: 1, limit: 200 })
      if (res.success) setParties(res.data.data)
    } catch { /* non-critical */ }
  }, [user._id])

  useEffect(() => { fetchEntries() }, [user._id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (showAdd && parties.length === 0) fetchParties() }, [showAdd]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setLdPage(1) }, [statusFilter, typeFilter])

  // ── Derived ──
  const filtered = entries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (typeFilter   !== 'all' && e.type   !== typeFilter)   return false
    return true
  })

  const statusCounts = {
    all:      entries.length,
    PENDING:  entries.filter(e => e.status === 'PENDING').length,
    APPROVED: entries.filter(e => e.status === 'APPROVED').length,
    REJECTED: entries.filter(e => e.status === 'REJECTED').length,
  }

  const totalLena = entries.filter(e => e.type === 'lena').reduce((s, e) => s + e.amount, 0)
  const totalDena = entries.filter(e => e.type === 'dena').reduce((s, e) => s + e.amount, 0)

  const ldTotalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedItems = filtered.slice((ldPage - 1) * PAGE_SIZE, ldPage * PAGE_SIZE)

  // ── Handlers ──
  const handleApprove = async (entry: LenaDena) => {
    setConfirmApprove(null)
    setApprovingId(entry._id)
    try {
      const res = await approveLenaDena(entry._id, { userId: user._id })
      if (res.success) {
        toast.success('Entry approved successfully')
        setEntries(prev => prev.map(e => e._id === entry._id ? { ...e, status: 'APPROVED' as const } : e))
      } else {
        toast.error(res.message || 'Failed to approve')
      }
    } catch {
      toast.error('Failed to approve. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    if (!rejectRemark.trim()) { toast.error('Reject remark is required'); return }
    const target = rejectModal
    setRejectingId(target._id)
    try {
      const res = await rejectLenaDena(target._id, { userId: user._id, rejectRemark: rejectRemark.trim() })
      if (res.success) {
        toast.success('Entry rejected')
        setEntries(prev => prev.map(e => e._id === target._id ? { ...e, status: 'REJECTED' as const, rejectRemark: rejectRemark.trim() } : e))
        setRejectModal(null)
        setRejectRemark('')
      } else {
        toast.error(res.message || 'Failed to reject')
      }
    } catch {
      toast.error('Failed to reject. Please try again.')
    } finally {
      setRejectingId(null)
    }
  }

  const handleAdd = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Amount must be greater than 0'); return }
    if (!form.date) { toast.error('Date is required'); return }
    setSubmitting(true)
    try {
      const payload = {
        ...(form.partyId ? { partyId: form.partyId } : {}),
        type: form.type,
        amount: Number(form.amount),
        date: new Date(form.date).toISOString(),
        ...(form.remark.trim() ? { remark: form.remark.trim() } : {}),
        createdBy: user._id,
      }
      const res = await createLenaDena(payload)
      if (res.success) {
        toast.success('Entry added successfully')
        setShowAdd(false)
        setForm({ partyId: '', type: 'lena', amount: '', date: todayIso(), remark: '' })
        fetchEntries()
      } else {
        toast.error(res.message || 'Failed to add entry')
      }
    } catch {
      toast.error('Failed to add entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({ partyId: '', type: 'lena', amount: '', date: todayIso(), remark: '' })
    setShowAdd(false)
  }

  // ── Styles ──
  const inputStyle = {
    width: '100%', padding: '10px 12px', border: `1.5px solid ${c.border}`,
    borderRadius: '8px', fontSize: '14px', color: c.text, background: c.background,
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: c.textLight, marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px', background: c.background, minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        @keyframes ld-spin { to { transform: rotate(360deg); } }
        .ld-summary-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:24px; }
        @media(max-width:1280px) { .ld-summary-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:768px)  { .ld-summary-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px)  { .ld-summary-grid{grid-template-columns:1fr;} }
        .ld-table { width:100%; border-collapse:collapse; }
        .ld-table th { padding:10px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; white-space:nowrap; }
        .ld-table td { padding:13px 14px; font-size:13.5px; vertical-align:middle; }
        .ld-table tbody tr { transition:background 0.15s; }
        .ld-table tbody tr:hover td { background:rgba(0,0,0,0.025); }
        .ld-pill-btn { border:none; border-radius:20px; padding:6px 14px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: c.text, letterSpacing: '-0.5px' }}>Lena-Dena</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: c.textLight }}>Track borrowing and lending entries</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => fetchEntries()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: c.surface, color: c.textLight, border: `1.5px solid ${c.border}`, borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            <RefreshIcon /> Refresh
          </button>
          <button
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: c.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: `0 4px 12px ${c.primary}44` }}
          >
            <PlusIcon /> Add Entry
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {/* <div className="ld-summary-grid">
        {([
          {
            label: 'Total Entries', value: String(total), sub: `${entries.length} loaded`,
            icon: <LayersIcon />, color: c.primary, grad: `${c.primary}18`,
          },
          {
            label: 'Total Lena', value: formatCurrency(totalLena), sub: `${entries.filter(e => e.type === 'lena').length} entries`,
            icon: <TrendingUpIcon />, color: '#10B981', grad: '#10B98118',
          },
          {
            label: 'Total Dena', value: formatCurrency(totalDena), sub: `${entries.filter(e => e.type === 'dena').length} entries`,
            icon: <TrendingDownIcon />, color: '#EF4444', grad: '#EF444418',
          },
          {
            label: 'Pending', value: String(statusCounts.PENDING), sub: 'awaiting action',
            icon: <ClockIcon />, color: '#F59E0B', grad: '#F59E0B18', filterKey: 'PENDING' as LenaDenaStatus,
          },
          {
            label: 'Approved', value: String(statusCounts.APPROVED), sub: 'completed',
            icon: <ShieldCheckIcon />, color: '#10B981', grad: '#10B98118', filterKey: 'APPROVED' as LenaDenaStatus,
          },
        ] as Array<{ label: string; value: string; sub: string; icon: ReactNode; color: string; grad: string; filterKey?: LenaDenaStatus }>).map(card => {
          const active = card.filterKey !== undefined && statusFilter === card.filterKey
          return (
            <div key={card.label}
              onClick={() => card.filterKey && setStatusFilter(prev => prev === card.filterKey ? 'all' : card.filterKey!)}
              style={{
                background: c.surface, borderRadius: '14px', padding: '18px 20px',
                border: `1.5px solid ${active ? card.color : c.border}`,
                cursor: card.filterKey ? 'pointer' : 'default',
                transition: 'all 0.2s',
                boxShadow: active ? `0 4px 16px ${card.color}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: c.textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: card.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: c.text, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '12px', color: c.textLight, marginTop: '4px' }}>{card.sub}</div>
            </div>
          )
        })}
      </div> */}

      {/* ── Table Card ── */}
      <div style={{ background: c.surface, borderRadius: '16px', border: `1.5px solid ${c.border}`, overflow: 'hidden' }}>

        {/* Filters */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {([ { key: 'all', label: `All (${statusCounts.all})` },
                { key: 'PENDING',  label: `Pending (${statusCounts.PENDING})`  },
                { key: 'APPROVED', label: `Approved (${statusCounts.APPROVED})` },
                { key: 'REJECTED', label: `Rejected (${statusCounts.REJECTED})` },
              ] as Array<{ key: 'all' | LenaDenaStatus; label: string }>).map(f => (
              <button key={f.key} className="ld-pill-btn"
                onClick={() => setStatusFilter(f.key)}
                style={{
                  background: statusFilter === f.key ? c.primary : c.background,
                  color:      statusFilter === f.key ? 'white'   : c.textLight,
                  border:     `1.5px solid ${statusFilter === f.key ? c.primary : c.border}`,
                }}
              >{f.label}</button>
            ))}
          </div>
          <div style={{ width: '1px', height: '28px', background: c.border }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            {([ { key: 'all',  label: 'All Types' },
                { key: 'lena', label: 'Lena' },
                { key: 'dena', label: 'Dena' },
              ] as Array<{ key: 'all' | LenaDenaType; label: string }>).map(f => (
              <button key={f.key} className="ld-pill-btn"
                onClick={() => setTypeFilter(f.key)}
                style={{
                  background: typeFilter === f.key
                    ? (f.key === 'lena' ? '#10B981' : f.key === 'dena' ? '#EF4444' : c.primary)
                    : c.background,
                  color:  typeFilter === f.key ? 'white' : c.textLight,
                  border: `1.5px solid ${typeFilter === f.key ? (f.key === 'lena' ? '#10B981' : f.key === 'dena' ? '#EF4444' : c.primary) : c.border}`,
                }}
              >{f.label}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: c.textLight }}>
            {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="ld-table">
            <thead>
              <tr style={{ background: c.background, borderBottom: `1.5px solid ${c.border}` }}>
                {['#', 'Party', 'Amount', 'Type', 'Date', 'Remark', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ color: c.textLight }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: c.textLight }}>
                    No entries found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((entry, idx) => {
                  const sc  = statusConfig[entry.status]
                  const tc  = typeConfig[entry.type]
                  const row = (ldPage - 1) * PAGE_SIZE + idx + 1
                  return (
                    <tr key={entry._id} style={{ borderBottom: `1px solid ${c.border}` }}>
                      <td style={{ color: c.textLight, fontWeight: '500' }}>{row}</td>
                      <td style={{ fontWeight: '600', color: c.text }}>
                        {entry.partyId ? entry.partyId.name : <span style={{ color: c.textLight }}>—</span>}
                        {entry.partyId && <div style={{ fontSize: '11px', color: c.textLight, fontWeight: '400' }}>{entry.partyId.mobile}</div>}
                      </td>
                      <td style={{ fontWeight: '700', color: entry.type === 'lena' ? '#10B981' : '#EF4444', fontSize: '15px' }}>
                        {formatCurrency(entry.amount)}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: tc.bg, color: tc.color }}>
                          {entry.type === 'lena' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          {tc.label}
                        </span>
                      </td>
                      <td style={{ color: c.text, whiteSpace: 'nowrap' }}>{formatDate(entry.date)}</td>
                      <td style={{ color: c.textLight, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.remark ?? ''}>
                        {entry.remark || '—'}
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                        {entry.rejectRemark && (
                          <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '3px' }} title={entry.rejectRemark}>
                            {entry.rejectRemark.length > 24 ? entry.rejectRemark.slice(0, 24) + '…' : entry.rejectRemark}
                          </div>
                        )}
                      </td>
                      <td>
                        {entry.status === 'PENDING' ? (
                          <div style={{ display: 'inline-flex', border: `1.5px solid ${c.border}`, borderRadius: '9px', overflow: 'hidden', opacity: (approvingId === entry._id || !!rejectingId) ? 0.6 : 1 }}>
                            <button
                              disabled={!!approvingId || !!rejectingId}
                              onClick={() => setConfirmApprove(entry)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', border: 'none', borderRight: `1.5px solid ${c.border}`,
                                background: approvingId === entry._id ? '#10B98108' : 'transparent',
                                color: '#10B981', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                              }}
                            >
                              {approvingId === entry._id ? <SpinnerIcon /> : <CheckIcon />}
                              {approvingId === entry._id ? 'Approving…' : 'Approve'}
                            </button>
                            <button
                              disabled={!!approvingId || !!rejectingId}
                              onClick={() => { setRejectModal(entry); setRejectRemark('') }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', border: 'none',
                                background: 'transparent',
                                color: '#EF4444', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                              }}
                            >
                              <BanIcon /> Reject
                            </button>
                          </div>
                        ) : entry.status === 'APPROVED' ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '9px', background: '#10B98118', color: '#10B981', fontSize: '12px', fontWeight: '600' }}>
                            <CheckIcon /> Approved
                          </div>
                        ) : (
                          <div title={entry.rejectRemark || 'Rejected'} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '9px', background: '#EF444418', color: '#EF4444', fontSize: '12px', fontWeight: '600' }}>
                            <BanIcon /> Rejected
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: c.textLight }}>
              Page {ldPage} of {ldTotalPages} · {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={ldPage <= 1}
                onClick={() => setLdPage(p => p - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', border: `1.5px solid ${c.border}`, borderRadius: '8px', background: c.background, color: c.text, fontWeight: '600', fontSize: '13px', cursor: ldPage <= 1 ? 'not-allowed' : 'pointer', opacity: ldPage <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeftIcon /> Prev
              </button>
              <button
                disabled={ldPage >= ldTotalPages}
                onClick={() => setLdPage(p => p + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', border: `1.5px solid ${c.border}`, borderRadius: '8px', background: c.background, color: c.text, fontWeight: '600', fontSize: '13px', cursor: ldPage >= ldTotalPages ? 'not-allowed' : 'pointer', opacity: ldPage >= ldTotalPages ? 0.4 : 1 }}
              >
                Next <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Approve Modal ── */}
      {confirmApprove && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setConfirmApprove(null)}>
          <div style={{ background: c.surface, borderRadius: '16px', maxWidth: '380px', width: '100%', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10B98118', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#10B981' }}>
                <ShieldCheckIcon />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: c.text }}>Confirm Approval</h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: c.textLight }}>
                {confirmApprove.partyId ? confirmApprove.partyId.name : 'This entry'} — <strong style={{ color: entryColor(confirmApprove.type) }}>{formatCurrency(confirmApprove.amount)}</strong>
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#EF4444' }}>This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmApprove(null)}
                style={{ flex: 1, padding: '11px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: 'transparent', color: c.text, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleApprove(confirmApprove)}
                style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: '#10B981', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => { setRejectModal(null); setRejectRemark('') }}>
          <div style={{ background: c.surface, borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: c.text }}>Reject Entry</h3>
              <button onClick={() => { setRejectModal(null); setRejectRemark('') }}
                style={{ background: 'transparent', border: 'none', color: c.textLight, cursor: 'pointer', display: 'flex' }}><XIcon /></button>
            </div>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: c.textLight }}>
              {rejectModal.partyId?.name || 'Entry'} · <strong>{formatCurrency(rejectModal.amount)}</strong> — Provide a reason for rejection.
            </p>
            <label style={labelStyle}>Rejection Remark <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea
              value={rejectRemark}
              onChange={e => setRejectRemark(e.target.value)}
              placeholder="e.g. Amount mismatch, verify karo"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', marginBottom: '18px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setRejectModal(null); setRejectRemark('') }}
                style={{ flex: 1, padding: '11px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: 'transparent', color: c.text, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!rejectingId}
                style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '10px', background: '#EF4444', color: 'white', fontWeight: '700', fontSize: '14px', cursor: rejectingId ? 'not-allowed' : 'pointer', opacity: rejectingId ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {rejectingId ? <><SpinnerIcon /> Rejecting…</> : <><BanIcon /> Confirm Reject</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Entry Modal ── */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={resetForm}>
          <div style={{ background: c.surface, borderRadius: '18px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: c.text }}>Add Lena-Dena Entry</h3>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: c.textLight }}>Record a new borrowing or lending</p>
              </div>
              <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: c.textLight, cursor: 'pointer', display: 'flex' }}><XIcon /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px' }}>

              {/* Type toggle */}
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Entry Type <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'flex', border: `1.5px solid ${c.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {(['lena', 'dena'] as LenaDenaType[]).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{
                        flex: 1, padding: '10px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                        background: form.type === t ? (t === 'lena' ? '#10B981' : '#EF4444') : 'transparent',
                        color:      form.type === t ? 'white' : c.textLight,
                      }}>
                      {t === 'lena' ? '↑ Lena (To Receive)' : '↓ Dena (To Give)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Party */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Party (Optional)</label>
                <select value={form.partyId} onChange={e => setForm(f => ({ ...f, partyId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">— Select Party —</option>
                  {parties.map(p => (
                    <option key={p._id} value={p._id}>{p.name} · {p.mobile}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Amount (₹) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="number" min="1" placeholder="0"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Date <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Remark */}
              <div style={{ marginBottom: '22px' }}>
                <label style={labelStyle}>Remark (Optional)</label>
                <input type="text" placeholder="e.g. tea ka paisa"
                  value={form.remark}
                  onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={resetForm}
                  style={{ flex: 1, padding: '12px', border: `1.5px solid ${c.border}`, borderRadius: '10px', background: 'transparent', color: c.text, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={submitting}
                  style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '10px', background: form.type === 'lena' ? '#10B981' : '#EF4444', color: 'white', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 4px 14px ${form.type === 'lena' ? '#10B98144' : '#EF444444'}` }}>
                  {submitting ? <><SpinnerIcon /> Adding…</> : <><PlusIcon /> Add {form.type === 'lena' ? 'Lena' : 'Dena'} Entry</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


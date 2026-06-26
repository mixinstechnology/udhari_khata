import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { toast } from 'react-toastify'
import { useTheme } from '../contexts/ThemeContext'
import { getPendingParties, getPartyDetails } from '../services/report.service'
import { approveTransaction, rejectTransaction } from '../services/transaction.service'
import type { PendingParty, PartyDetailTransaction } from '../types/report.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
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
const ScaleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M3 15l9 7 9-7"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const ArrowUpDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/><polyline points="17 8 12 3 7 8"/>
    <polyline points="17 16 12 21 7 16"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val: number) =>
  `₹${val?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const getStoredUser = (): { _id: string; name: string; company: string } => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: 'User', company: '' } }
}

const displayTxDate = (dateStr: string): string => {
  if (!dateStr) return '—'
  if (/^\d{4}-/.test(dateStr)) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return dateStr
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Report() {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()

  const [parties, setParties] = useState<PendingParty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'currentBalance' | 'pendingToCollect' | 'pendingToPay'>('currentBalance')
  const [sortAsc, setSortAsc] = useState(false)

  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
  const [selectedPartyName, setSelectedPartyName] = useState('')
  const [selectedParty, setSelectedParty] = useState<PendingParty | null>(null)
  const [details, setDetails] = useState<PartyDetailTransaction[] | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const fetchParties = useCallback(async () => {
    if (!user._id) return
    setLoading(true)
    try {
      const res = await getPendingParties(user._id)
      if (res.success) setParties(Array.isArray(res.data) ? res.data : [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [user._id])

  useEffect(() => { fetchParties() }, [fetchParties])

  const loadDetails = useCallback(async (partyId: string, createdBy: string) => {
    setDetails(null)
    setDetailsError(null)
    setDetailsLoading(true)
    try {
      const res = await getPartyDetails(createdBy, partyId)
      if (res.success) {
        setDetails(res.data)
      } else {
        const msg = res.message || 'Failed to fetch party details'
        setDetailsError(msg)
        toast.error(msg)
      }
    } catch {
      setDetailsError('Failed to load party details. Please try again.')
    } finally {
      setDetailsLoading(false)
    }
  }, [])

  const openDetails = (party: PendingParty) => {
    setSelectedPartyId(party.partyId)
    setSelectedPartyName(party.name)
    setSelectedParty(party)
    loadDetails(party.partyId, user._id)
  }

  const closeDetails = () => {
    setSelectedPartyId(null)
    setSelectedParty(null)
    setDetails(null)
    setDetailsError(null)
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(a => !a)
    else { setSortField(field); setSortAsc(false) }
  }

  // ── Derived ──

  const filtered = parties
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search) 
      // (p.area || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = a[sortField] - b[sortField]
      return sortAsc ? diff : -diff
    })

  const totalCredit    = parties.reduce((s, p) => s + (p.pendingToCollect || 0), 0)
  const totalDebit     = parties.reduce((s, p) => s + (p.pendingToPay || 0), 0)
  const totalNet       = parties.reduce((s, p) => s + (p.currentBalance || 0), 0)

  const summaryCards = [
    { label: 'Parties with Balance', value: String(parties.length), icon: <UsersIcon />, color: c.primary, grad: `linear-gradient(135deg,${c.primary},${c.secondary})` },
    { label: 'Total Credit ', value: formatCurrency(totalCredit), icon: <TrendingUpIcon />, color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)' },
    { label: 'Total Debit ', value: formatCurrency(totalDebit), icon: <TrendingDownIcon />, color: '#EF4444', grad: 'linear-gradient(135deg,#EF4444,#DC2626)' },
    { label: 'Net Outstanding', value: formatCurrency(Math.abs(totalNet)), icon: <ScaleIcon />, color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  ]

  const labelStyle: CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '700', color: c.textLight,
    marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase',
  }

  const thCol: CSSProperties = {
    padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700',
    color: c.textLight, letterSpacing: '0.5px', textTransform: 'uppercase',
    borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap', background: `${c.primary}06`,
  }

  const SortBtn = ({ field }: { field: typeof sortField }) => (
    <button onClick={() => toggleSort(field)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortField === field ? c.primary : c.textLight, display: 'inline-flex', alignItems: 'center', padding: '0 0 0 4px', verticalAlign: 'middle', transition: 'color 0.2s' }}
    >
      <ArrowUpDownIcon />
    </button>
  )

  const txStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:  { label: 'Pending',  bg: '#F59E0B18', color: '#F59E0B' },
    APPROVED: { label: 'Approved', bg: '#10B98118', color: '#10B981' },
    REJECTED: { label: 'Rejected', bg: '#EF444418', color: '#EF4444' },
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(245,158,11,0.35)' }}>
            <FileTextIcon />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: c.text }}>Pending Party Report</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>Parties with pending to collect or pending to pay balances</p>
          </div>
        </div>
        <button onClick={fetchParties}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 14px ${c.primary}35` }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${c.primary}45` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${c.primary}35` }}
        >
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="rpt-summary-grid">
        {summaryCards.map((card, i) => (
          <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${card.color}20` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: card.grad }} />
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.grad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 5px 14px ${card.color}35`, marginBottom: '12px' }}>
              {card.icon}
            </div>
            <p style={{ margin: '0 0 3px', fontSize: '11px', color: c.textLight, fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{card.label}</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Table ── */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: c.textLight }}>
            {loading ? 'Loading…' : `Showing ${filtered.length} of ${parties.length} parties`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1.5px solid ${c.border}`, borderRadius: '8px', padding: '7px 12px', background: c.background }}>
            <span style={{ color: c.textLight, display: 'flex' }}><SearchIcon /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, mobile, or area…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: c.text, fontFamily: 'inherit', width: '220px' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={thCol}>#</th>
                <th style={thCol}>Party</th>
                <th style={thCol}>Mobile</th>
                
                <th style={thCol}>
                 Pending ToCollect  <SortBtn field="pendingToCollect" />
                </th>
                <th style={thCol}>
                 ToPay  <SortBtn field="pendingToPay" />
                </th>
                <th style={thCol}>
                  Current Balance <SortBtn field="currentBalance" />
                </th>
                <th style={thCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ height: '13px', background: c.border, borderRadius: '4px', animation: 'rptPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                      </td>
                    ))}</tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr><td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: c.textLight }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${c.border}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextIcon /></div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text }}>
                          {search ? `No parties match "${search}"` : 'No pending dues found'}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px' }}>All balances are settled</p>
                      </div>
                    </td></tr>
                  )
                : filtered.map((party, idx) => {
                    const netColor = party.currentBalance > 0 ? '#10B981' : party.currentBalance < 0 ? '#EF4444' : c.textLight
                    return (
                      <tr key={party.partyId}
                        onMouseEnter={e => e.currentTarget.style.background = `${c.primary}06`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontWeight: '500' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                              {party.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', color: c.text }}>{party.name}</p>
                              {party.email && <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>{party.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.text }}>{party?.mobile}</td>
                        {/* <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight }}>{party.area || '—'}</td> */}
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: '#10B981', fontWeight: '700' }}>
                          {formatCurrency(party?.pendingToCollect)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: '#EF4444', fontWeight: '700' }}>
                          {formatCurrency(party.pendingToPay)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ fontWeight: '800', fontSize: '14px', color: netColor }}>
                            {party.currentBalance >= 0 ? '' : '- '}{formatCurrency(Math.abs(party.currentBalance))}
                          </span>
                          <span style={{ fontSize: '10px', marginLeft: '4px', color: netColor, opacity: 0.7 }}>
                            {party.currentBalance > 0 ? 'CR' : party.currentBalance < 0 ? 'DR' : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <button onClick={() => openDetails(party)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#F59E0B12', color: '#D97706', border: '1px solid #F59E0B30', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.color = 'white' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F59E0B12'; e.currentTarget.style.color = '#D97706' }}
                          >
                            <EyeIcon /> View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Party Details Modal ── */}
      {selectedPartyId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'rptFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closeDetails() }}
        >
          <div className="rpt-modal" style={{ background: c.surface, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'rptSlideUp 0.25s ease' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(245,158,11,0.07),transparent)', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: c.text }}>{selectedPartyName}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>Party transaction history & balance summary</p>
              </div>
              <button onClick={closeDetails}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: `${c.border}60`, color: c.textLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.error}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${c.border}60`}
              ><XIcon /></button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {detailsLoading ? (
                <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: c.textLight }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid ${c.primary}30`, borderTopColor: c.primary, animation: 'rptSpin 0.8s linear infinite' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Loading party details…</p>
                </div>
              ) : detailsError ? (
                <div style={{ padding: '48px', textAlign: 'center', color: c.textLight }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${c.error}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <XIcon />
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: c.text }}>Could not load party details</p>
                  <p style={{ margin: '0 0 20px', fontSize: '12px' }}>{detailsError}</p>
                  <button
                    onClick={() => selectedParty && loadDetails(selectedParty.partyId, user._id)}
                    style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    Retry
                  </button>
                </div>
              ) : details ? (() => {
                  const partyInfo = details[0]?.partyId
                  const totalCredit = details.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
                  const totalDebit  = details.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
                  const netBal = selectedParty?.currentBalance ?? (totalCredit - totalDebit)
                  return (
                    <>
                      {/* Party info */}
                      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}` }}>
                        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: '#F59E0B', letterSpacing: '1px', textTransform: 'uppercase' }}>Party Information</p>
                        <div className="rpt-info-grid">
                          {[
                            { label: 'Name',   value: partyInfo?.name   || selectedPartyName },
                            { label: 'Mobile', value: partyInfo?.mobile  || selectedParty?.mobile || '—' },
                            { label: 'Email',  value: partyInfo?.email   || selectedParty?.email  || '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <label style={labelStyle}>{label}</label>
                              <p style={{ margin: 0, fontSize: '13px', color: c.text, fontWeight: '500' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial summary */}
                      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Pending To Collect', value: formatCurrency(selectedParty?.pendingToCollect ?? totalCredit), color: '#10B981' },
                          { label: 'Pending To Pay',     value: formatCurrency(selectedParty?.pendingToPay     ?? totalDebit),  color: '#EF4444' },
                          { label: 'Current Balance',    value: `${netBal >= 0 ? '' : '- '}${formatCurrency(Math.abs(netBal))}`, color: '#F59E0B' },
                        ].map(card => (
                          <div key={card.label} style={{ flex: 1, minWidth: '130px', background: `${card.color}08`, border: `1px solid ${card.color}20`, borderRadius: '10px', padding: '14px 16px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: card.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: card.color }}>{card.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Transaction list */}
                      <div>
                        <div style={{ padding: '14px 24px 10px', borderBottom: `1px solid ${c.border}` }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: c.text }}>
                            Transaction History
                            <span style={{ fontSize: '11px', fontWeight: '500', color: c.textLight, marginLeft: '8px' }}>({details.length} records)</span>
                          </p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ background: `${c.primary}06` }}>
                                {['#', 'Amount', 'Type', 'Mode', 'Date', 'Status', 'Remark'].map(h => (
                                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: c.textLight, letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {details.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '32px 24px', textAlign: 'center', color: c.textLight, fontSize: '13px' }}>
                                  No transactions found for this party
                                </td></tr>
                              ) : details.map((tx, i) => {
                                const sc = txStatusConfig[tx.status.toUpperCase()] || { label: tx.status, bg: `${c.border}60`, color: c.textLight }
                                return (
                                  <tr key={tx._id}
                                    onMouseEnter={e => e.currentTarget.style.background = `${c.primary}05`}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight }}>{i + 1}</td>
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, fontWeight: '700', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                                      {formatCurrency(tx.amount)}
                                    </td>
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
                                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: tx.type === 'credit' ? '#10B98118' : '#EF444418', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                                        {tx.type === 'credit' ? 'CR' : 'DR'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
                                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: `${c.border}60`, color: c.textLight }}>
                                        {tx.paymentMode}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, whiteSpace: 'nowrap' }}>
                                      {displayTxDate(tx.transactionDate)}
                                    </td>
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
                                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: sc.bg, color: sc.color }}>
                                        {sc.label}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {tx.remark || '—'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )
                })()
              : null}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'flex-end', background: c.background, flexShrink: 0 }}>
              <button onClick={closeDetails}
                style={{ padding: '9px 22px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rptPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes rptFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes rptSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rptSpin { to{transform:rotate(360deg)} }

        .rpt-summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .rpt-modal { width:100%; max-width:820px; max-height:90vh; border-radius:16px; }
        .rpt-info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

        @media(max-width:1024px) { .rpt-summary-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:768px) {
          .rpt-summary-grid{grid-template-columns:repeat(2,1fr);}
          .rpt-modal{max-width:96vw;max-height:94vh;border-radius:14px;}
          .rpt-info-grid{grid-template-columns:repeat(2,1fr);}
        }
        @media(max-width:480px) {
          .rpt-summary-grid{grid-template-columns:1fr;}
          .rpt-modal{max-width:100vw;max-height:100vh;border-radius:0;}
          .rpt-info-grid{grid-template-columns:1fr;}
        }
      `}</style>
    </div>
  )
}

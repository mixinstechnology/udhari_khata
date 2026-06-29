import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { toast } from 'react-toastify'
import { useTheme } from '../contexts/ThemeContext'
import {
  getPartyWiseBalance,
  getPartyBalance,
  getPartyTransactions,
} from '../services/report.service'
import {
  PartyWiseBalance,
  PartyBalanceData,
  PartyTransactionItem,
} from '../types/report.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
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
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val: number) =>
  `₹${(val ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const getStoredUser = (): { _id: string; name: string; company: string } => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: 'User', company: '' } }
}


const getMonthStart = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-01`
}
const getToday = () => new Date().toISOString().split('T')[0]

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const txDate = (item: PartyTransactionItem) => item.transactionDate || item.date || ''

const balColor = (b: number) => b > 0 ? '#10B981' : b < 0 ? '#EF4444' : '#6B7280'

// ─── PDF Download ─────────────────────────────────────────────────────────────

const downloadPDF = (
  bal: PartyBalanceData | null,
  partyName: string,
  txs: PartyTransactionItem[],
  fromDate: string,
  toDate: string,
) => {
  const name    = bal?.party.name    || partyName
  const mobile  = bal?.party.mobile  || '—'
  const area    = bal?.party.area    || '—'
  const address = bal?.party.address || ''
  const today   = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const balance = formatCurrency(Math.abs(bal?.currentBalance ?? 0))
  const balType = (bal?.balanceType ?? 'nil').toUpperCase()

  const typeColor = (t: string) => ['credit','lena'].includes(t) ? '#16a34a' : '#dc2626'
  const typeLabel = (t: string) => ['credit','lena'].includes(t) ? 'CR' : 'DR'

  const rows = txs.map((tx, i) => {
    const tc = typeColor(tx.type)
    const sKey = tx.status.toUpperCase()
    const sc = sKey === 'APPROVED' ? '#16a34a' : sKey === 'REJECTED' ? '#dc2626' : '#d97706'
    return `
      <tr class="${i % 2 === 0 ? 'even' : ''}">
        <td>${i + 1}</td>
        <td style="font-weight:700;color:${tc}">${formatCurrency(tx.amount)}</td>
        <td><span class="badge" style="background:${tc}18;color:${tc}">${typeLabel(tx.type)}</span></td>
        <td><span class="badge" style="background:#f3f4f6;color:#374151">${tx.paymentMode || '—'}</span></td>
        <td>${formatDate(txDate(tx))}</td>
        <td><span class="badge" style="background:${sc}18;color:${sc}">${sKey}</span></td>
        <td class="remark">${tx.remark || '—'}</td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${name} — Party Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',sans-serif;font-size:12px;color:#111827;background:#fff;padding:28px 32px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #f59e0b}
  .brand{font-size:20px;font-weight:800;color:#d97706} .brand span{display:block;font-size:11px;font-weight:500;color:#6b7280;margin-top:2px}
  .meta{text-align:right;font-size:11px;color:#6b7280;line-height:1.6}
  .section-title{font-size:10px;font-weight:700;color:#f59e0b;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
  .fin-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px}
  .fin-card{border-radius:8px;padding:10px 12px;border:1px solid}
  .fin-card .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
  .fin-card .value{font-size:14px;font-weight:800}
  .green{background:#f0fdf4;border-color:#bbf7d0;color:#16a34a}
  .red{background:#fef2f2;border-color:#fecaca;color:#dc2626}
  .gold{background:#fffbeb;border-color:#fde68a;color:#d97706}
  .blue{background:#eff6ff;border-color:#bfdbfe;color:#2563eb}
  .purple{background:#faf5ff;border-color:#e9d5ff;color:#7c3aed}
  .date-badge{display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;margin-bottom:14px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#1f2937;color:#fff}
  thead th{padding:9px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}
  tbody td{padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:11px;vertical-align:middle}
  tr.even td{background:#fafafa}
  .badge{display:inline-block;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700}
  .remark{color:#6b7280;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .footer{margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af}
  @media print{body{padding:10px 14px}@page{margin:10mm;size:A4 landscape}}
</style></head><body>
  <div class="header">
    <div><div class="brand">Udhari Khata<span>Smart Ledger Management</span></div></div>
    <div class="meta">
      <div style="font-size:14px;font-weight:700;color:#111827">${name}</div>
      <div>${mobile}${area && area !== '—' ? ' · ' + area : ''}</div>
      ${address ? `<div>${address}</div>` : ''}
      <div>Generated: ${today}</div>
    </div>
  </div>
  <div class="section-title">Financial Summary</div>
  <div class="fin-grid">
   
    <div class="fin-card blue"> <div class="label">Payment Received</div><div class="value">${formatCurrency(bal?.totalPaymentReceived ?? 0)}</div></div>
    <div class="fin-card purple"><div class="label">Payment Paid</div><div class="value">${formatCurrency(bal?.totalPaymentPaid ?? 0)}</div></div>
    <div class="fin-card gold"> <div class="label">Current Balance</div><div class="value">${balance} </div></div>
  </div>
  <div class="section-title">Transaction History</div>
  <div class="date-badge">${fromDate} → ${toDate} · ${txs.length} transaction${txs.length !== 1 ? 's' : ''}</div>
  <table>
    <thead><tr><th>#</th><th>Amount</th><th>Type</th><th>Mode</th><th>Date</th><th>Status</th><th>Remark</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#9ca3af">No transactions in this period</td></tr>'}</tbody>
  </table>
  <div class="footer"><span>Udhari Khata — Party Report</span><span>Printed on ${today}</span></div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
</body></html>`

  const win = window.open('', '_blank', 'width=1000,height=750')
  if (win) { win.document.write(html); win.document.close() }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Report() {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()

  // ── Party list ──
  const [parties,    setParties]    = useState<PartyWiseBalance[]>([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [listPage,   setListPage]   = useState(1)
  const LIST_LIMIT = 5000
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'currentBalance'>('currentBalance')
  const [sortAsc,   setSortAsc]   = useState(false)

  // ── Detail modal ──
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState('')
  const [balanceData,  setBalanceData]  = useState<PartyBalanceData | null>(null)
  const [txData,       setTxData]       = useState<PartyTransactionItem[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError,   setModalError]   = useState<string | null>(null)
  const [fromDate,     setFromDate]     = useState(getMonthStart())
  const [toDate,       setToDate]       = useState(getToday())

  // ── Fetch party list ──
  const fetchParties = useCallback(async (page = listPage) => {
    setLoading(true)
    try {
      const res = await getPartyWiseBalance({ page, limit: LIST_LIMIT })
      if (res.success) {
        setParties(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
        setListPage(page)
      }
    } catch { toast.error('Failed to fetch party balances') }
    finally { setLoading(false) }
  }, [listPage])

  useEffect(() => { fetchParties(1) }, [user._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load party detail ──
  const loadDetail = useCallback(async (partyId: string, from: string, to: string) => {
    if (!partyId) return
    setModalLoading(true); setModalError(null); setTxData([])
    try {
      const [balRes, txRes] = await Promise.all([
        getPartyBalance({ partyId, createdBy: user._id }),
        getPartyTransactions({ partyId, createdBy: user._id, fromDate: from, toDate: to }),
      ])
      if (balRes.success) setBalanceData(balRes.data)
      else { setModalError(balRes.message || 'Failed to load balance'); return }
      if (txRes.success) setTxData(txRes.data.transactions)
    } catch {
      setModalError('Failed to load party details. Please try again.')
    } finally { setModalLoading(false) }
  }, [user._id])

  const openDetail = (party: PartyWiseBalance) => {
    setSelectedId(party._id)
    setSelectedName(party.name)
    setBalanceData(null); setTxData([]); setModalError(null)
    const from = fromDate; const to = toDate
    loadDetail(party._id, from, to)
  }

  const closeDetail = () => {
    setSelectedId(null); setBalanceData(null); setTxData([]); setModalError(null)
  }

  const applyDateFilter = () => {
    if (selectedId) loadDetail(selectedId, fromDate, toDate)
  }

const totalPaymentReceived =txData?.filter((i)=>i.type=='credit').reduce((acc,i)=>i.amount + acc,0)
const totalPaymentPay =txData?.filter((i)=>i.type=='debit').reduce((acc,i)=>i.amount + acc,0)

  // ── Derived ──
  const filtered = parties
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.mobile.includes(search))
    .sort((a, b) => sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField])

  const totalReceivable = parties.filter(p => p.currentBalance > 0).reduce((s, p) => s + p.currentBalance, 0)
  const totalPayable    = parties.filter(p => p.currentBalance < 0).reduce((s, p) => s + Math.abs(p.currentBalance), 0)
  const netBalance      = parties.reduce((s, p) => s + p.currentBalance, 0)

  const summaryCards = [
    { label: 'Total Parties',  value: String(total),                icon: <UsersIcon />,        color: c.primary, grad: `linear-gradient(135deg,${c.primary},${c.secondary})` },
    { label: 'To Receive',     value: formatCurrency(totalReceivable), icon: <TrendingUpIcon />,   color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)' },
    { label: 'To Pay',         value: formatCurrency(totalPayable),    icon: <TrendingDownIcon />, color: '#EF4444', grad: 'linear-gradient(135deg,#EF4444,#DC2626)' },
    { label: 'Net Balance',    value: `${formatCurrency(Math.abs(netBalance))} ${netBalance >= 0 ? 'CR' : 'DR'}`, icon: <ScaleIcon />, color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  ]

  // ── Styles ──
  const labelStyle: CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '700', color: c.textLight,
    marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase',
  }
  const thCol: CSSProperties = {
    padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700',
    color: c.textLight, letterSpacing: '0.5px', textTransform: 'uppercase',
    borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap', background: `${c.primary}06`,
  }
  const txStatusCfg: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:  { label: 'Pending',  bg: '#F59E0B18', color: '#F59E0B' },
    APPROVED: { label: 'Approved', bg: '#10B98118', color: '#10B981' },
    REJECTED: { label: 'Rejected', bg: '#EF444418', color: '#EF4444' },
  }
  const inputSm: CSSProperties = {
    border: `1.5px solid ${c.border}`, borderRadius: '7px', padding: '6px 10px',
    fontSize: '12px', color: c.text, background: c.background, outline: 'none', fontFamily: 'inherit',
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(245,158,11,0.35)' }}>
            <FileTextIcon />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: c.text }}>Party Details</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>Party-wise balance and transaction history</p>
          </div>
        </div>
        <button onClick={() => fetchParties(1)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: `0 4px 14px ${c.primary}35` }}>
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* ── Summary Cards ── */}
      {/* <div className="rpt-summary-grid">
        {summaryCards.map((card, i) => (
          <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${card.color}20` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: card.grad }} />
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.grad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              {card.icon}
            </div>
            <p style={{ margin: '0 0 3px', fontSize: '11px', color: c.textLight, fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{card.label}</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div> */}

      {/* ── Table Card ── */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: c.textLight }}>
            {loading ? 'Loading…' : `Showing ${filtered.length} of ${total} parties`}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1.5px solid ${c.border}`, borderRadius: '8px', padding: '7px 12px', background: c.background }}>
            <span style={{ color: c.textLight, display: 'flex' }}><SearchIcon /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or mobile…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: c.text, fontFamily: 'inherit', width: '200px' }} />
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
                <th style={thCol}>Area</th>
                <th style={thCol}>
                  Current Balance
                  <button onClick={() => setSortAsc(a => !a)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textLight, display: 'inline-flex', alignItems: 'center', padding: '0 0 0 4px', verticalAlign: 'middle' }}>
                    <ArrowUpDownIcon />
                  </button>
                </th>
                <th style={thCol}>Type</th>
                <th style={thCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ height: '13px', background: c.border, borderRadius: '4px', animation: 'rptPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                      </td>
                    ))}</tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr><td colSpan={7} style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: c.textLight }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${c.border}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileTextIcon /></div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text }}>
                          {search ? `No parties match "${search}"` : 'No party balances found'}
                        </p>
                      </div>
                    </td></tr>
                  )
                : filtered.map((party, idx) => {
                    const bc = balColor(party.currentBalance)
                    const btLabel = party.balanceType === 'credit' ? 'CR' : party.balanceType === 'debit' ? 'DR' : 'NIL'
                    const btBg    = party.balanceType === 'credit' ? '#10B98118' : party.balanceType === 'debit' ? '#EF444418' : `${c.border}60`
                    const btColor = party.balanceType === 'credit' ? '#10B981' : party.balanceType === 'debit' ? '#EF4444' : c.textLight
                    return (
                      <tr key={party._id}
                        onMouseEnter={e => e.currentTarget.style.background = `${c.primary}06`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontWeight: '500' }}>
                          {(listPage - 1) * LIST_LIMIT + idx + 1}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                              {party.name.charAt(0).toUpperCase()}
                            </div>
                            <p style={{ margin: 0, fontWeight: '600', color: c.text }}>{party.name}</p>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.text }}>{party.mobile}</td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight }}>{party.area || '—'}</td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ fontWeight: '800', fontSize: '14px', color: bc }}>
                            {formatCurrency(Math.abs(party.currentBalance))}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: btBg, color: btColor }}>
                            {btLabel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <button onClick={() => openDetail(party)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: '#F59E0B12', color: '#D97706', border: '1.5px solid #F59E0B30', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#F59E0B' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F59E0B12'; e.currentTarget.style.color = '#D97706'; e.currentTarget.style.borderColor = '#F59E0B30' }}
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

        {/* Pagination */}
        {total > 0 && (
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: c.textLight }}>Page {listPage} of {totalPages} · {total} parties</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[{ label: '← Prev', disabled: listPage <= 1, fn: () => fetchParties(listPage - 1) },
                { label: 'Next →', disabled: listPage >= totalPages, fn: () => fetchParties(listPage + 1) }].map(btn => (
                <button key={btn.label} disabled={btn.disabled} onClick={btn.fn}
                  style={{ padding: '6px 14px', border: `1.5px solid ${c.border}`, borderRadius: '7px', background: c.background, color: c.text, fontSize: '12px', fontWeight: '600', cursor: btn.disabled ? 'not-allowed' : 'pointer', opacity: btn.disabled ? 0.4 : 1 }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Party Details Modal ── */}
      {selectedId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'rptFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closeDetail() }}>
          <div className="rpt-modal" style={{ background: c.surface, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'rptSlideUp 0.25s ease' }}>

            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(245,158,11,0.07),transparent)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', flexShrink: 0 }}>
                  {selectedName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: c.text }}>{selectedName}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: c.textLight }}>
                    {modalLoading ? 'Loading…' : balanceData ? `${balanceData.party.mobile} · ${balanceData.party.area || 'No area'}` : 'Party details'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {!modalLoading && balanceData && (
                  <button
                    onClick={() => downloadPDF(balanceData, selectedName, txData, fromDate, toDate)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 3px 10px #10B98130' }}>
                    <DownloadIcon /> Download PDF
                  </button>
                )}
                <button onClick={closeDetail}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: `${c.border}60`, color: c.textLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <XIcon />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {modalLoading ? (
                <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: c.textLight }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid ${c.primary}30`, borderTopColor: c.primary, animation: 'rptSpin 0.8s linear infinite' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Loading party details…</p>
                </div>
              ) : modalError ? (
                <div style={{ padding: '48px', textAlign: 'center', color: c.textLight }}>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: c.text }}>Could not load party details</p>
                  <p style={{ margin: '0 0 20px', fontSize: '12px' }}>{modalError}</p>
                  <button onClick={() => selectedId && loadDetail(selectedId, fromDate, toDate)}
                    style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Retry
                  </button>
                </div>
              ) : balanceData && (
                <>
                  {/* Balance Summary */}
                  <div style={{ padding: '16px 24px', borderBottom: `1px solid ${c.border}` }}>
                    <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: '700', color: '#F59E0B', letterSpacing: '1px', textTransform: 'uppercase' }}>Financial Summary</p>
                    <div className="rpt-fin-grid">
                      {[
                        // { label: 'Total Lena',       value: formatCurrency(balanceData.totalLena),             color: '#10B981' },
                        // { label: 'Total Dena',        value: formatCurrency(balanceData.totalDena),             color: '#EF4444' },
                        { label: 'Payment Received',  value: formatCurrency(totalPaymentReceived),  color: '#3B82F6' },
                        { label: 'Payment Paid',      value: formatCurrency(totalPaymentPay),      color: '#8B5CF6' },
                        { label: 'Current Balance',   value: `${formatCurrency(Math.abs(balanceData.currentBalance))} `, color: '#F59E0B' },
                      ].map(card => (
                        <div key={card.label} style={{ background: `${card.color}08`, border: `1px solid ${card.color}20`, borderRadius: '10px', padding: '12px 14px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '600', color: card.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                          <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: card.color }}>{card.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Party Info */}
                  <div style={{ padding: '14px 24px', borderBottom: `1px solid ${c.border}`, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                    {[
                      { label: 'Name',    value: balanceData.party.name },
                      { label: 'Mobile',  value: balanceData.party.mobile },
                      { label: 'Area',    value: balanceData.party.area    || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label style={labelStyle}>{label}</label>
                        <p style={{ margin: 0, fontSize: '13px', color: c.text, fontWeight: '500' }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Date filter + transaction table */}
                  <div>
                    <div style={{ padding: '12px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: `${c.primary}02` }}>
                      <CalendarIcon />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: c.textLight }}>Date Range:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputSm} />
                        <span style={{ fontSize: '12px', color: c.textLight }}>to</span>
                        <input type="date" value={toDate}   onChange={e => setToDate(e.target.value)}   style={inputSm} />
                        <button onClick={applyDateFilter}
                          style={{ padding: '6px 14px', background: c.primary, color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          Apply
                        </button>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: c.textLight, whiteSpace: 'nowrap' }}>
                        <strong style={{ color: c.text }}>{txData.length}</strong> transactions
                      </span>
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
                          {txData.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '32px 24px', textAlign: 'center', color: c.textLight, fontSize: '13px' }}>
                              No transactions found for this date range
                            </td></tr>
                          ) : txData.map((tx, i) => {
                            const isCr  = ['credit', 'lena'].includes(tx.type)
                            const sc    = txStatusCfg[tx.status.toUpperCase()] ?? { label: tx.status, bg: `${c.border}60`, color: c.textLight }
                            return (
                              <tr key={tx._id}
                                onMouseEnter={e => e.currentTarget.style.background = `${c.primary}05`}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight }}>{i + 1}</td>
                                <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, fontWeight: '700', color: isCr ? '#10B981' : '#EF4444' }}>
                                  {formatCurrency(tx.amount)}
                                </td>
                                <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
                                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: isCr ? '#10B98118' : '#EF444418', color: isCr ? '#10B981' : '#EF4444' }}>
                                    {isCr ? 'CR' : 'DR'}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
                                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: `${c.border}60`, color: c.textLight }}>
                                    {tx.paymentMode || '—'}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, whiteSpace: 'nowrap' }}>
                                  {formatDate(txDate(tx))}
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
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'flex-end', background: c.background, flexShrink: 0 }}>
              <button onClick={closeDetail}
                style={{ padding: '8px 22px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rptPulse  { 0%,100%{opacity:1}  50%{opacity:0.4} }
        @keyframes rptFadeIn { from{opacity:0}      to{opacity:1} }
        @keyframes rptSlideUp{ from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rptSpin   { to{transform:rotate(360deg)} }

        .rpt-summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .rpt-modal  { width:100%; max-width:900px; max-height:92vh; border-radius:16px; }
        .rpt-fin-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }

        @media(max-width:1280px){ .rpt-fin-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:1024px){ .rpt-summary-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:768px){
          .rpt-summary-grid{grid-template-columns:repeat(2,1fr);}
          .rpt-modal{max-width:96vw;max-height:96vh;border-radius:14px;}
          .rpt-fin-grid{grid-template-columns:repeat(2,1fr);}
        }
        @media(max-width:480px){
          .rpt-summary-grid{grid-template-columns:1fr;}
          .rpt-modal{max-width:100vw;max-height:100vh;border-radius:0;}
          .rpt-fin-grid{grid-template-columns:1fr;}
        }
      `}</style>
    </div>
  )
}

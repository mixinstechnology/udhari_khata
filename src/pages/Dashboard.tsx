import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-toastify'
import {
  getPartyList,
  addParty,
  updateParty,
} from '../services/party.service'
import {
  createTransaction,
  getTransactionList,
  approveTransaction,
  rejectTransaction,
} from '../services/transaction.service'
import {
  getAdminSummaryRange,
  getPartyWiseBalance,
} from '../services/report.service'
import type {
  Party,
  PartyPayload,
  UpdatePartyPayload,
} from '../types/party.types'
import type {
  Transaction,
  TransactionPayload,
  TransactionType,
  PaymentMode,
  TransactionStatus,
} from '../types/transaction.types'
import type { AdminSummaryRange, PartyWiseBalance } from '../types/report.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)
const TrendingDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
)
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const ScaleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M3 15l9 7 9-7"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
const ChevronLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const ChevronRightSmIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)
const SyncIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const XCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

const formatCurrency = (val: number) =>
  `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const getStoredUser = (): { _id: string; name: string; company: string } => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: 'User', company: '' } }
}

const todayISO = () => new Date().toISOString().split('T')[0]

const getMonthStart = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-01`
}

// Convert "2026-05-23" (date input) → "23-may-2026" (API format)
const formatTxDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d}-${MONTHS[m - 1]}-${y}`
}

// Display API date strings ("23-may-2026" or "2026-05-23T...") in human-readable form
const displayTxDate = (dateStr: string): string => {
  if (!dateStr) return '—'
  if (/^\d{4}-/.test(dateStr)) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return dateStr // already like "23-may-2026"
}

const getPartyName = (partyId: Transaction['partyId']): string => {
  if (typeof partyId === 'object' && partyId !== null) return partyId.name
  return '—'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTY_LIMIT = 8
const TX_LIMIT = 10

const EMPTY_PARTY_FORM: PartyPayload = {
  name: '', mobile: '', email: '', area: '', address: '',
  adharNumber: '', panNumber: '', gstNumber: '',
  creditLimit: 0, openingBalance: 0, openingBalanceType: 'credit',
  remark: '', isActive: true, isBlock: false, createdBy: '',
}

interface TxForm {
  partyId: string
  amount: string
  type: TransactionType
  paymentMode: PaymentMode
  transactionDate: string
  remark: string
}

const EMPTY_TX_FORM: TxForm = {
  partyId: '', amount: '', type: 'credit',
  paymentMode: 'CASH', transactionDate: todayISO(), remark: '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()
  const navigate = useNavigate()

  // ── Summary date range ──
  const [summaryFromDate] = useState(getMonthStart())
  const [summaryToDate]   = useState(todayISO())

  // ── Party state ──
  const [summary, setSummary] = useState<AdminSummaryRange | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [parties, setParties] = useState<Party[]>([])
  const [partyTotal, setPartyTotal] = useState(0)
  const [partyPages, setPartyPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [partyLoading, setPartyLoading] = useState(true)
  const [showPartyModal, setShowPartyModal] = useState(false)
  const [editingParty, setEditingParty] = useState<Party | null>(null)
  const [partyForm, setPartyForm] = useState<PartyPayload>({ ...EMPTY_PARTY_FORM, createdBy: user._id })
  const [partyFormErrors, setPartyFormErrors] = useState<Partial<Record<keyof PartyPayload, string>>>({})
  const [partySubmitting, setPartySubmitting] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Party balances state ──
  const [partyBalances, setPartyBalances] = useState<PartyWiseBalance[]>([])
  const [balancesLoading, setBalancesLoading] = useState(true)

  // ── Transaction state ──
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | TransactionType>('all')
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | TransactionStatus>('all')
  const [txPage, setTxPage] = useState(1)
  const [showTxModal, setShowTxModal] = useState(false)
  const [txForm, setTxForm] = useState<TxForm>({ ...EMPTY_TX_FORM })
  const [txErrors, setTxErrors] = useState<Partial<Record<keyof TxForm, string>>>({})
  const [txSubmitting, setTxSubmitting] = useState(false)
  const [modalParties, setModalParties] = useState<Party[]>([])
  const [modalPartiesLoading, setModalPartiesLoading] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingTx, setRejectingTx] = useState<Transaction | null>(null)
  const [rejectRemark, setRejectRemark] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  // ── Fetch functions ──

  const fetchSummary = useCallback(async () => {
    if (!user._id) return
    setSummaryLoading(true)
    try {
      const res = await getAdminSummaryRange({ createdBy: user._id, fromDate: summaryFromDate, toDate: summaryToDate })
      if (res.success) setSummary(res.data)
    } catch { /* handled */ }
    finally { setSummaryLoading(false) }
  }, [user._id, summaryFromDate, summaryToDate])

  const fetchParties = useCallback(async (page: number, q: string) => {
    if (!user._id) return
    setPartyLoading(true)
    try {
      const res = await getPartyList({ page, limit: PARTY_LIMIT, createdBy: user._id, search: q || undefined })
      if (res.success) {
        setParties(res.data.data)
        setPartyTotal(res.data.total)
        setPartyPages(res.data.totalPages)
      }
    } catch { /* handled */ }
    finally { setPartyLoading(false) }
  }, [user._id])

  const fetchTransactions = useCallback(async () => {
    if (!user._id) return
    setTxLoading(true)
    try {
      const res = await getTransactionList(user._id)
      if (res.success) setTransactions(Array.isArray(res.data) ? res.data : [])
    } catch { /* handled */ }
    finally { setTxLoading(false) }
  }, [user._id])

  const fetchPartyBalances = useCallback(async () => {
    setBalancesLoading(true)
    try {
      const res = await getPartyWiseBalance({ page: 1, limit: 5 })
      if (res.success) setPartyBalances(Array.isArray(res.data) ? res.data : [])
    } catch { /* handled */ }
    finally { setBalancesLoading(false) }
  }, [])

  const refreshAll = useCallback(() => {
    fetchSummary()
    fetchParties(currentPage, search)
    fetchTransactions()
    fetchPartyBalances()
  }, [fetchSummary, fetchParties, fetchTransactions, fetchPartyBalances, currentPage, search])

  useEffect(() => { fetchSummary() }, [fetchSummary])
  useEffect(() => { fetchParties(currentPage, search) }, [fetchParties, currentPage])
  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { fetchPartyBalances() }, [fetchPartyBalances])
  useEffect(() => { setTxPage(1) }, [txTypeFilter, txStatusFilter])

  // ── Party handlers ──

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setCurrentPage(1); fetchParties(1, val) }, 400)
  }

  const openAddPartyModal = () => {
    setEditingParty(null)
    setPartyForm({ ...EMPTY_PARTY_FORM, createdBy: user._id })
    setPartyFormErrors({})
    setShowPartyModal(true)
  }

  const openEditPartyModal = (party: Party) => {
    setEditingParty(party)
    setPartyForm({
      name: party.name, mobile: party.mobile, email: party.email || '',
      area: party.area || '', address: party.address || '',
      adharNumber: party.adharNumber || '', panNumber: party.panNumber || '',
      gstNumber: party.gstNumber || '', creditLimit: party.creditLimit ?? 0,
      openingBalance: party.openingBalance ?? 0,
      openingBalanceType: party.openingBalanceType ?? 'credit',
      remark: party.remark || '', isActive: party.isActive,
      isBlock: party.isBlock, createdBy: user._id,
    })
    setPartyFormErrors({})
    setShowPartyModal(true)
  }

  const closePartyModal = () => { setShowPartyModal(false); setEditingParty(null) }

  const setPartyField = (key: keyof PartyPayload, value: string | number | boolean) => {
    setPartyForm(prev => ({ ...prev, [key]: value }))
    if (partyFormErrors[key]) setPartyFormErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validatePartyForm = (): boolean => {
    const errs: Partial<Record<keyof PartyPayload, string>> = {}
    if (!partyForm.name.trim()) errs.name = 'Name is required'
    if (!partyForm.mobile.trim()) errs.mobile = 'Mobile is required'
    else if (!/^\d{10}$/.test(partyForm.mobile.trim())) errs.mobile = 'Enter valid 10-digit number'
    setPartyFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePartySubmit = async () => {
    if (!validatePartyForm()) return
    setPartySubmitting(true)
    try {
      if (editingParty) {
        const payload: UpdatePartyPayload = { name: partyForm.name.trim(), mobile: partyForm.mobile.trim(), area: partyForm.area?.trim(), isActive: partyForm.isActive, createdBy: user._id }
        const res = await updateParty(editingParty._id, payload)
        if (res.success) { toast.success(res.message || 'Party updated'); closePartyModal(); fetchParties(currentPage, search) }
      } else {
        const res = await addParty({ ...partyForm, name: partyForm.name.trim(), mobile: partyForm.mobile.trim(), createdBy: user._id })
        if (res.success) { toast.success(res.message || 'Party added'); closePartyModal(); setCurrentPage(1); fetchParties(1, search); fetchSummary() }
      }
    } catch { /* handled */ }
    finally { setPartySubmitting(false) }
  }

  // ── Transaction handlers ──

  const openTxModal = async () => {
    setTxForm({ ...EMPTY_TX_FORM, transactionDate: todayISO() })
    setTxErrors({})
    setShowTxModal(true)
    setModalPartiesLoading(true)
    try {
      const res = await getPartyList({ page: 1, limit: 200, createdBy: user._id })
      if (res.success) setModalParties(res.data.data)
    } catch { /* handled */ }
    finally { setModalPartiesLoading(false) }
  }

  const closeTxModal = () => { setShowTxModal(false) }

  const setTxField = <K extends keyof TxForm>(key: K, value: TxForm[K]) => {
    setTxForm(prev => ({ ...prev, [key]: value }))
    if (txErrors[key]) setTxErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validateTxForm = (): boolean => {
    const errs: Partial<Record<keyof TxForm, string>> = {}
    if (!txForm.partyId) errs.partyId = 'Select a party'
    if (!txForm.amount || isNaN(Number(txForm.amount)) || Number(txForm.amount) <= 0) errs.amount = 'Enter a valid amount'
    if (!txForm.transactionDate) errs.transactionDate = 'Select a date'
    setTxErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddTransaction = async () => {
    if (!validateTxForm()) return
    setTxSubmitting(true)
    try {
      const payload: TransactionPayload = {
        partyId: txForm.partyId,
        amount: Number(txForm.amount),
        type: txForm.type,
        paymentMode: txForm.paymentMode,
        transactionDate: formatTxDate(txForm.transactionDate),
        remark: txForm.remark.trim(),
        createdBy: user._id,
      }
      const res = await createTransaction(payload)
      if (res.success) {
        toast.success(res.message || 'Transaction added successfully')
        closeTxModal()
        fetchTransactions()
        fetchSummary()
      }
    } catch { /* handled */ }
    finally { setTxSubmitting(false) }
  }

  const handleApprove = async (txId: string) => {
    setApprovingId(txId)
    try {
      const res = await approveTransaction(txId, { userId: user._id })
      if (res.success) {
        toast.success(res.message || 'Transaction approved')
        fetchTransactions()
        fetchSummary()
      }
    } catch { /* handled */ }
    finally { setApprovingId(null) }
  }

  const openRejectModal = (tx: Transaction) => {
    setRejectingTx(tx)
    setRejectRemark('')
  }

  const handleReject = async () => {
    if (!rejectingTx) return
    if (!rejectRemark.trim()) { toast.error('Please enter a reject reason'); return }
    setRejectSubmitting(true)
    try {
      const res = await rejectTransaction(rejectingTx._id, { userId: user._id, rejectRemark: rejectRemark.trim() })
      if (res.success) {
        toast.success(res.message || 'Transaction rejected')
        setRejectingTx(null)
        setRejectRemark('')
        fetchTransactions()
        fetchSummary()
      }
    } catch { /* handled */ }
    finally { setRejectSubmitting(false) }
  }

  // ── Derived / config ──

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const filteredTx = transactions.filter(tx => {
    if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false
    return true
  })
  const txTotalPages = Math.ceil(filteredTx.length / TX_LIMIT)
  const paginatedTx = filteredTx.slice((txPage - 1) * TX_LIMIT, txPage * TX_LIMIT)

  const plColor = summary ? (summary.type === 'profit' ? '#10B981' : summary.type === 'loss' ? '#EF4444' : '#F59E0B') : '#F59E0B'
  const plGrad  = summary ? (summary.type === 'profit' ? 'linear-gradient(135deg,#10B981,#059669)' : summary.type === 'loss' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#F59E0B,#D97706)') : 'linear-gradient(135deg,#F59E0B,#D97706)'

  const statCards = summary ? [
    { label: 'Total Lena',    value: formatCurrency(summary.totalLena),    icon: <TrendingUpIcon />,   color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)' },
    { label: 'Total Dena',    value: formatCurrency(summary.totalDena),    icon: <TrendingDownIcon />, color: '#EF4444', grad: 'linear-gradient(135deg,#EF4444,#DC2626)' },
    { label: 'Net Receivable', value: formatCurrency(summary.netReceivable), icon: <InboxIcon />,       color: '#3B82F6', grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' },
    { label: 'Net Payable',   value: formatCurrency(summary.netPayable),   icon: <SendIcon />,         color: c.primary, grad: `linear-gradient(135deg,${c.primary},${c.secondary})` },
    { label: summary.type === 'profit' ? 'Profit' : summary.type === 'loss' ? 'Loss' : 'Net P&L', value: formatCurrency(summary.profitOrLoss), icon: <ScaleIcon />, color: plColor, grad: plGrad },
  ] : []

  const quickActions = [
    { label: 'Add Party', desc: 'Register a new trading partner', icon: <PlusCircleIcon />, color: '#10B981', grad: 'linear-gradient(135deg,#10B981,#059669)', action: openAddPartyModal },
    { label: 'Add Transaction', desc: 'Record a new credit or debit entry', icon: <ZapIcon />, color: c.primary, grad: `linear-gradient(135deg,${c.primary},${c.secondary})`, action: openTxModal },
    { label: 'Sync Data', desc: 'Refresh all dashboard metrics', icon: <SyncIcon />, color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#D97706)', action: refreshAll },
  ]

  const inputStyle = (hasError?: boolean): CSSProperties => ({
    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? c.error : c.border}`, borderRadius: '8px',
    fontSize: '13px', fontFamily: 'inherit', background: c.background, color: c.text,
    outline: 'none', transition: 'border-color 0.2s',
  })

  const labelStyle: CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '700', color: c.textLight,
    marginBottom: '5px', letterSpacing: '0.5px', textTransform: 'uppercase',
  }

  const filterPill = (active: boolean): CSSProperties => ({
    padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', border: 'none', transition: 'all 0.2s',
    background: active ? c.primary : `${c.border}60`,
    color: active ? 'white' : c.textLight,
  })

  const txStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:  { label: 'Pending',  bg: '#F59E0B18', color: '#F59E0B' },
    APPROVED: { label: 'Approved', bg: '#10B98118', color: '#10B981' },
    REJECTED: { label: 'Rejected', bg: '#EF444418', color: '#EF4444' },
  }

  const partyStartItem = (currentPage - 1) * PARTY_LIMIT + 1
  const partyEndItem   = Math.min(currentPage * PARTY_LIMIT, partyTotal)

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 55%, ${c.accent} 100%)`,
        borderRadius: '16px', padding: '28px 36px', color: 'white', marginBottom: '24px',
        boxShadow: `0 10px 32px ${c.primary}40`, position: 'relative', overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
          <defs><pattern id="dbHex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,2 58,18 58,34 30,50 2,34 2,18" fill="none" stroke="white" strokeWidth="1"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#dbHex)"/>
        </svg>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', right: '60px', bottom: '-60px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}/>

        <div className="db-welcome-row" style={{ position: 'relative' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', opacity: 0.75, fontWeight: '500', letterSpacing: '0.3px' }}>{greeting}</p>
            <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>{user.name || 'User'}</h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>{today}</p>
          </div>
          <div className="db-deco-svg" style={{ opacity: 0.18, pointerEvents: 'none', flexShrink: 0 }}>
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              <rect x="10" y="5" width="60" height="70" rx="6" fill="white"/>
              <rect x="16" y="18" width="30" height="3" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="16" y="26" width="40" height="3" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="16" y="34" width="24" height="3" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="16" y="42" width="36" height="3" rx="1.5" fill="white" opacity="0.5"/>
              <circle cx="80" cy="60" r="18" fill="white" opacity="0.12"/>
              <path d="M80 52v16M72 60h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <button onClick={refreshAll}
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s', backdropFilter: 'blur(8px)', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="dashboard-summary-grid">
        {summaryLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', height: '120px', animation: 'dbPulse 1.5s ease-in-out infinite' }} />
            ))
          : statCards.map((card, i) => (
              <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '20px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 28px ${card.color}22` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)' }}
              >
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: card.grad, borderRadius: '0 0 14px 14px' }}/>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.grad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${card.color}40`, marginBottom: '14px' }}>
                  {card.icon}
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: c.textLight, fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: card.color }}>{card.value}</p>
              </div>
            ))
        }
      </div>

      {/* ── Overview Insights ── */}
      <div className="db-insights-grid">

        {/* Party Balances Panel */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UsersIcon />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: c.text }}>Party Balances</h3>
                <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>
                  {balancesLoading ? 'Loading…' : `Top ${partyBalances.length} parties by balance`}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/report/dues')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: 'transparent', color: c.primary, border: `1.5px solid ${c.primary}30`, borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${c.primary}10`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View All <ArrowRightIcon />
            </button>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '8px 16px', background: `${c.primary}04`, borderBottom: `1px solid ${c.border}` }}>
            {['Party', 'Area', 'Balance', 'Type'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: '700', color: c.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: h === 'Party' ? 'left' : 'right' }}>{h}</span>
            ))}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {balancesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', alignItems: 'center' }}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <div key={j} style={{ height: '12px', background: c.border, borderRadius: '4px', animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                    ))}
                  </div>
                ))
              : partyBalances.length === 0
              ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: c.textLight }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: c.text }}>No party balances</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Add transactions to see balance data</p>
                  </div>
                )
              : partyBalances.map(party => {
                  const balColor = party.currentBalance > 0 ? '#10B981' : party.currentBalance < 0 ? '#EF4444' : c.textLight
                  const btLabel = party.balanceType === 'credit' ? 'CR' : party.balanceType === 'debit' ? 'DR' : 'NIL'
                  const btBg    = party.balanceType === 'credit' ? '#10B98118' : party.balanceType === 'debit' ? '#EF444418' : `${c.border}60`
                  const btColor = party.balanceType === 'credit' ? '#10B981' : party.balanceType === 'debit' ? '#EF4444' : c.textLight
                  return (
                    <div key={party._id}
                      style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '10px 16px', borderBottom: `1px solid ${c.border}`, alignItems: 'center', transition: 'background 0.15s', cursor: 'pointer' }}
                      onClick={() => navigate('/report/dues')}
                      onMouseEnter={e => e.currentTarget.style.background = `${c.primary}05`}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                          {party.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{party.name}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: c.textLight }}>{party.mobile}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: c.textLight, textAlign: 'right', whiteSpace: 'nowrap' }}>{party.area || '—'}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: balColor, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatCurrency(Math.abs(party.currentBalance))}
                      </span>
                      <span style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: btBg, color: btColor, textAlign: 'right', whiteSpace: 'nowrap', justifySelf: 'end' }}>
                        {btLabel}
                      </span>
                    </div>
                  )
                })
            }
          </div>

          {/* Summary footer */}
          {!balancesLoading && partyBalances.length > 0 && (
            <div style={{ padding: '10px 16px', background: `${c.primary}04`, borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: c.textLight }}>TOP {partyBalances.length} OF TOTAL</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B' }}>
                Net: {formatCurrency(Math.abs(partyBalances.reduce((s, p) => s + p.currentBalance, 0)))}
              </span>
            </div>
          )}
        </div>

        {/* Recent Activity Panel */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIcon />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: c.text }}>Recent Activity</h3>
                <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>
                  {txLoading ? 'Loading…' : `${transactions.length} total · ${transactions.filter(t => t.status === 'pending').length} pending approval`}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/transaction/add')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: 'transparent', color: '#8B5CF6', border: '1.5px solid #8B5CF630', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#8B5CF608'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View All <ArrowRightIcon />
            </button>
          </div>

          <div style={{ maxHeight: '368px', overflowY: 'auto' }}>
            {txLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: c.border, flexShrink: 0, animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '12px', background: c.border, borderRadius: '4px', animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                      <div style={{ height: '10px', background: c.border, borderRadius: '4px', width: '60%', animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.4 }} />
                    </div>
                    <div style={{ width: '60px', height: '14px', background: c.border, borderRadius: '4px', animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                  </div>
                ))
              : transactions.length === 0
              ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: c.textLight }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: c.text }}>No transactions yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Add a transaction to see activity here</p>
                  </div>
                )
              : transactions.slice(0, 8).map(tx => {
                  const sc = txStatusConfig[tx.status] || txStatusConfig.pending
                  const partyName = getPartyName(tx.partyId)
                  return (
                    <div key={tx._id}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${c.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#8B5CF605'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Avatar */}
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tx.type === 'credit' ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                        {partyName.charAt(0).toUpperCase() || '?'}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partyName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '10px', color: c.textLight }}>{displayTxDate(tx.transactionDate)}</span>
                          {tx.remark && <span style={{ fontSize: '10px', color: c.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>· {tx.remark}</span>}
                        </div>
                      </div>
                      {/* Amount + badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ padding: '1px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: '700', background: tx.type === 'credit' ? '#10B98118' : '#EF444418', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                            {tx.type === 'credit' ? 'CR' : 'DR'}
                          </span>
                          <span style={{ padding: '1px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: '700', background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="db-quick-actions">
        {quickActions.map((action, i) => (
          <button key={i} onClick={action.action}
            style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${action.color}20`; e.currentTarget.style.borderColor = `${action.color}50` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = c.border }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0, background: action.grad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${action.color}40` }}>
              {action.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: c.text }}>{action.label}</p>
              <p style={{ margin: 0, fontSize: '12px', color: c.textLight }}>{action.desc}</p>
            </div>
            <span style={{ color: c.textLight, flexShrink: 0 }}><ArrowRightIcon /></span>
          </button>
        ))}
      </div>

      {/* ── Party Table ── */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg,${c.primary},${c.accent})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UsersIcon /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: c.text }}>Recent Parties</h2>
              <p style={{ margin: 0, fontSize: '12px', color: c.textLight }}>{partyTotal > 0 ? `${partyTotal} ${partyTotal === 1 ? 'party' : 'parties'} registered` : 'No parties yet'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1.5px solid ${c.border}`, borderRadius: '8px', padding: '7px 12px', background: c.background }}>
              <span style={{ color: c.textLight, display: 'flex' }}><SearchIcon /></span>
              <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search parties..."
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: c.text, fontFamily: 'inherit', width: '160px' }} />
            </div>
            <button onClick={openAddPartyModal}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 12px ${c.primary}35` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${c.primary}45` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px ${c.primary}35` }}
            >
              <PlusIcon /> Add Party
            </button>
            <button onClick={() => navigate('/master/party')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'transparent', color: c.primary, border: `1.5px solid ${c.primary}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${c.primary}08`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View All <ArrowRightIcon />
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: `${c.primary}06` }}>
                {['#', 'Name', 'Mobile', 'Area', 'Credit Limit', 'Opening Bal.', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: c.textLight, letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partyLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ height: '13px', background: c.border, borderRadius: '4px', animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                      </td>
                    ))}</tr>
                  ))
                : parties.length === 0
                ? (
                    <tr><td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: c.textLight }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${c.border}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UsersIcon /></div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text }}>{search ? `No results for "${search}"` : 'No parties yet'}</p>
                        <p style={{ margin: 0, fontSize: '12px' }}>Click "Add Party" to get started</p>
                      </div>
                    </td></tr>
                  )
                : parties.map((party, idx) => (
                    <tr key={party._id}
                      onMouseEnter={e => e.currentTarget.style.background = `${c.primary}06`}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontWeight: '500' }}>{(currentPage - 1) * PARTY_LIMIT + idx + 1}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg,${c.primary},${c.accent})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                            {party.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: c.text }}>{party.name}</p>
                            {party.email && <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>{party.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.text }}>{party.mobile}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight }}>{party.area || '—'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.text, fontWeight: '600' }}>{party.creditLimit != null ? formatCurrency(party.creditLimit) : '—'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                        {party.openingBalance != null ? (
                          <span style={{ color: party.openingBalanceType === 'credit' ? '#10B981' : '#EF4444', fontWeight: '600' }}>
                            {formatCurrency(party.openingBalance)}
                            <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>({party.openingBalanceType === 'credit' ? 'CR' : 'DR'})</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: party.isActive ? '#10B98118' : '#EF444418', color: party.isActive ? '#10B981' : '#EF4444' }}>
                          {party.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <button onClick={() => openEditPartyModal(party)}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: `${c.primary}10`, color: c.primary, border: `1px solid ${c.primary}30`, borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = c.primary; e.currentTarget.style.color = 'white' }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${c.primary}10`; e.currentTarget.style.color = c.primary }}
                        >
                          <EditIcon /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {partyTotal > 0 && (
          <div style={{ padding: '13px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: c.textLight }}>
              Showing <strong style={{ color: c.text }}>{partyStartItem}–{partyEndItem}</strong> of <strong style={{ color: c.text }}>{partyTotal}</strong>
            </p>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: '5px 10px', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: `1px solid ${c.border}`, background: c.background, color: c.text, display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.4 : 1 }}>
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: Math.min(partyPages, 5) }).map((_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                  style={{ width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${currentPage === i + 1 ? c.primary : c.border}`, background: currentPage === i + 1 ? c.primary : c.background, color: currentPage === i + 1 ? 'white' : c.text, fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(partyPages, p + 1))} disabled={currentPage === partyPages}
                style={{ padding: '5px 10px', borderRadius: '6px', cursor: currentPage === partyPages ? 'not-allowed' : 'pointer', border: `1px solid ${c.border}`, background: c.background, color: c.text, display: 'flex', alignItems: 'center', opacity: currentPage === partyPages ? 0.4 : 1 }}>
                <ChevronRightSmIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Transaction Section ── */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ActivityIcon /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: c.text }}>Recent Transactions</h2>
              <p style={{ margin: 0, fontSize: '12px', color: c.textLight }}>
                {transactions.length > 0 ? `${transactions.length} total · ${transactions.filter(t => t.status === 'PENDING').length} pending` : 'No transactions yet'}
              </p>
            </div>
          </div>
          <button onClick={openTxModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139,92,246,0.35)', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(139,92,246,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.35)' }}
          >
            <PlusIcon /> Add Transaction
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: `${c.primary}03` }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: c.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>Type:</span>
          {(['all', 'credit', 'debit'] as const).map(f => (
            <button key={f} onClick={() => setTxTypeFilter(f)} style={filterPill(txTypeFilter === f)}>
              {f === 'all' ? 'All' : f === 'credit' ? 'Credit ' : 'Debit'}
            </button>
          ))}
          <div style={{ width: '1px', height: '20px', background: c.border, margin: '0 8px' }}/>
          <span style={{ fontSize: '11px', fontWeight: '700', color: c.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>Status:</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setTxStatusFilter(f=='all'?f:f.toUpperCase())} style={f!=='all' ? filterPill(txStatusFilter === f.toUpperCase()):filterPill(txStatusFilter === f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: `${c.primary}06` }}>
                {['#', 'Party', 'Amount', 'Type', 'Mode', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: c.textLight, letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ height: '13px', background: c.border, borderRadius: '4px', animation: 'dbPulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                      </td>
                    ))}</tr>
                  ))
                : paginatedTx.length === 0
                ? (
                    <tr><td colSpan={8} style={{ padding: '56px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: c.textLight }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${c.border}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ActivityIcon /></div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text }}>
                          {transactions.length === 0 ? 'No transactions yet' : 'No transactions match this filter'}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px' }}>
                          {transactions.length === 0 ? 'Click "Add Transaction" to record your first entry' : 'Try changing the filter above'}
                        </p>
                      </div>
                    </td></tr>
                  )
                : paginatedTx.map((tx, idx) => {
                    const statusCfg = txStatusConfig[tx.status] || txStatusConfig.pending
                    const isApproving = approvingId === tx._id
                    return (
                      <tr key={tx._id}
                        onMouseEnter={e => e.currentTarget.style.background = `${c.primary}06`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontWeight: '500' }}>
                          {(txPage - 1) * TX_LIMIT + idx + 1}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                              {getPartyName(tx.partyId).charAt(0).toUpperCase() || '?'}
                            </div>
                            <span style={{ fontWeight: '600', color: c.text }}>{getPartyName(tx.partyId)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, fontWeight: '700', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: tx.type === 'credit' ? '#10B98118' : '#EF444418', color: tx.type === 'credit' ? '#10B981' : '#EF4444' }}>
                            {tx.type === 'credit' ? 'CR' : 'DR'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${c.border}60`, color: c.textLight }}>
                            {tx.paymentMode}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, whiteSpace: 'nowrap' }}>
                          {displayTxDate(tx.transactionDate)}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <div>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                            {tx.status === 'REJECTED' && tx.rejectRemark && (
                              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#EF4444', opacity: 0.8 }} title={tx.rejectRemark}>
                                {tx.rejectRemark.length > 20 ? tx.rejectRemark.slice(0, 20) + '…' : tx.rejectRemark}
                              </p>
                            )}
                          </div>
                        </td>
                        
                        {/* <td style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                          {tx.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleApprove(tx._id)} disabled={isApproving}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#10B98112', color: '#10B981', border: '1px solid #10B98130', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: isApproving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isApproving ? 0.7 : 1 }}
                                onMouseEnter={e => { if (!isApproving) { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white' } }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#10B98112'; e.currentTarget.style.color = '#10B981' }}
                              >
                                <CheckCircleIcon />
                                {isApproving ? '…' : 'Approve'}
                              </button>
                              <button onClick={() => openRejectModal(tx)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#EF444412', color: '#EF4444', border: '1px solid #EF444430', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white' }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#EF444412'; e.currentTarget.style.color = '#EF4444' }}
                              >
                                <XCircleIcon /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: c.textLight, fontStyle: 'italic' }}>—</span>
                          )}
                        </td> */}
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Transaction Pagination */}
        {filteredTx.length > TX_LIMIT && (
          <div style={{ padding: '13px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: c.textLight }}>
              Showing <strong style={{ color: c.text }}>{(txPage - 1) * TX_LIMIT + 1}–{Math.min(txPage * TX_LIMIT, filteredTx.length)}</strong> of <strong style={{ color: c.text }}>{filteredTx.length}</strong>
            </p>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1}
                style={{ padding: '5px 10px', borderRadius: '6px', cursor: txPage === 1 ? 'not-allowed' : 'pointer', border: `1px solid ${c.border}`, background: c.background, color: c.text, display: 'flex', alignItems: 'center', opacity: txPage === 1 ? 0.4 : 1 }}>
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: Math.min(txTotalPages, 5) }).map((_, i) => (
                <button key={i + 1} onClick={() => setTxPage(i + 1)}
                  style={{ width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${txPage === i + 1 ? '#8B5CF6' : c.border}`, background: txPage === i + 1 ? '#8B5CF6' : c.background, color: txPage === i + 1 ? 'white' : c.text, fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))} disabled={txPage === txTotalPages}
                style={{ padding: '5px 10px', borderRadius: '6px', cursor: txPage === txTotalPages ? 'not-allowed' : 'pointer', border: `1px solid ${c.border}`, background: c.background, color: c.text, display: 'flex', alignItems: 'center', opacity: txPage === txTotalPages ? 0.4 : 1 }}>
                <ChevronRightSmIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Party Modal ── */}
      {showPartyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'dbFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closePartyModal() }}
        >
          <div className="db-modal" style={{ background: c.surface, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'dbSlideUp 0.25s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg,${c.primary}08,transparent)` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: c.text }}>{editingParty ? 'Edit Party' : 'Add New Party'}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>{editingParty ? `Editing ${editingParty.name}` : 'Fill in the details to add a new party'}</p>
              </div>
              <button onClick={closePartyModal}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: `${c.error}15`, color: c.error, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.error}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${c.error}15`}
              ><XIcon /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: c.primary, letterSpacing: '1px', textTransform: 'uppercase' }}>Basic Information</p>
              <div className="db-form-grid" style={{ marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input value={partyForm.name} onChange={e => setPartyField('name', e.target.value)} placeholder="Party name" style={inputStyle(!!partyFormErrors.name)} />
                  {partyFormErrors.name && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{partyFormErrors.name}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Mobile *</label>
                  <input value={partyForm.mobile} onChange={e => setPartyField('mobile', e.target.value)} placeholder="10-digit mobile" maxLength={10} style={inputStyle(!!partyFormErrors.mobile)} />
                  {partyFormErrors.mobile && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{partyFormErrors.mobile}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={partyForm.email} onChange={e => setPartyField('email', e.target.value)} placeholder="email@example.com" type="email" style={inputStyle()} />
                </div>
                <div>
                  <label style={labelStyle}>Area</label>
                  <input value={partyForm.area} onChange={e => setPartyField('area', e.target.value)} placeholder="City / Area" style={inputStyle()} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Address</label>
                  <input value={partyForm.address} onChange={e => setPartyField('address', e.target.value)} placeholder="Full address" style={inputStyle()} />
                </div>
              </div>
              {!editingParty && (
                <>
                  <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: c.primary, letterSpacing: '1px', textTransform: 'uppercase' }}>Business Details</p>
                  <div className="db-form-grid" style={{ marginBottom: '20px' }}>
                    <div><label style={labelStyle}>Adhar Number</label><input value={partyForm.adharNumber} onChange={e => setPartyField('adharNumber', e.target.value)} placeholder="12-digit" maxLength={12} style={inputStyle()} /></div>
                    <div><label style={labelStyle}>PAN Number</label><input value={partyForm.panNumber} onChange={e => setPartyField('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} style={inputStyle()} /></div>
                    <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>GST Number</label><input value={partyForm.gstNumber} onChange={e => setPartyField('gstNumber', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} style={inputStyle()} /></div>
                    <div><label style={labelStyle}>Credit Limit (₹)</label><input value={partyForm.creditLimit ?? ''} onChange={e => setPartyField('creditLimit', Number(e.target.value))} type="number" min={0} style={inputStyle()} /></div>
                    <div><label style={labelStyle}>Opening Balance (₹)</label><input value={partyForm.openingBalance ?? ''} onChange={e => setPartyField('openingBalance', Number(e.target.value))} type="number" min={0} style={inputStyle()} /></div>
                    <div>
                      <label style={labelStyle}>Balance Type</label>
                      <select value={partyForm.openingBalanceType} onChange={e => setPartyField('openingBalanceType', e.target.value as 'credit' | 'debit')} style={{ ...inputStyle(), cursor: 'pointer' }}>
                        <option value="credit">Credit (Dena Hai)</option>
                        <option value="debit">Debit (Lena Hai)</option>
                      </select>
                    </div>
                    <div><label style={labelStyle}>Remark</label><input value={partyForm.remark} onChange={e => setPartyField('remark', e.target.value)} placeholder="Optional note" style={inputStyle()} /></div>
                  </div>
                </>
              )}
              <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: c.primary, letterSpacing: '1px', textTransform: 'uppercase' }}>Status</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                {([{ key: 'isActive', label: 'Active' }, { key: 'isBlock', label: 'Blocked' }] as const).map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: c.text }}>
                    <input type="checkbox" checked={!!partyForm[key]} onChange={e => setPartyField(key, e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: c.primary }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: c.background }}>
              <button onClick={closePartyModal} style={{ padding: '9px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
              <button onClick={handlePartySubmit} disabled={partySubmitting}
                style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg,${c.primary},${c.secondary})`, color: 'white', cursor: partySubmitting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: partySubmitting ? 0.8 : 1, boxShadow: `0 4px 12px ${c.primary}35`, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!partySubmitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {partySubmitting ? 'Saving...' : editingParty ? 'Update Party' : 'Add Party'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Transaction Modal ── */}
      {showTxModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'dbFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closeTxModal() }}
        >
          <div className="db-modal" style={{ background: c.surface, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'dbSlideUp 0.25s ease' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(139,92,246,0.06),transparent)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: c.text }}>Add Transaction</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>Record a new credit or debit entry</p>
              </div>
              <button onClick={closeTxModal}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: `${c.error}15`, color: c.error, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.error}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${c.error}15`}
              ><XIcon /></button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Party select */}
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Party *</label>
                <select value={txForm.partyId} onChange={e => setTxField('partyId', e.target.value)}
                  style={{ ...inputStyle(!!txErrors.partyId), cursor: 'pointer' }}
                  disabled={modalPartiesLoading}
                >
                  <option value="">{modalPartiesLoading ? 'Loading parties…' : '— Select a party —'}</option>
                  {modalParties.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.mobile})</option>
                  ))}
                </select>
                {txErrors.partyId && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{txErrors.partyId}</p>}
              </div>

              {/* Amount + Type */}
              <div className="db-form-grid" style={{ marginBottom: '18px' }}>
                <div>
                  <label style={labelStyle}>Amount (₹) *</label>
                  <input value={txForm.amount} onChange={e => setTxField('amount', e.target.value)} placeholder="0.00" type="number" min={0} step="0.01" style={inputStyle(!!txErrors.amount)} />
                  {txErrors.amount && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{txErrors.amount}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    {(['credit', 'debit'] as const).map(t => (
                      <label key={t} onClick={() => setTxField('type', t)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', border: `1.5px solid ${txForm.type === t ? (t === 'credit' ? '#10B981' : '#EF4444') : c.border}`, background: txForm.type === t ? (t === 'credit' ? '#10B98115' : '#EF444415') : 'transparent', transition: 'all 0.2s', fontSize: '13px', fontWeight: '600', color: txForm.type === t ? (t === 'credit' ? '#10B981' : '#EF4444') : c.textLight }}
                      >
                        <input type="radio" name="txType" value={t} checked={txForm.type === t} onChange={() => setTxField('type', t)} style={{ accentColor: t === 'credit' ? '#10B981' : '#EF4444' }} />
                        {t === 'credit' ? 'Credit (CR)' : 'Debit (DR)'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Mode + Date */}
              <div className="db-form-grid" style={{ marginBottom: '18px' }}>
                <div>
                  <label style={labelStyle}>Payment Mode</label>
                  <select value={txForm.paymentMode} onChange={e => setTxField('paymentMode', e.target.value as PaymentMode)} style={{ ...inputStyle(), cursor: 'pointer' }}>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Transaction Date *</label>
                  <input type="date" value={txForm.transactionDate} onChange={e => setTxField('transactionDate', e.target.value)} style={inputStyle(!!txErrors.transactionDate)} />
                  {txErrors.transactionDate && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{txErrors.transactionDate}</p>}
                </div>
              </div>

              {/* Remark */}
              <div>
                <label style={labelStyle}>Remark</label>
                <input value={txForm.remark} onChange={e => setTxField('remark', e.target.value)} placeholder="Optional note about this transaction" style={inputStyle()} />
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: c.background }}>
              <button onClick={closeTxModal} style={{ padding: '9px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
              <button onClick={handleAddTransaction} disabled={txSubmitting}
                style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color: 'white', cursor: txSubmitting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: txSubmitting ? 0.8 : 1, boxShadow: '0 4px 12px rgba(139,92,246,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!txSubmitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {txSubmitting ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Transaction Modal ── */}
      {rejectingTx && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'dbFadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) { setRejectingTx(null); setRejectRemark('') } }}
        >
          <div style={{ background: c.surface, borderRadius: '14px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'dbSlideUp 0.25s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.04)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: c.text }}>Reject Transaction</h3>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: c.textLight }}>
                  {formatCurrency(rejectingTx.amount)} · {getPartyName(rejectingTx.partyId)}
                </p>
              </div>
              <button onClick={() => { setRejectingTx(null); setRejectRemark('') }}
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: `${c.error}15`, color: c.error, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.error}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${c.error}15`}
              ><XIcon /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <label style={{ ...labelStyle, color: c.error }}>Reject Reason *</label>
              <textarea value={rejectRemark} onChange={e => setRejectRemark(e.target.value)}
                placeholder="Explain why this transaction is being rejected…"
                rows={3}
                style={{ ...inputStyle(!rejectRemark.trim()), resize: 'vertical', minHeight: '80px' }}
              />
              {!rejectRemark.trim() && rejectSubmitting && (
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>Reject reason is required</p>
              )}
            </div>
            <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setRejectingTx(null); setRejectRemark('') }}
                style={{ padding: '9px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={rejectSubmitting}
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: 'white', cursor: rejectSubmitting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: rejectSubmitting ? 0.8 : 1, boxShadow: '0 4px 12px rgba(239,68,68,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!rejectSubmitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {rejectSubmitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dbPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes dbFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes dbSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .dashboard-summary-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:24px; }
        .db-insights-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
        .db-quick-actions { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
        .db-welcome-row { display:flex; align-items:center; justify-content:space-between; }
        .db-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .db-modal { width:100%; max-width:680px; max-height:90vh; border-radius:16px; }

        @media(max-width:1280px) { .dashboard-summary-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:1024px) { .db-quick-actions{grid-template-columns:repeat(2,1fr);} .db-insights-grid{grid-template-columns:1fr;} }
        @media(max-width:768px) {
          .dashboard-summary-grid{grid-template-columns:repeat(2,1fr);}
          .db-insights-grid{grid-template-columns:1fr;}
          .db-quick-actions{grid-template-columns:repeat(2,1fr);}
          .db-welcome-row{flex-direction:column;align-items:flex-start;gap:12px;}
          .db-deco-svg{display:none;}
          .db-modal{max-width:96vw;max-height:92vh;border-radius:14px;}
        }
        @media(max-width:600px) { .db-form-grid{grid-template-columns:1fr;} }
        @media(max-width:480px) {
          .dashboard-summary-grid{grid-template-columns:1fr;}
          .db-quick-actions{grid-template-columns:1fr;}
          .db-modal{max-width:100vw;max-height:100vh;border-radius:0;}
        }
      `}</style>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-toastify'
import { getPartyList, addParty, updateParty } from '../services/party.service'
import type { Party, PartyPayload, UpdatePartyPayload } from '../types/party.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const ActiveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const InactiveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LIMIT = 10

const formatCurrency = (val: number) =>
  `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return { _id: '', name: '' } }
}

const EMPTY_FORM: PartyPayload = {
  name: '', mobile: '', email: '', address: '',
   isActive: true, isBlock: false, createdBy: '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PartyPage() {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors
  const user = getStoredUser()

  const [parties, setParties] = useState<Party[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Party | null>(null)
  const [form, setForm] = useState<PartyPayload>({ ...EMPTY_FORM, createdBy: user._id })
  const [errors, setErrors] = useState<Partial<Record<keyof PartyPayload, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch ──

  const fetchParties = useCallback(async (p: number, q: string) => {
    if (!user._id) return
    setLoading(true)
    try {
      const res = await getPartyList({ page: p, limit: LIMIT, createdBy: user._id, search: q || undefined })
      if (res.success) {
        setParties(res.data.data)
        setTotal(res.data.total)
        setTotalPages(res.data.totalPages)
      }
    } catch {
      // handled by service
    } finally {
      setLoading(false)
    }
  }, [user._id])

  useEffect(() => { fetchParties(page, search) }, [fetchParties, page])

  const handleSearch = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); fetchParties(1, val) }, 400)
  }

  // ── Modal ──

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, createdBy: user._id })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (party: Party) => {
    setEditing(party)
    setForm({
      name: party.name, mobile: party.mobile, email: party.email || '',
      // area: party.area || '', 
      address: party.address || '',
      // adharNumber: party.adharNumber || '', panNumber: party.panNumber || '',
      // gstNumber: party.gstNumber || '', creditLimit: party.creditLimit ?? 0,
      // openingBalance: party.openingBalance ?? 0,
      // openingBalanceType: party.openingBalanceType ?? 'credit',
      // remark: party.remark || '', 
      isActive: party.isActive,
      isBlock: party.isBlock,
      createdBy: user._id,
    })
    setErrors({})
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null) }

  const setField = (key: keyof PartyPayload, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof PartyPayload, string>> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.mobile.trim()) e.mobile = 'Mobile is required'
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter valid 10-digit number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      if (editing) {
        const payload: UpdatePartyPayload = {
          name: form.name.trim(), mobile: form.mobile.trim(),
          // area: form.area?.trim(), 
           isActive: form.isActive, 
           createdBy: user._id,
        }
        const res = await updateParty(editing._id, payload)
        if (res.success) { toast.success(res.message || 'Party updated'); closeModal(); fetchParties(page, search) }
      } else {
        const res = await addParty({ ...form, name: form.name.trim(), mobile: form.mobile.trim(), createdBy: user._id })
        if (res.success) { toast.success(res.message || 'Party added'); closeModal(); setPage(1); fetchParties(1, search) }
      }
    } catch {
      // handled by service
    } finally {
      setSubmitting(false)
    }
  }

  // ── Styles ──

  const inputSt = (hasError?: boolean): CSSProperties => ({
    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? c.error : c.border}`,
    borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit',
    background: c.background, color: c.text, outline: 'none', transition: 'border-color 0.2s',
  })

  const labelSt: CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '700',
    color: c.textLight, marginBottom: '5px', letterSpacing: '0.5px', textTransform: 'uppercase',
  }

  const sectionTitle: CSSProperties = {
    margin: '0 0 12px', fontSize: '11px', fontWeight: '700',
    color: c.primary, letterSpacing: '1px', textTransform: 'uppercase',
  }

  const startItem = (page - 1) * LIMIT + 1
  const endItem = Math.min(page * LIMIT, total)

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: `0 8px 20px ${c.primary}40`,
          }}>
            <UsersIcon />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: c.text }}>Party Management</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>
              {loading ? 'Loading...' : `${total} ${total === 1 ? 'party' : 'parties'} registered`}
            </p>
          </div>
        </div>
        <button onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
            color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            boxShadow: `0 6px 16px ${c.primary}40`, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${c.primary}50` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 16px ${c.primary}40` }}
        >
          <PlusIcon /> Add Party
        </button>
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            border: `1.5px solid ${c.border}`, borderRadius: '8px',
            padding: '8px 12px', background: c.background, flex: 1, minWidth: '200px', maxWidth: '320px',
          }}>
            <span style={{ color: c.textLight, display: 'flex' }}><SearchIcon /></span>
            <input
              value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, mobile..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: c.text, fontFamily: 'inherit', width: '100%' }}
            />
          </div>
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); fetchParties(1, '') }}
              style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${c.border}`, background: c.background, color: c.textLight, cursor: 'pointer', fontSize: '12px' }}>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: `${c.primary}08` }}>
                {['#', 'Party', 'Mobile', 'Address', 'GST No.', 'Credit Limit', 'Opening Balance', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap',
                    fontSize: '11px', fontWeight: '700', color: c.textLight,
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                          <div style={{ height: '13px', background: c.border, borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : parties.length === 0
                ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '64px 24px', textAlign: 'center', color: c.textLight }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${c.border}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textLight }}>
                            <UsersIcon />
                          </div>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                            {search ? `No results for "${search}"` : 'No parties found'}
                          </p>
                          <p style={{ margin: 0, fontSize: '13px' }}>
                            {search ? 'Try a different search term' : 'Click "Add Party" to get started'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                : parties.map((party, idx) => (
                    <tr key={party._id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = `${c.primary}06`}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontWeight: '500' }}>
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '700',
                          }}>
                            {party.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: c.text }}>{party.name}</p>
                            {party.email && <p style={{ margin: 0, fontSize: '11px', color: c.textLight }}>{party.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}`, color: c.text }}>{party.mobile}</td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight }}>{party.address || '—'}</td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}`, color: c.textLight, fontSize: '12px', fontFamily: 'monospace' }}>
                        {party.gstNumber || '—'}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}`, color: c.text, fontWeight: '600' }}>
                        {party.creditLimit != null ? formatCurrency(party.creditLimit) : '—'}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}` }}>
                        {party.openingBalance != null ? (
                          <span style={{ color: party.openingBalanceType === 'credit' ? c.success : c.error, fontWeight: '600' }}>
                            {formatCurrency(party.openingBalance)}
                            <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.75 }}>
                              {party.openingBalanceType === 'credit' ? 'CR' : 'DR'}
                            </span>
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', width: 'fit-content',
                            background: party.isActive ? `${c.success}18` : `${c.error}18`,
                            color: party.isActive ? c.success : c.error,
                          }}>
                            {party.isActive ? <ActiveIcon /> : <InactiveIcon />}
                            {party.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {party.isBlock && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', width: 'fit-content',
                              background: '#F59E0B18', color: '#D97706',
                            }}>
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${c.border}` }}>
                        <button onClick={() => openEdit(party)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            border: `1px solid ${c.primary}30`, background: `${c.primary}10`,
                            color: c.primary, fontSize: '12px', fontWeight: '600', transition: 'all 0.2s',
                          }}
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

        {/* Pagination */}
        {total > 0 && (
          <div style={{
            padding: '14px 20px', borderTop: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: c.textLight }}>
              Showing <strong style={{ color: c.text }}>{startItem}–{endItem}</strong> of <strong style={{ color: c.text }}>{total}</strong>
            </p>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${c.border}`, background: c.background, color: page === 1 ? c.textLight : c.text, cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${page === i + 1 ? c.primary : c.border}`, background: page === i + 1 ? c.primary : c.background, color: page === i + 1 ? 'white' : c.text, fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${c.border}`, background: c.background, color: page === totalPages ? c.textLight : c.text, cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{ background: c.surface, borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'slideUp 0.25s ease' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(135deg, ${c.primary}08, transparent)` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: c.text }}>
                  {editing ? 'Edit Party' : 'Add New Party'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: c.textLight }}>
                  {editing ? `Updating ${editing.name}` : 'Fill in details to register a new party'}
                </p>
              </div>
              <button onClick={closeModal}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: `${c.error}15`, color: c.error, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.error}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${c.error}15`}
              >
                <XIcon />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p style={sectionTitle}>Basic Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={labelSt}>Name *</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Party name" style={inputSt(!!errors.name)} />
                  {errors.name && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={labelSt}>Mobile *</label>
                  <input value={form.mobile} onChange={e => setField('mobile', e.target.value)} placeholder="10-digit mobile" maxLength={10} style={inputSt(!!errors.mobile)} />
                  {errors.mobile && <p style={{ margin: '4px 0 0', fontSize: '11px', color: c.error }}>{errors.mobile}</p>}
                </div>
                <div>
                  <label style={labelSt}>Email</label>
                  <input value={form.email} onChange={e => setField('email', e.target.value)} placeholder="email@example.com" type="email" style={inputSt()} />
                </div>
                {/* <div>
                  <label style={labelSt}>Area</label>
                  <input value={form.area} onChange={e => setField('area', e.target.value)} placeholder="City / Area" style={inputSt()} />
                </div> */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelSt}>Address</label>
                  <input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Full address" style={inputSt()} />
                </div>
              </div>

              {!editing && (
                <>
                  <p style={sectionTitle}>Business Details</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                    {/* <div>
                      <label style={labelSt}>Adhar Number</label>
                      <input value={form.adharNumber} onChange={e => setField('adharNumber', e.target.value)} placeholder="12-digit Adhar" maxLength={12} style={inputSt()} />
                    </div> */}
                    {/* <div>
                      <label style={labelSt}>PAN Number</label>
                      <input value={form.panNumber} onChange={e => setField('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} style={inputSt()} />
                    </div> */}
                    {/* <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelSt}>GST Number</label>
                      <input value={form.gstNumber} onChange={e => setField('gstNumber', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} style={inputSt()} />
                    </div> */}
                    {/* <div>
                      <label style={labelSt}>Credit Limit (₹)</label>
                      <input value={form.creditLimit ?? ''} onChange={e => setField('creditLimit', Number(e.target.value))} placeholder="0" type="number" min={0} style={inputSt()} />
                    </div> */}
                    {/* <div>
                      <label style={labelSt}>Opening Balance (₹)</label>
                      <input value={form.openingBalance ?? ''} onChange={e => setField('openingBalance', Number(e.target.value))} placeholder="0" type="number" min={0} style={inputSt()} />
                    </div> */}
                    {/* <div>
                      <label style={labelSt}>Balance Type</label>
                      <select value={form.openingBalanceType} onChange={e => setField('openingBalanceType', e.target.value as 'credit' | 'debit')} style={{ ...inputSt(), cursor: 'pointer' }}>
                        <option value="credit">Credit</option>
                        <option value="debit">Debit </option>
                      </select>
                    </div> */}
                    {/* <div>
                      <label style={labelSt}>Remark</label>
                      <input value={form.remark} onChange={e => setField('remark', e.target.value)} placeholder="Optional note" style={inputSt()} />
                    </div> */}
                  </div>
                </>
              )}

              <p style={sectionTitle}>Status</p>
              <div style={{ display: 'flex', gap: '20px' }}>
                {([{ key: 'isActive', label: 'Active' }, { key: 'isBlock', label: 'Blocked' }] as const).map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: c.text }}>
                    <input type="checkbox" checked={!!form[key]} onChange={e => setField(key, e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: c.primary }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: c.background }}>
              <button onClick={closeModal}
                style={{ padding: '9px 20px', borderRadius: '8px', border: `1.5px solid ${c.border}`, background: 'transparent', color: c.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`, color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: submitting ? 0.8 : 1, boxShadow: `0 4px 12px ${c.primary}35`, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {submitting ? 'Saving...' : editing ? 'Update Party' : 'Add Party'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  )
}

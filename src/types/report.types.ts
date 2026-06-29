export type BalanceType = 'nil' | 'credit' | 'debit'

// ─── Legacy (kept for backward compat) ────────────────────────────────────────

export interface PendingParty {
  partyId: string
  name: string
  mobile: string
  email?: string
  pendingToCollect: number
  pendingToPay: number
  currentBalance: number
}

export interface PendingPartiesResponse {
  success: boolean
  message: string
  data: PendingParty[]
}

export interface PartyDetailPartyInfo {
  _id: string
  name: string
  mobile: string
  email?: string
}

export interface PartyDetailTransaction {
  _id: string
  partyId: PartyDetailPartyInfo
  transactionDate: string
  amount: number
  type: 'credit' | 'debit'
  paymentMode: string
  remark?: string
  status: string
}

export interface PartyDetailsResponse {
  success: boolean
  message: string
  data: PartyDetailTransaction[]
}

// ─── Party Wise Balance  (api/lena-dena/balance) ──────────────────────────────

export interface PartyWiseBalance {
  balanceType: BalanceType
  _id: string
  name: string
  mobile: string
  area: string
  currentBalance: number
}

export interface PartyWiseBalanceListResponse {
  success: boolean
  message: string
  data: PartyWiseBalance[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PartyWiseDetailsData {
  partyId: string
  partyName: string
  partyMobile: string
  currentBalance: number
  balanceType: BalanceType
}

export interface PartyWiseDetailsResponse {
  success: boolean
  data: PartyWiseDetailsData
}

// ─── Party Balance  (api/report/party-balance) ────────────────────────────────

export interface PartyBalancePartyInfo {
  balanceType: BalanceType
  _id: string
  name: string
  mobile: string
  area: string
  address?: string
  currentBalance: number
}

export interface PartyBalanceData {
  party: PartyBalancePartyInfo
  totalLena: number
  totalDena: number
  totalPaymentReceived: number
  totalPaymentPaid: number
  currentBalance: number
  balanceType: BalanceType
}

export interface PartyBalanceResponse {
  success: boolean
  message: string
  data: PartyBalanceData
}

// ─── Party Transactions  (api/report/party-transactions) ──────────────────────

export interface PartyTransactionPartyInfo {
  balanceType: BalanceType
  _id: string
  name: string
  mobile: string
  area: string
  currentBalance: number
}

export interface PartyTransactionItem {
  _id: string
  amount: number
  type: 'credit' | 'debit' | 'lena' | 'dena'
  date?: string
  transactionDate?: string
  status: string
  remark?: string
  paymentMode?: string
}

export interface PartyTransactionData {
  party: PartyTransactionPartyInfo
  summary: { totalCredit: number; totalDebit: number }
  transactions: PartyTransactionItem[]
}

export interface PartyTransactionResponse {
  success: boolean
  message: string
  data: PartyTransactionData
}

// ─── Party Ledger  (api/report/party-ledger) ──────────────────────────────────

export interface PartyLedgerData {
  party: PartyTransactionPartyInfo
  currentBalance: number
  balanceType: BalanceType
  transactions: PartyTransactionItem[]
}

export interface PartyLedgerResponse {
  success: boolean
  message: string
  data: PartyLedgerData
}

// ─── Admin Summary with date range  (api/report/admin-summary) ────────────────

export interface AdminSummaryRange {
  dateRange: { from: string; to: string }
  totalLena: number
  totalDena: number
  totalPaymentReceived: number
  totalPaymentPaid: number
  netReceivable: number
  netPayable: number
  profitOrLoss: number
  type: 'nil' | 'profit' | 'loss'
}

export interface AdminSummaryRangeResponse {
  success: boolean
  message: string
  data: AdminSummaryRange
}

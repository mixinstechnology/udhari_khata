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

// Party info nested inside each transaction from /api/report/party-details
export interface PartyDetailPartyInfo {
  _id: string
  name: string
  mobile: string
  email?: string
}

// Each item in the party-details response array
export interface PartyDetailTransaction {
  _id: string
  partyId: PartyDetailPartyInfo
  transactionDate: string
  amount: number
  type: 'credit' | 'debit'
  paymentMode: string
  remark?: string
  status: string // APPROVED | PENDING | REJECTED (uppercase from API)
}

export interface PartyDetailsResponse {
  success: boolean
  message: string
  data: PartyDetailTransaction[]
}

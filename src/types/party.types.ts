export interface Party {
  _id: string
  name: string
  mobile: string
  email?: string
  area?: string
  address?: string
  adharNumber?: string
  panNumber?: string
  gstNumber?: string
  creditLimit?: number
  openingBalance?: number
  openingBalanceType?: 'credit' | 'debit'
  remark?: string
  isActive: boolean
  isBlock: boolean
  createdBy: string
}

export interface PartyPayload {
  name: string
  mobile: string
  email?: string
  area?: string
  address?: string
  adharNumber?: string
  panNumber?: string
  gstNumber?: string
  creditLimit?: number
  openingBalance?: number
  openingBalanceType?: 'credit' | 'debit'
  remark?: string
  isActive?: boolean
  isBlock?: boolean
  createdBy: string
}

export interface UpdatePartyPayload {
  name?: string
  mobile?: string
  area?: string
  isActive?: boolean
  createdBy: string
}

export interface PartyListResponse {
  success: boolean
  data: {
    total: number
    page: number
    limit: number
    totalPages: number
    data: Party[]
  }
}

export interface PartyListParams {
  page?: number
  limit?: number
  createdBy: string
  search?: string
}

export interface AdminSummary {
  totalCredit: number
  totalDebit: number
  pendingToCollect: number
  pendingToPay: number
  netBalance: number
}

export interface AdminSummaryResponse {
  success: boolean
  message: string
  data: AdminSummary
}

export interface MutationResponse {
  success: boolean
  message: string
}

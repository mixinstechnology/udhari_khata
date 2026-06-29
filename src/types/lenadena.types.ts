export type LenaDenaType = 'dena' | 'lena'
export type LenaDenaStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface LenaDenaPartyInfo {
  _id: string
  name: string
  mobile: string
}

export interface LenaDenaCreatedBy {
  _id: string
  name: string
}

export interface LenaDena {
  _id: string
  partyId: LenaDenaPartyInfo | null
  type: LenaDenaType
  amount: number
  date: string
  paymentMode: string | null
  remark: string | null
  status: LenaDenaStatus
  rejectRemark: string | null
  createdBy: LenaDenaCreatedBy
  updatedBy: LenaDenaCreatedBy | null
  approvedBy: LenaDenaCreatedBy | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LenaDenaPayload {
  partyId?: string
  amount: number
  type: LenaDenaType
  remark?: string
  date: string
  createdBy: string
}

export interface LenaDenaListParams {
  createdBy: string
  page?: number
  limit?: number
}

export interface ApprovePayload {
  userId: string
}

export interface RejectPayload {
  userId: string
  rejectRemark: string
}

export interface LenaDenaListResponse {
  success: boolean
  message: string
  data: LenaDena[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LenaDenaMutationResponse {
  success: boolean
  message: string
  data?: LenaDena
}

export type PaymentMode = 'CASH' | 'BANK' | 'CHEQUE'
export type TransactionType = 'credit' | 'debit'
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface TransactionParty {
  _id: string
  name: string
  mobile: string
}

export interface Transaction {
  _id: string
  partyId: TransactionParty | string
  amount: number
  type: TransactionType
  remark?: string
  paymentMode: PaymentMode
  transactionDate: string
  status: TransactionStatus
  rejectRemark?: string
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

export interface TransactionPayload {
  partyId: string
  amount: number
  type: TransactionType
  remark?: string
  paymentMode: PaymentMode
  transactionDate: string
  createdBy: string
}

export interface ApprovePayload {
  userId: string
}

export interface RejectPayload {
  userId: string
  rejectRemark: string
}

export interface TransactionListResponse {
  success: boolean
  message: string
  data: Transaction[]
}

export interface TransactionMutationResponse {
  success: boolean
  message: string
  data?: Transaction
}

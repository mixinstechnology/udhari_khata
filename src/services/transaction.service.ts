import httpService from './apiService'
import type {
  TransactionPayload,
  ApprovePayload,
  RejectPayload,
  TransactionListResponse,
  TransactionMutationResponse,
} from '../types/transaction.types'

export const createTransaction = (payload: TransactionPayload): Promise<TransactionMutationResponse> =>
  httpService.post<TransactionMutationResponse>('api/transaction', { data: payload, token: true })

export const getTransactionList = (createdBy: string, params?: { limit?: number; page?: number }): Promise<TransactionListResponse> =>
  httpService.get<TransactionListResponse>('api/transaction', { params: { createdBy, ...params }, token: true })

export const approveTransaction = (id: string, payload: ApprovePayload): Promise<TransactionMutationResponse> =>
  httpService.put<TransactionMutationResponse>(`api/transaction/${id}/approve`, { data: payload, token: true })

export const rejectTransaction = (id: string, payload: RejectPayload): Promise<TransactionMutationResponse> =>
  httpService.put<TransactionMutationResponse>(`api/transaction/${id}/reject`, { data: payload, token: true })

import httpService from './apiService'
import type {
  PendingPartiesResponse,
  PartyDetailsResponse,
  PartyWiseBalanceListResponse,
  PartyWiseDetailsResponse,
  PartyBalanceResponse,
  PartyTransactionResponse,
  PartyLedgerResponse,
  AdminSummaryRangeResponse,
} from '../types/report.types'

// ─── Legacy ───────────────────────────────────────────────────────────────────

export const getPendingParties = (createdBy: string): Promise<PendingPartiesResponse> =>
  httpService.get<PendingPartiesResponse>('api/report/pending-party', {
    params: { createdBy, sort: 'asc' }, token: true,
  })

export const getPartyDetails = (createdBy: string, partyId: string): Promise<PartyDetailsResponse> =>
  httpService.get<PartyDetailsResponse>('api/report/party-details', {
    params: { createdBy, partyId }, token: true,
  })

// ─── Party Wise Balance ───────────────────────────────────────────────────────

export const getPartyWiseBalance = (params: { page?: number; limit?: number }): Promise<PartyWiseBalanceListResponse> =>
  httpService.get<PartyWiseBalanceListResponse>('api/lena-dena/balance', { params, token: true })

export const getPartyWiseDetails = (partyId: string): Promise<PartyWiseDetailsResponse> =>
  httpService.get<PartyWiseDetailsResponse>(`api/lena-dena/balance/${partyId}`, { token: true })

// ─── Party Balance ────────────────────────────────────────────────────────────

export const getPartyBalance = (params: { partyId: string; createdBy: string }): Promise<PartyBalanceResponse> =>
  httpService.get<PartyBalanceResponse>('api/report/party-balance', { params, token: true })

// ─── Party Transactions ───────────────────────────────────────────────────────

export const getPartyTransactions = (params: {
  partyId: string; createdBy: string; fromDate: string; toDate: string
}): Promise<PartyTransactionResponse> =>
  httpService.get<PartyTransactionResponse>('api/report/party-transactions', { params, token: true })

// ─── Party Ledger ─────────────────────────────────────────────────────────────

export const getPartyLedger = (params: {
  partyId: string; createdBy: string; fromDate: string; toDate: string
}): Promise<PartyLedgerResponse> =>
  httpService.get<PartyLedgerResponse>('api/report/party-ledger', { params, token: true })

// ─── Admin Summary (with date range) ─────────────────────────────────────────

export const getAdminSummaryRange = (params: {
  createdBy: string; fromDate: string; toDate: string
}): Promise<AdminSummaryRangeResponse> =>
  httpService.get<AdminSummaryRangeResponse>('api/report/admin-summary', { params, token: true })

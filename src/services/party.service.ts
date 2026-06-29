import httpService from './apiService'
import type {
  AdminSummaryResponse,
  MutationResponse,
  PartyListParams,
  PartyListResponse,
  PartyPayload,
  UpdatePartyPayload,
} from '../types/party.types'

export const getAdminSummary = (createdBy: string): Promise<AdminSummaryResponse> =>
  httpService.get<AdminSummaryResponse>('api/report/admin-summary', {
    params: { createdBy,fromDate:'' ,toDate:'',  sort: 'asc' },
    token: true,
  })

export const getPartyList = (params: PartyListParams): Promise<PartyListResponse> =>
  httpService.get<PartyListResponse>('api/party', { params, token: true })

export const addParty = (payload: PartyPayload): Promise<MutationResponse> =>
  httpService.post<MutationResponse>('api/party', { data: payload, token: true })

export const updateParty = (id: string, payload: UpdatePartyPayload): Promise<MutationResponse> =>
  httpService.put<MutationResponse>(`api/party/${id}`, { data: payload, token: true })

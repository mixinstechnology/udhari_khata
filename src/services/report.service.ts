import httpService from './apiService'
import type {
  PendingPartiesResponse,
  PartyDetailsResponse,
} from '../types/report.types'

export const getPendingParties = (createdBy: string): Promise<PendingPartiesResponse> =>
  httpService.get<PendingPartiesResponse>('api/report/pending-party', {
    params: { createdBy, sort: 'asc' },
    token: true,
  })

export const getPartyDetails = (createdBy: string, partyId: string): Promise<PartyDetailsResponse> =>
  httpService.get<PartyDetailsResponse>('api/report/party-details', {
    params: { createdBy, partyId },
    token: true,
  })

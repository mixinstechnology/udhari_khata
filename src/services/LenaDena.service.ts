import httpService from './apiService'
import type {
  LenaDenaPayload,
  LenaDenaListParams,
  ApprovePayload,
  RejectPayload,
  LenaDenaListResponse,
  LenaDenaMutationResponse,
} from '../types/lenadena.types'

export const createLenaDena = (payload: LenaDenaPayload): Promise<LenaDenaMutationResponse> =>
  httpService.post<LenaDenaMutationResponse>('api/lena-dena', { data: payload, token: true })

export const getLenaDenaList = (params: LenaDenaListParams): Promise<LenaDenaListResponse> =>
  httpService.get<LenaDenaListResponse>('api/lena-dena', { params, token: true })

export const approveLenaDena = (id: string, payload: ApprovePayload): Promise<LenaDenaMutationResponse> =>
  httpService.put<LenaDenaMutationResponse>(`api/lena-dena/${id}/approve`, { data: payload, token: true })

export const rejectLenaDena = (id: string, payload: RejectPayload): Promise<LenaDenaMutationResponse> =>
  httpService.put<LenaDenaMutationResponse>(`api/lena-dena/${id}/reject`, { data: payload, token: true })

import httpService from './api.service'
import type { LoginRequest, LoginResponse } from '../types/auth.types'

export const login = (payload: LoginRequest) => {
  return httpService.post<LoginResponse>('/api/users/login', {
    data: payload,
    token: false,
    silentError: true,
  })
}

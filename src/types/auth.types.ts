export interface LoginRequest {
  mobile: string
  password: string
}

export interface LoginUser {
  _id: string
  name: string
  mobile: string
  email: string
  company: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token: string
    user: LoginUser
  }
}

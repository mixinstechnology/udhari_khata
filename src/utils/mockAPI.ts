export interface MockLoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      _id: string
      name: string
      mobile: string
      email: string
      company: string
    }
  }
}

export const MOCK_LOGIN_RESPONSE: MockLoginResponse = {
  success: true,
  message: 'Login successful',
  data: {
    token: 'mock_token_' + Date.now(),
    user: {
      _id: '6a108314143f3a24afb4b440',
      name: 'Admin User',
      mobile: '9876543210',
      email: 'admin@udharikahta.com',
      company: 'Udhari Khata',
    },
  },
}

export function mockLoginAPI(mobile: string, password: string): Promise<MockLoginResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_LOGIN_RESPONSE)
    }, 800)
  })
}

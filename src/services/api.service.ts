import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
import { getGlobalLoader } from '../utils/globalLoader'
import { getCookie } from '../utils/storage.util'

interface RequestOptions {
  params?: Record<string, any>
  data?: any
  token?: boolean
  headers?: Record<string, string>
  baseURL?: string
  silentError?: boolean
}

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class HttpService {
  private getToken(): string | null {
    return getCookie('token')
  }

  private buildConfig(reqOptions: RequestOptions = {}): AxiosRequestConfig {
    let token
    if (reqOptions.token === false) {
      token = import.meta.env.VITE_DEFAULT_TOKEN || ''
    } else {
      token = this.getToken()
    }

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      ...reqOptions.headers,
    }

    return {
      baseURL: reqOptions.baseURL || DEFAULT_BASE_URL,
      params: reqOptions.params || {},
      headers,
    }
  }

  private async withLoader<T>(fn: () => Promise<T>): Promise<T> {
    const loader = getGlobalLoader()
    try {
      loader.show()
      const result = await fn()
      return result
    } finally {
      loader.hide()
    }
  }

  private handleError(error: any, silent = false): never {
    if (!silent) {
      let message = 'Something went wrong'

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          `Request failed with status ${error.response?.status}`
      } else if (error instanceof Error) {
        message = error.message
      }
      toast.error(message)
    }
    throw error
  }

  public get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options)
        const response: AxiosResponse<T> = await axios.get<T>(url, config)
        return response.data
      } catch (error) {
        this.handleError(error, options?.params?.silentError)
      }
    })
  }

  public post<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options)
        const response: AxiosResponse<T> = await axios.post<T>(url, options?.data, config)
        return response.data
      } catch (error) {
        this.handleError(error, options?.silentError)
      }
    })
  }

  public put<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options)
        const response: AxiosResponse<T> = await axios.put<T>(url, options?.data, config)
        return response.data
      } catch (error) {
        this.handleError(error, options?.silentError)
      }
    })
  }

  public delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig(options)
        const response: AxiosResponse<T> = await axios.delete<T>(url, config)
        return response.data
      } catch (error) {
        this.handleError(error, options?.silentError)
      }
    })
  }

  public postFormData<T = any>(
    url: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    return this.withLoader(async () => {
      try {
        const config = this.buildConfig({
          ...options,
          headers: {
            ...(options?.headers || {}),
            'Content-Type': 'multipart/form-data',
          },
        })

        const response: AxiosResponse<T> = await axios.post<T>(url, formData, config)
        return response.data
      } catch (error) {
        this.handleError(error, options?.silentError)
      }
    })
  }
}

const httpService = new HttpService()
export default httpService

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { registerLoader } from '../utils/globalLoader'

interface LoaderContextType {
  isLoading: boolean
  show: () => void
  hide: () => void
}

const LoaderContext = createContext<LoaderContextType | null>(null)

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)

  const show = () => setIsLoading(true)
  const hide = () => setIsLoading(false)

  useEffect(() => {
    registerLoader({ show, hide })
  }, [])

  return (
    <LoaderContext.Provider value={{ isLoading, show, hide }}>
      {children}
    </LoaderContext.Provider>
  )
}

export const useLoader = (): LoaderContextType => {
  const ctx = useContext(LoaderContext)
  if (!ctx) throw new Error('useLoader must be used within LoaderProvider')
  return ctx
}

import React, { createContext, useState, useContext, ReactNode } from 'react'
import { Theme, ThemeName } from '../types/theme.types'
import { THEMES } from '../constants/themes'

interface ThemeContextType {
  currentTheme: Theme
  setThemeName: (name: ThemeName) => void
  themeName: ThemeName
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('professional')

  const currentTheme = THEMES[themeName]

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeName, themeName }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be within ThemeProvider')
  return context
}

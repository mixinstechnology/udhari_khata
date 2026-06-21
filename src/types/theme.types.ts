export type ThemeName = 'professional' | 'ocean' | 'warm'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textLight: string
  border: string
  success: string
  error: string
  warning: string
}

export interface Theme {
  name: ThemeName
  colors: ThemeColors
}

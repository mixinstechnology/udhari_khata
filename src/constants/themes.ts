import { Theme } from '../types/theme.types'

export const THEMES: Record<string, Theme> = {
  professional: {
    name: 'professional',
    colors: {
      primary: '#0F4C75',
      secondary: '#3282B8',
      accent: '#FF6B6B',
      background: '#F5F7FA',
      surface: '#FFFFFF',
      text: '#1a1a1a',
      textLight: '#666666',
      border: '#E0E0E0',
      success: '#27AE60',
      error: '#E74C3C',
      warning: '#F39C12',
    },
  },
  ocean: {
    name: 'ocean',
    colors: {
      primary: '#0066CC',
      secondary: '#00B4D8',
      accent: '#FFB703',
      background: '#E8F4F8',
      surface: '#FFFFFF',
      text: '#001D3D',
      textLight: '#555555',
      border: '#D1E7F5',
      success: '#06A77D',
      error: '#D62828',
      warning: '#F77F00',
    },
  },
  warm: {
    name: 'warm',
    colors: {
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#FF8C00',
      background: '#FEF5EF',
      surface: '#FFFFFF',
      text: '#2C1810',
      textLight: '#666666',
      border: '#E8D5C4',
      success: '#228B22',
      error: '#DC143C',
      warning: '#FF8C00',
    },
  },
}

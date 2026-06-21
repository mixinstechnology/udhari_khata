export const setCookie = (name: string, value: string, days = 7): void => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

export const getCookie = (name: string): string | null => {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.split('=').slice(1).join('='))
}

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

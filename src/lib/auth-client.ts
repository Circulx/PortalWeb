// Client-side authentication helper
"use client"

const TOKEN_KEY = "ind2b_auth_token"

export const clientAuth = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
      sessionStorage.setItem(TOKEN_KEY, token)
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
    }
  },

  hasToken: (): boolean => {
    return !!clientAuth.getToken()
  },
}

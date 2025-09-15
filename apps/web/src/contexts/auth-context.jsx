'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for existing token on mount or enable demo mode for UI development
    const savedToken = localStorage.getItem('auth_token')
    const demoMode = localStorage.getItem('demo_mode')
    
    if (savedToken) {
      setToken(savedToken)
      validateToken(savedToken)
    } else if (demoMode === 'true') {
      // Enable demo mode for UI development
      setUser({
        id: 'demo',
        email: 'demo@crazy-gary.ai',
        name: 'Demo User',
        role: 'admin'
      })
      setToken('demo-token')
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (authToken) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          setUser(data.user)
          setToken(authToken)
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('auth_token')
          setToken(null)
          setUser(null)
        }
      } else {
        // Token validation failed
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Token validation error:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // Check for demo credentials
      if (email === 'demo@crazy-gary.ai' && password === 'demo123') {
        const demoUser = {
          id: 'demo',
          email: 'demo@crazy-gary.ai',
          name: 'Demo User',
          role: 'admin'
        }
        setUser(demoUser)
        setToken('demo-token')
        localStorage.setItem('auth_token', 'demo-token')
        localStorage.setItem('demo_mode', 'true')
        return { success: true, user: demoUser }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('auth_token', data.token)
        localStorage.removeItem('demo_mode')
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('auth_token', data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    
    // Optional: Call logout endpoint
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(console.error)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Update failed' }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Password change failed' }
      }
    } catch (error) {
      console.error('Password change error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setToken(data.token)
        localStorage.setItem('auth_token', data.token)
        return { success: true }
      } else {
        // Refresh failed, logout user
        logout()
        return { success: false, error: data.error || 'Token refresh failed' }
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return { success: false, error: 'Network error' }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: string | null

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        set({ user: session.user, session, loading: false })
        await get().fetchProfile()
      } else {
        set({ loading: false })
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user ?? null, session })
        if (session?.user) {
          await get().fetchProfile()
        } else {
          set({ profile: null })
        }
      })
    } catch {
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ loading: false })
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
      })
    }
    set({ loading: false })
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      set({ error: error.message, loading: false })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) {
      set({ profile: data as Profile })
    }
  },

  clearError: () => set({ error: null }),
}))

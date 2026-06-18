import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('vp_profiles').select('*').eq('user_id', userId).single()
    if (data) setProfile(data)
  }, [userId])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (values) => {
    if (!userId) return { error: 'No user' }
    const payload = { ...values, user_id: userId, updated_at: new Date().toISOString() }
    const { data: existing } = await supabase.from('vp_profiles').select('id').eq('user_id', userId).single()
    let error
    if (existing) {
      const res = await supabase.from('vp_profiles').update(payload).eq('user_id', userId)
      error = res.error
    } else {
      const res = await supabase.from('vp_profiles').insert(payload)
      error = res.error
    }
    if (!error) setProfile(payload)
    return { error }
  }, [userId])

  return { profile, setProfile, saveProfile: save, reloadProfile: load }
}

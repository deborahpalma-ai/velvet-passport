import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTrips(userId) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase.from('vp_trips').select('*').eq('user_id', userId).order('start_date', { ascending: true })
    setTrips(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const createTrip = useCallback(async (tripData) => {
    const { data, error } = await supabase.from('vp_trips').insert({ ...tripData, user_id: userId }).select().single()
    if (!error) await load()
    return { data, error }
  }, [userId, load])

  const deleteTrip = useCallback(async (tripId) => {
    const { error } = await supabase.from('vp_trips').delete().eq('id', tripId).eq('user_id', userId)
    if (!error) await load()
    return { error }
  }, [userId, load])

  return { trips, loading, reloadTrips: load, createTrip, deleteTrip }
}

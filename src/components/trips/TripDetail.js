import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../../lib/supabase'
import { fmt, getRate, diffDays } from '../../lib/constants'
import TripAIChat from './TripAIChat'

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
)
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
)

// ── Subtotal bar ──────────────────────────────────────────────
function SubtotalBar({ label, total, currency }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--cream)', borderRadius: '4px', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--burgundy)', fontWeight: 600 }}>{fmt(total, currency)}</span>
    </div>
  )
}

// ── Accommodation form ────────────────────────────────────────
function AccommodationAdd({ onAdd, t, currency }) {
  const [form, setForm] = useState({ name: '', address: '', check_in: '', check_out: '', rate_per_night: '', notes: '' })
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const nights = diffDays(form.check_in, form.check_out)
  const total = (parseFloat(form.rate_per_night) || 0) * nights

  const doAdd = () => {
    if (!form.name) return
    onAdd({ ...form, rate_per_night: parseFloat(form.rate_per_night) || 0 })
    setForm({ name: '', address: '', check_in: '', check_out: '', rate_per_night: '', notes: '' })
  }

  return (
    <div style={{ background: 'var(--cream)', borderRadius: '4px', padding: '1rem', marginTop: '0.75rem' }}>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>+ {t('accommodation')}</div>
      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label>{t('accommodationName')} *</label>
          <input value={form.name} onChange={upd('name')} placeholder="Hotel name" />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label>{t('address')}</label>
          <input value={form.address} onChange={upd('address')} placeholder="Address" />
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label>Check-in</label>
          <input type="date" value={form.check_in} onChange={upd('check_in')} />
        </div>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <label>Check-out</label>
          <input type="date" value={form.check_out} onChange={upd('check_out')} />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label>{t('ratePerNight')} ({currency})</label>
        <input type="number" min="0" value={form.rate_per_night} onChange={upd('rate_per_night')} />
      </div>
      {nights > 0 && form.rate_per_night > 0 && (
        <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', marginBottom: '0.5rem' }}>
          {nights} {t('nights')} × {fmt(form.rate_per_night, currency)} = <strong>{fmt(total, currency)}</strong>
        </div>
      )}
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label>{t('notes')}</label>
        <textarea value={form.notes} onChange={upd('notes')} rows={2} placeholder="Breakfast included, free cancellation..." style={{ resize: 'vertical' }} />
      </div>
      <button className="btn-gold" style={{ width: '100%' }} onClick={doAdd}>{t('add')} {t('accommodation')}</button>
    </div>
  )
}

// ── Accommodation list ────────────────────────────────────────
function AccommodationList({ items, onDelete, currency, t }) {
  return (
    <div>
      {items.map(item => {
        const nights = diffDays(item.check_in, item.check_out)
        const total = (item.rate_per_night || 0) * nights
        return (
          <div key={item.id} style={{ padding: '0.85rem', background: 'white', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--burgundy)', marginBottom: '0.2rem' }}>{item.name}</div>
                {item.address && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>📍 {item.address}</div>}
                {item.check_in && item.check_out && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                    📅 {item.check_in} → {item.check_out} · {nights} {t('nights')}
                  </div>
                )}
                {item.rate_per_night > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 500 }}>
                    {fmt(item.rate_per_night, currency)}/night · Total: {fmt(total, currency)}
                  </div>
                )}
                {item.notes && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>{item.notes}</div>}
              </div>
              <button className="btn-danger" onClick={() => onDelete(item.id)} style={{ marginLeft: '0.75rem' }}><TrashIcon /></button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Generic item add (restaurants, bars, beach clubs) ─────────
function GenericAdd({ onAdd, t, currency, withNotes = true }) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  const doAdd = () => {
    if (!name) return
    onAdd({ name, estimated_cost: parseFloat(cost) || 0, notes })
    setName(''); setCost(''); setNotes('')
  }

  return (
    <div style={{ background: 'var(--cream)', borderRadius: '4px', padding: '0.75rem', marginTop: '0.75rem' }}>
      <div className="in-add-row" style={{ marginTop: 0 }}>
        <input placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder={`${t('estimatedCost')} (${currency})`} value={cost} onChange={e => setCost(e.target.value)} style={{ maxWidth: '140px' }} />
        <button onClick={doAdd}>{t('add')}</button>
      </div>
      {withNotes && (
        <input
          placeholder={t('notes')}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ width: '100%', marginTop: '0.4rem', padding: '0.35rem 0.6rem', border: '1px solid var(--border)', borderRadius: '2px', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}
        />
      )}
    </div>
  )
}

// ── Generic item list ─────────────────────────────────────────
function GenericList({ items, onDelete, currency }) {
  return (
    <div>
      {items.map(item => (
        <div className="item-row" key={item.id}>
          <div style={{ flex: 1 }}>
            <div className="item-name">{item.name}</div>
            {item.notes && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem', fontStyle: 'italic' }}>{item.notes}</div>}
          </div>
          <span className="item-amount">{fmt(item.estimated_cost, currency)}</span>
          <button className="btn-danger" onClick={() => onDelete(item.id)}><TrashIcon /></button>
        </div>
      ))}
    </div>
  )
}

// ── Tour add ──────────────────────────────────────────────────
function TourAdd({ onAdd, t, currency }) {
  const [form, setForm] = useState({ name: '', estimated_cost: '', date: '', description: '', notes: '' })
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const doAdd = () => {
    if (!form.name) return
    onAdd({ ...form, estimated_cost: parseFloat(form.estimated_cost) || 0 })
    setForm({ name: '', estimated_cost: '', date: '', description: '', notes: '' })
  }

  return (
    <div style={{ background: 'var(--cream)', borderRadius: '4px', padding: '1rem', marginTop: '0.75rem' }}>
      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
          <label>{t('name')} *</label>
          <input value={form.name} onChange={upd('name')} placeholder="e.g. Eiffel Tower tour" />
        </div>
        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
          <label>{t('date')}</label>
          <input type="date" value={form.date} onChange={upd('date')} />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: '0.6rem' }}>
        <label>{t('estimatedCost')} ({currency})</label>
        <input type="number" min="0" value={form.estimated_cost} onChange={upd('estimated_cost')} />
      </div>
      <div className="form-group" style={{ marginBottom: '0.6rem' }}>
        <label>Description</label>
        <textarea value={form.description} onChange={upd('description')} rows={2} placeholder="What's included, meeting point, duration..." style={{ resize: 'vertical' }} />
      </div>
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label>{t('notes')}</label>
        <input value={form.notes} onChange={upd('notes')} placeholder="Book in advance, bring ID..." />
      </div>
      <button className="btn-gold" style={{ width: '100%' }} onClick={doAdd}>{t('add')} {t('tours')}</button>
    </div>
  )
}

// ── Tour list ─────────────────────────────────────────────────
function TourList({ items, onDelete, currency }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={{ padding: '0.85rem', background: 'white', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--burgundy)', marginBottom: '0.2rem' }}>{item.name}</div>
              {item.date && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>📅 {item.date}</div>}
              {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--charcoal)', margin: '0.3rem 0', lineHeight: 1.5 }}>{item.description}</div>}
              {item.notes && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>💡 {item.notes}</div>}
              <div style={{ fontSize: '0.82rem', color: 'var(--gold-dark)', fontWeight: 500, marginTop: '0.35rem' }}>{fmt(item.estimated_cost, currency)}</div>
            </div>
            <button className="btn-danger" onClick={() => onDelete(item.id)} style={{ marginLeft: '0.75rem' }}><TrashIcon /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Transport add ─────────────────────────────────────────────
function TransportAdd({ onAdd, t, currency }) {
  const [form, setForm] = useState({ category: 'airfare', description: '', amount: '', date: '' })
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const doAdd = () => {
    if (!form.amount) return
    onAdd({ ...form, amount: parseFloat(form.amount) || 0 })
    setForm({ category: 'airfare', description: '', amount: '', date: '' })
  }

  const catLabels = { airfare: '✈️ Airfare', train: '🚆 Train', bus: '🚌 Bus', rideshare: '🚕 Rideshare', car_rental: '🚗 Car Rental', other: '🧳 Other' }

  return (
    <div style={{ background: 'var(--cream)', borderRadius: '4px', padding: '0.75rem', marginTop: '0.75rem' }}>
      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
          <label>{t('transport')}</label>
          <select value={form.category} onChange={upd('category')}>
            {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '0.6rem' }}>
          <label>{t('date')}</label>
          <input type="date" value={form.date} onChange={upd('date')} />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: '0.6rem' }}>
        <label>Description</label>
        <input value={form.description} onChange={upd('description')} placeholder="e.g. CDG → LHR, Air France AF1234" />
      </div>
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label>{t('amount')} ({currency})</label>
        <input type="number" min="0" value={form.amount} onChange={upd('amount')} />
      </div>
      <button className="btn-gold" style={{ width: '100%' }} onClick={doAdd}>{t('add')} {t('transport')}</button>
    </div>
  )
}

// ── Transport list ────────────────────────────────────────────
function TransportList({ items, onDelete, currency }) {
  const catLabels = { airfare: '✈️', train: '🚆', bus: '🚌', rideshare: '🚕', car_rental: '🚗', other: '🧳' }
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div>
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.35rem' }}>
            {catLabels[cat] || '🧳'} {cat.replace('_', ' ')}
          </div>
          {catItems.map(item => (
            <div className="item-row" key={item.id}>
              <div style={{ flex: 1 }}>
                {item.description && <div className="item-name">{item.description}</div>}
                {item.date && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{item.date}</div>}
              </div>
              <span className="item-amount">{fmt(item.amount, currency)}</span>
              <button className="btn-danger" onClick={() => onDelete(item.id)}><TrashIcon /></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Day card (itinerary) ──────────────────────────────────────
function DayCard({ dayNum, items, onAdd, onDelete, t }) {
  const [act, setAct] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')

  const doAdd = () => {
    if (!act) return
    onAdd({ activity: act, time, notes })
    setAct(''); setTime(''); setNotes('')
  }

  return (
    <div className="day-card">
      <div style={{ marginBottom: '0.75rem' }}>
        <span className="day-label">{t('day')} {dayNum}</span>
      </div>
      {items.map(item => (
        <div className="activity-row" key={item.id}>
          {item.time && <span className="activity-time">{item.time}</span>}
          <div className="activity-content" style={{ flex: 1 }}>
            <div className="activity-name">{item.activity}</div>
            {item.notes && <div className="activity-note">{item.notes}</div>}
          </div>
          <button className="btn-danger" onClick={() => onDelete(item.id)} style={{ padding: '0.2rem 0.35rem' }}><TrashIcon /></button>
        </div>
      ))}
      <div className="in-add-row" style={{ marginTop: '0.5rem' }}>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ maxWidth: '90px' }} />
        <input placeholder={t('activity')} value={act} onChange={e => setAct(e.target.value)} />
        <input placeholder={t('notes')} value={notes} onChange={e => setNotes(e.target.value)} style={{ maxWidth: '140px' }} />
        <button onClick={doAdd}>{t('add')}</button>
      </div>
    </div>
  )
}

// ── Checklist add ─────────────────────────────────────────────
function ChecklistAdd({ onAdd, t }) {
  const [txt, setTxt] = useState('')
  return (
    <div className="in-add-row">
      <input
        placeholder={t('addItem')}
        value={txt}
        onChange={e => setTxt(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && txt) { onAdd(txt); setTxt('') } }}
      />
      <button onClick={() => { if (txt) { onAdd(txt); setTxt('') } }}>{t('add')}</button>
    </div>
  )
}

// ── Main TripDetail ───────────────────────────────────────────
export default function TripDetail({ trip, userId, profile, onBack }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('budget')
  const [accommodations, setAccommodations] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [bars, setBars] = useState([])
  const [beachClubs, setBeachClubs] = useState([])
  const [tours, setTours] = useState([])
  const [transport, setTransport] = useState([])
  const [itinerary, setItinerary] = useState([])
  const [checklist, setChecklist] = useState([])
  const [rate, setRate] = useState(null)
  const [savedRate, setSavedRate] = useState(null)
  const [convAmt, setConvAmt] = useState(100)
  const [convResult, setConvResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const destCurr = trip.destination_currency || 'USD'
  const homeCurr = profile?.home_currency || 'USD'
  const tripNights = diffDays(trip.start_date, trip.end_date)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [ac, r, b, bc, to, it, ch, tr] = await Promise.all([
      supabase.from('vp_accommodations').select('*').eq('trip_id', trip.id).eq('user_id', userId).order('check_in'),
      supabase.from('vp_restaurants').select('*').eq('trip_id', trip.id).eq('user_id', userId),
      supabase.from('vp_bars').select('*').eq('trip_id', trip.id).eq('user_id', userId),
      supabase.from('vp_beach_clubs').select('*').eq('trip_id', trip.id).eq('user_id', userId),
      supabase.from('vp_tours').select('*').eq('trip_id', trip.id).eq('user_id', userId).order('date'),
      supabase.from('vp_itinerary').select('*').eq('trip_id', trip.id).eq('user_id', userId).order('day_number'),
      supabase.from('vp_checklist').select('*').eq('trip_id', trip.id).eq('user_id', userId),
      supabase.from('vp_transport').select('*').eq('trip_id', trip.id).eq('user_id', userId).order('date'),
    ])
    if (ac.data) setAccommodations(ac.data)
    if (r.data) setRestaurants(r.data)
    if (b.data) setBars(b.data)
    if (bc.data) setBeachClubs(bc.data)
    if (to.data) setTours(to.data)
    if (it.data) setItinerary(it.data)
    if (ch.data) setChecklist(ch.data)
    if (tr.data) setTransport(tr.data)

    if (destCurr !== homeCurr) {
      const { rate: r2, date: d2 } = await getRate(destCurr, homeCurr)
      setRate({ value: r2, date: d2 })
      const { data: sr } = await supabase.from('vp_exchange_rates')
        .select('*').eq('trip_id', trip.id).eq('from_currency', destCurr).eq('to_currency', homeCurr)
      if (sr && sr.length > 0) {
        setSavedRate(sr[0])
        await supabase.from('vp_exchange_rates').update({ rate_current: r2 }).eq('id', sr[0].id)
      } else {
        await supabase.from('vp_exchange_rates').insert({
          trip_id: trip.id, user_id: userId,
          from_currency: destCurr, to_currency: homeCurr,
          rate_at_creation: r2, rate_current: r2,
          recorded_at: new Date().toISOString()
        })
        setSavedRate({ rate_at_creation: r2, rate_current: r2 })
      }
    }
    setLoading(false)
  }, [trip.id, userId, destCurr, homeCurr])

  useEffect(() => { loadAll() }, [loadAll])

  const totalAccommodations = accommodations.reduce((sum, a) => {
    const n = diffDays(a.check_in, a.check_out)
    return sum + (a.rate_per_night || 0) * n
  }, 0)
  const totalRestaurants = restaurants.reduce((a, b) => a + (b.estimated_cost || 0), 0)
  const totalBars = bars.reduce((a, b) => a + (b.estimated_cost || 0), 0)
  const totalBeachClubs = beachClubs.reduce((a, b) => a + (b.estimated_cost || 0), 0)
  const totalDining = totalRestaurants + totalBars + totalBeachClubs
  const totalTours = tours.reduce((a, b) => a + (b.estimated_cost || 0), 0)
  const totalTransport = transport.reduce((a, b) => a + (b.amount || 0), 0)
  const grandTotal = totalAccommodations + totalDining + totalTours + totalTransport
  const grandConverted = rate ? grandTotal * rate.value : grandTotal

  const addEntity = async (table, data) => {
    await supabase.from(table).insert({ ...data, trip_id: trip.id, user_id: userId })
    loadAll()
  }
  const delEntity = async (table, id) => {
    await supabase.from(table).delete().eq('id', id)
    loadAll()
  }
  const toggleCheck = async (item) => {
    await supabase.from('vp_checklist').update({ done: !item.done }).eq('id', item.id)
    setChecklist(p => p.map(x => x.id === item.id ? { ...x, done: !x.done } : x))
  }

  const runConverter = async () => {
    const { rate: r } = await getRate(destCurr, homeCurr)
    setConvResult((parseFloat(convAmt) || 0) * r)
  }

  const rateVariation = savedRate && rate
    ? ((rate.value - savedRate.rate_at_creation) / savedRate.rate_at_creation * 100) : 0
  const budgetImpact = savedRate && rate
    ? grandTotal * (rate.value - savedRate.rate_at_creation) : 0

  const pieData = [
    { name: t('accommodation'), value: totalAccommodations },
    { name: t('dining'), value: totalDining },
    { name: t('tours'), value: totalTours },
    { name: t('transport'), value: totalTransport },
  ].filter(d => d.value > 0)
  const PIE_COLORS = ['#6B1E2E', '#C9A96E', '#8B2E42', '#A07840']

  const tabs = [
    { id: 'budget', label: t('budget') },
    { id: 'accommodation', label: t('accommodation') },
    { id: 'dining', label: t('dining') },
    { id: 'tours', label: t('tours') },
    { id: 'transport', label: t('transport') },
    { id: 'itinerary', label: t('itinerary') },
    { id: 'checklist', label: t('checklist') },
    { id: 'exchange', label: t('exchange') },
    { id: 'ai', label: 'AI' },
  ]

  return (
    <div>
      <div className="top-bar">
        <button className="btn-icon" onClick={onBack}><BackIcon /></button>
        <h2 style={{ flex: 1, marginLeft: '0.5rem' }}>{trip.city}, {trip.country}</h2>
        <span className="trip-badge">{tripNights} {t('nights')}</span>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>{t('loading')}</div>
        ) : (
          <>
            {/* Grand Total Banner */}
            <div className="budget-total">
              <div className="budget-total-label">{t('tripBudget')}</div>
              <div className="budget-total-amount">{fmt(grandTotal, destCurr)}</div>
              {rate && homeCurr !== destCurr && (
                <div className="budget-total-converted">≈ {fmt(grandConverted, homeCurr)}</div>
              )}
            </div>

            <div className="trip-tabs">
              {tabs.map(tb => (
                <button key={tb.id} className={`trip-tab${tab === tb.id ? ' active' : ''}`} onClick={() => setTab(tb.id)}>
                  {tb.label}
                </button>
              ))}
            </div>

            {/* BUDGET */}
            {tab === 'budget' && (
              <div>
                <div className="card card-sm" style={{ marginBottom: '1rem' }}>
                  {[
                    [t('accommodation'), totalAccommodations],
                    [t('dining'), totalDining],
                    [t('tours'), totalTours],
                    [t('transport'), totalTransport],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--cream-dark)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{fmt(val, destCurr)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0', fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: 'var(--burgundy)', borderTop: '2px solid var(--burgundy)', marginTop: '0.5rem' }}>
                    <span>Total</span><span>{fmt(grandTotal, destCurr)}</span>
                  </div>
                  {rate && homeCurr !== destCurr && (
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--gold-dark)', marginTop: '0.35rem' }}>
                      ≈ {fmt(grandConverted, homeCurr)} · 1 {destCurr} = {rate.value.toFixed(4)} {homeCurr}
                    </div>
                  )}
                </div>
                {pieData.length > 0 && (
                  <div className="card card-sm">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => fmt(v, destCurr)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* ACCOMMODATION */}
            {tab === 'accommodation' && (
              <div className="card card-sm">
                <div className="section-title">🏨 {t('accommodation')}</div>
                <AccommodationList items={accommodations} onDelete={id => delEntity('vp_accommodations', id)} currency={destCurr} t={t} />
                {totalAccommodations > 0 && <SubtotalBar label={`${t('accommodation')} total`} total={totalAccommodations} currency={destCurr} />}
                <AccommodationAdd onAdd={d => addEntity('vp_accommodations', d)} t={t} currency={destCurr} />
              </div>
            )}

            {/* DINING */}
            {tab === 'dining' && (
              <div>
                <div className="card card-sm" style={{ marginBottom: '0.75rem' }}>
                  <div className="section-title">🍽️ {t('restaurants')}</div>
                  <GenericList items={restaurants} onDelete={id => delEntity('vp_restaurants', id)} currency={destCurr} />
                  {totalRestaurants > 0 && <SubtotalBar label={`${t('restaurants')} total`} total={totalRestaurants} currency={destCurr} />}
                  <GenericAdd onAdd={d => addEntity('vp_restaurants', d)} t={t} currency={destCurr} />
                </div>
                <div className="card card-sm" style={{ marginBottom: '0.75rem' }}>
                  <div className="section-title">🍸 {t('bars')}</div>
                  <GenericList items={bars} onDelete={id => delEntity('vp_bars', id)} currency={destCurr} />
                  {totalBars > 0 && <SubtotalBar label={`${t('bars')} total`} total={totalBars} currency={destCurr} />}
                  <GenericAdd onAdd={d => addEntity('vp_bars', d)} t={t} currency={destCurr} />
                </div>
                <div className="card card-sm">
                  <div className="section-title">🏖️ {t('beachClubs')}</div>
                  <GenericList items={beachClubs} onDelete={id => delEntity('vp_beach_clubs', id)} currency={destCurr} />
                  {totalBeachClubs > 0 && <SubtotalBar label={`${t('beachClubs')} total`} total={totalBeachClubs} currency={destCurr} />}
                  <GenericAdd onAdd={d => addEntity('vp_beach_clubs', d)} t={t} currency={destCurr} />
                </div>
                {totalDining > 0 && (
                  <div style={{ padding: '1rem', background: 'var(--burgundy-dark)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{t('dining')} Grand Total</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold-light)' }}>{fmt(totalDining, destCurr)}</span>
                  </div>
                )}
              </div>
            )}

            {/* TOURS */}
            {tab === 'tours' && (
              <div className="card card-sm">
                <div className="section-title">🎭 {t('tours')}</div>
                <TourList items={tours} onDelete={id => delEntity('vp_tours', id)} currency={destCurr} />
                {totalTours > 0 && <SubtotalBar label={`${t('tours')} total`} total={totalTours} currency={destCurr} />}
                <TourAdd onAdd={d => addEntity('vp_tours', d)} t={t} currency={destCurr} />
              </div>
            )}

            {/* TRANSPORT */}
            {tab === 'transport' && (
              <div className="card card-sm">
                <div className="section-title">✈️ {t('transport')}</div>
                <TransportList items={transport} onDelete={id => delEntity('vp_transport', id)} currency={destCurr} />
                {totalTransport > 0 && <SubtotalBar label={`${t('transport')} total`} total={totalTransport} currency={destCurr} />}
                <TransportAdd onAdd={d => addEntity('vp_transport', d)} t={t} currency={destCurr} />
              </div>
            )}

            {/* ITINERARY */}
            {tab === 'itinerary' && (
              <div>
                {Array.from({ length: Math.max(tripNights, 1) }, (_, i) => {
                  const dayNum = i + 1
                  return (
                    <DayCard
                      key={dayNum}
                      dayNum={dayNum}
                      items={itinerary.filter(x => x.day_number === dayNum)}
                      onAdd={d => addEntity('vp_itinerary', { ...d, day_number: dayNum })}
                      onDelete={id => delEntity('vp_itinerary', id)}
                      t={t}
                    />
                  )
                })}
              </div>
            )}

            {/* CHECKLIST */}
            {tab === 'checklist' && (
              <div className="card card-sm">
                <div className="section-title">✅ {t('checklist')}</div>
                {checklist.map(item => (
                  <div className="check-item" key={item.id}>
                    <div className={`check-box${item.done ? ' checked' : ''}`} onClick={() => toggleCheck(item)}>
                      {item.done && <CheckIcon />}
                    </div>
                    <span className={`check-text${item.done ? ' done' : ''}`}>{item.item_text}</span>
                    <button className="btn-danger" onClick={() => delEntity('vp_checklist', item.id)}><TrashIcon /></button>
                  </div>
                ))}
                <ChecklistAdd onAdd={text => addEntity('vp_checklist', { item_text: text, done: false })} t={t} />
              </div>
            )}

            {/* EXCHANGE */}
            {tab === 'exchange' && (
              <div>
                {homeCurr === destCurr ? (
                  <div className="card card-sm">
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Home and destination currencies are the same ({homeCurr}).</p>
                  </div>
                ) : (
                  <>
                    <div className="exchange-card">
                      <div className="section-title">💱 {t('exchangeDashboard')}</div>
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div><div className="stat-label">{t('homeCurr')}</div><div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem' }}>{homeCurr}</div></div>
                        <div><div className="stat-label">{t('destCurr')}</div><div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem' }}>{destCurr}</div></div>
                        {rate && <div><div className="stat-label">{t('currentRate')}</div><div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem' }}>1 {destCurr} = {rate.value.toFixed(4)} {homeCurr}</div><div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{rate.date}</div></div>}
                        {savedRate && <div><div className="stat-label">{t('rateAtCreation')}</div><div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem' }}>1 {destCurr} = {(savedRate.rate_at_creation || 0).toFixed(4)} {homeCurr}</div></div>}
                      </div>
                      {savedRate && rate && (
                        <div style={{ padding: '0.75rem', background: 'var(--cream)', borderRadius: '4px', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                          <div>
                            <div className="stat-label">{t('variation')}</div>
                            <span className={`rate-badge ${rateVariation >= 0 ? 'rate-up' : 'rate-down'}`}>{rateVariation >= 0 ? '+' : ''}{rateVariation.toFixed(2)}%</span>
                          </div>
                          <div>
                            <div className="stat-label">{t('budgetImpact')}</div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: budgetImpact >= 0 ? 'var(--success-text)' : 'var(--error-text)' }}>
                              {budgetImpact >= 0 ? '+' : ''}{fmt(budgetImpact, homeCurr)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="exchange-card">
                      <div className="section-title">🔄 {t('converter')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--cream)', padding: '1rem', borderRadius: '4px' }}>
                        <input type="number" value={convAmt} onChange={e => setConvAmt(e.target.value)} style={{ width: '120px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '2px', fontSize: '1rem', fontFamily: 'Playfair Display,serif' }} />
                        <span style={{ fontWeight: 500 }}>{destCurr}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>=</span>
                        {convResult != null
                          ? <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: 'var(--burgundy)', fontWeight: 600 }}>{convResult.toFixed(2)} {homeCurr}</span>
                          : <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>—</span>}
                        <button className="btn-gold" style={{ marginLeft: 'auto' }} onClick={runConverter}>{t('converter')}</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* AI */}
            {tab === 'ai' && (
              <div className="card card-sm">
                <TripAIChat trip={trip} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

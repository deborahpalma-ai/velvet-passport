import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { COUNTRIES, COUNTRY_CURRENCY, diffDays } from '../../lib/constants'

export default function TripFormModal({ onClose, onSaved, userId, supabase }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    country: '', region: '', city: '',
    start_date: '', end_date: '', currency: ''
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (form.country) {
      setForm(f => ({ ...f, currency: COUNTRY_CURRENCY[form.country] || 'USD' }))
    }
  }, [form.country])

  const nights = diffDays(form.start_date, form.end_date)

  const save = async () => {
    if (!form.country || !form.city || !form.start_date || !form.end_date)
      return setErr(t('fillRequired'))
    setLoading(true)
    const { error } = await supabase.from('vp_trips').insert({
      user_id: userId,
      country: form.country,
      region: form.region,
      city: form.city,
      start_date: form.start_date,
      end_date: form.end_date,
      destination_currency: form.currency || 'USD',
      created_at: new Date().toISOString()
    })
    setLoading(false)
    if (error) return setErr(error.message || t('error'))
    onSaved()
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2>✦ {t('newTrip')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {err && <div className="alert alert-error">{err}</div>}

          <div className="form-group">
            <label>{t('country')} *</label>
            <select value={form.country} onChange={upd('country')}>
              <option value="">— {t('country')} —</option>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {form.currency && (
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>💱</span> {t('currency')}: <strong>{form.currency}</strong>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label>{t('region')}</label>
              <input value={form.region} onChange={upd('region')} placeholder="e.g. Provence" />
            </div>
            <div className="form-group">
              <label>{t('city')} *</label>
              <input value={form.city} onChange={upd('city')} placeholder="e.g. Paris" />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>{t('startDate')} *</label>
              <input type="date" value={form.start_date} onChange={upd('start_date')} />
            </div>
            <div className="form-group">
              <label>{t('endDate')} *</label>
              <input type="date" value={form.end_date} onChange={upd('end_date')} />
            </div>
          </div>

          {nights > 0 && (
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--cream)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--burgundy)', fontFamily: 'Playfair Display, serif' }}>
              ✦ {nights} {t('nights')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn-gold" onClick={save} disabled={loading}>
            {loading ? '…' : t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

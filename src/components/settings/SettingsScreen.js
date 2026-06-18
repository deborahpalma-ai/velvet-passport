import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { COUNTRIES, CURRENCIES, COUNTRY_CURRENCY } from '../../lib/constants'

export default function SettingsScreen({ user, profile, onSave }) {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState({
    full_name: '',
    residence_country: '',
    home_currency: 'USD',
  })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || user?.user_metadata?.full_name || '',
        residence_country: profile.residence_country || '',
        home_currency: profile.home_currency || 'USD',
      })
    }
  }, [profile, user])

  const upd = k => e => {
    const updated = { ...form, [k]: e.target.value }
    if (k === 'residence_country' && COUNTRY_CURRENCY[e.target.value]) {
      updated.home_currency = COUNTRY_CURRENCY[e.target.value]
    }
    setForm(updated)
  }

  const changeLang = e => {
    i18n.changeLanguage(e.target.value)
    localStorage.setItem('vp_lang', e.target.value)
  }

  const save = async () => {
    setMsg(''); setErr(''); setLoading(true)
    const { error } = await onSave(form)
    setLoading(false)
    if (error) return setErr(error.message || t('error'))
    setMsg(t('profileSaved'))
  }

  return (
    <div>
      <div className="top-bar"><h2>{t('settings')}</h2></div>
      <div className="page-content">
        <div className="card card-sm" style={{ maxWidth: '480px' }}>
          <div className="section-title">👤 {t('settings')}</div>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}

          <div className="form-group">
            <label>{t('fullName')}</label>
            <input value={form.full_name} onChange={upd('full_name')} />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>{t('residenceCountry')}</label>
            <select value={form.residence_country} onChange={upd('residence_country')}>
              <option value="">— Select —</option>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t('homeCurrency')}</label>
            <select value={form.home_currency} onChange={upd('home_currency')}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t('language')}</label>
            <select value={i18n.language} onChange={changeLang}>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="es">Español</option>
            </select>
          </div>
          <button className="btn-gold" style={{ width: '100%' }} onClick={save} disabled={loading}>
            {loading ? '…' : t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

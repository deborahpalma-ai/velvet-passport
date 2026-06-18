import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CURRENCIES, getRate } from '../../lib/constants'

export default function ExchangeScreen({ profile }) {
  const { t } = useTranslation()
  const [from, setFrom] = useState(profile?.home_currency || 'USD')
  const [to, setTo] = useState('EUR')
  const [amt, setAmt] = useState(100)
  const [result, setResult] = useState(null)
  const [rateInfo, setRateInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const convert = async () => {
    setLoading(true)
    const { rate, date } = await getRate(from, to)
    setResult((parseFloat(amt) || 0) * rate)
    setRateInfo({ rate, date })
    setLoading(false)
  }

  return (
    <div>
      <div className="top-bar"><h2>{t('exchange')}</h2></div>
      <div className="page-content">
        <div className="card card-sm" style={{ maxWidth: '480px' }}>
          <div className="section-title">💱 {t('converter')}</div>
          <div className="form-group">
            <label>{t('amount')}</label>
            <input type="number" value={amt} onChange={e => setAmt(e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>{t('from')}</label>
              <select value={from} onChange={e => setFrom(e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t('to')}</label>
              <select value={to} onChange={e => setTo(e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-gold" style={{ width: '100%' }} onClick={convert} disabled={loading}>
            {loading ? '…' : t('converter')}
          </button>
          {result != null && (
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--cream)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.8rem', color: 'var(--burgundy)' }}>
                {result.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
              </div>
              {rateInfo && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  1 {from} = {rateInfo.rate.toFixed(4)} {to} · {rateInfo.date}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { useTranslation } from 'react-i18next'
import { diffDays } from '../../lib/constants'

const PassportIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, color: 'var(--burgundy)' }}>
    <rect x="3" y="2" width="18" height="20" rx="2"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M7 18c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
  </svg>
)

export default function Dashboard({ trips, onNewTrip, onSelectTrip }) {
  const { t } = useTranslation()
  const today = new Date()
  const upcoming = trips
    .filter(tr => new Date(tr.start_date) >= today)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  const next = upcoming[0]
  const daysAway = next
    ? Math.round((new Date(next.start_date) - today) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div>
      <div className="top-bar">
        <h2>{t('dashboard')}</h2>
        <div className="top-bar-actions">
          <button className="btn-gold sm" onClick={onNewTrip}>+ {t('newTrip')}</button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">{t('totalTrips')}</div>
            <div className="stat-value">{trips.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('nextTrip')}</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>
              {next ? `${next.city}, ${next.country}` : '—'}
            </div>
            {next && <div className="stat-sub">{next.start_date}</div>}
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('daysAway')}</div>
            <div className="stat-value">{daysAway != null ? daysAway : '—'}</div>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><PassportIcon /></div>
            <h3>{t('noTrips')}</h3>
            <p>{t('noTripsDesc')}</p>
            <button className="btn-gold" onClick={onNewTrip}>{t('startJourney')}</button>
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map(tr => (
              <div key={tr.id} className="trip-card" onClick={() => onSelectTrip(tr)}>
                <div className="trip-dest">{tr.city}, {tr.country}</div>
                <div className="trip-dates">{tr.start_date} → {tr.end_date}</div>
                <div className="trip-badge">{diffDays(tr.start_date, tr.end_date)} {t('nights')} · {tr.destination_currency}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

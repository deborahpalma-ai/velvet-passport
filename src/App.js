import React, { useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { useTrips } from './hooks/useTrips'
import AuthScreen from './components/auth/AuthScreen'
import Sidebar from './components/shared/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import TripsScreen from './components/trips/TripsScreen'
import TripDetail from './components/trips/TripDetail'
import TripFormModal from './components/trips/TripFormModal'
import ExchangeScreen from './components/exchange/ExchangeScreen'
import SettingsScreen from './components/settings/SettingsScreen'

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth()
  const { profile, saveProfile } = useProfile(user?.id)
  const { trips, loading: tripsLoading, reloadTrips } = useTrips(user?.id)

  const [page, setPage] = useState('dashboard')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showNewTrip, setShowNewTrip] = useState(false)

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--burgundy-dark)' }}>
        <div style={{ color: 'var(--gold-light)', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', letterSpacing: '0.1em' }}>
          ✦ Velvet Passport
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onLogin={{ signIn, signUp, resetPassword }} />
  }

  const navigate = (p) => {
    setPage(p)
    setSelectedTrip(null)
  }

  const handleSelectTrip = (tr) => {
    setSelectedTrip(tr)
    setPage('trips')
  }

  const handleNewTripSaved = () => {
    setShowNewTrip(false)
    reloadTrips()
  }

  return (
    <div className="app-layout">
      <Sidebar
        page={page}
        onNavigate={navigate}
        user={user}
        profile={profile}
        onSignOut={signOut}
      />

      <main className="main-content">
        {selectedTrip ? (
          <TripDetail
            trip={selectedTrip}
            userId={user.id}
            profile={profile}
            onBack={() => setSelectedTrip(null)}
          />
        ) : page === 'dashboard' ? (
          <Dashboard
            trips={trips}
            onNewTrip={() => setShowNewTrip(true)}
            onSelectTrip={handleSelectTrip}
          />
        ) : page === 'trips' ? (
          <TripsScreen
            trips={trips}
            loading={tripsLoading}
            onNewTrip={() => setShowNewTrip(true)}
            onSelectTrip={handleSelectTrip}
          />
        ) : page === 'exchange' ? (
          <ExchangeScreen profile={profile} />
        ) : page === 'settings' ? (
          <SettingsScreen
            user={user}
            profile={profile}
            onSave={saveProfile}
          />
        ) : null}
      </main>

      {/* FAB for mobile */}
      {!selectedTrip && (page === 'dashboard' || page === 'trips') && (
        <button className="fab" onClick={() => setShowNewTrip(true)}>+</button>
      )}

      {showNewTrip && (
        <TripFormModal
          userId={user.id}
          supabase={supabase}
          onClose={() => setShowNewTrip(false)}
          onSaved={handleNewTripSaved}
        />
      )}
    </div>
  )
}
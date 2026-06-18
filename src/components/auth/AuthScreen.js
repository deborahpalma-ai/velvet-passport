import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AuthScreen({ onLogin }) {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleLogin = async () => {
    setErr('')
    if (!form.email || !form.password) return setErr(t('fillRequired'))
    setLoading(true)
    const result = await onLogin.signIn(form.email, form.password)
    setLoading(false)
    if (result.error) setErr(result.error.message || t('error'))
  }

  const handleRegister = async () => {
    setErr('')
    if (!form.name || !form.email || !form.password) return setErr(t('fillRequired'))
    if (form.password !== form.confirm) return setErr(t('passwordMismatch'))
    setLoading(true)
    const result = await onLogin.signUp(form.email, form.password, form.name)
    setLoading(false)
    if (result.error) return setErr(result.error.message || t('error'))
    setMsg('Account created! Check your email to confirm, then sign in.')
    setTab('login')
  }

  const handleReset = async () => {
    setErr('')
    if (!form.email) return setErr(t('fillRequired'))
    setLoading(true)
    const result = await onLogin.resetPassword(form.email)
    setLoading(false)
    if (result.error) return setErr(result.error.message || t('error'))
    setMsg(t('resetSent'))
    setTab('login')
  }

  const changeLang = e => {
    i18n.changeLanguage(e.target.value)
    localStorage.setItem('vp_lang', e.target.value)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <select value={i18n.language} onChange={changeLang} className="lang-select-auth">
          <option value="en">EN</option>
          <option value="pt">PT</option>
          <option value="es">ES</option>
        </select>

        <div className="auth-logo">
          <h1>✦ {t('appName')}</h1>
          <p>{t('appTagline')}</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        {tab === 'reset' ? (
          <>
            <div className="form-group">
              <label>{t('email')}</label>
              <input type="email" value={form.email} onChange={upd('email')} placeholder="your@email.com" />
            </div>
            <button className="btn-primary" onClick={handleReset} disabled={loading}>
              {loading ? '…' : t('resetPw')}
            </button>
            <div className="auth-divider"><span>or</span></div>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => { setTab('login'); setErr(''); setMsg('') }}>
              {t('backToLogin')}
            </button>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setErr('') }}>{t('login')}</button>
              <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setErr('') }}>{t('register')}</button>
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label>{t('fullName')}</label>
                <input value={form.name} onChange={upd('name')} />
              </div>
            )}
            <div className="form-group">
              <label>{t('email')}</label>
              <input type="email" value={form.email} onChange={upd('email')} />
            </div>
            <div className="form-group">
              <label>{t('password')}</label>
              <input type="password" value={form.password} onChange={upd('password')} />
            </div>
            {tab === 'register' && (
              <div className="form-group">
                <label>{t('confirmPassword')}</label>
                <input type="password" value={form.confirm} onChange={upd('confirm')} />
              </div>
            )}
            <button className="btn-primary" onClick={tab === 'login' ? handleLogin : handleRegister} disabled={loading}>
              {loading ? '…' : tab === 'login' ? t('login') : t('register')}
            </button>

            {tab === 'login' && (
              <>
                <div className="auth-divider"><span>or</span></div>
                <button className="btn-ghost" style={{ width: '100%' }} onClick={() => { setTab('reset'); setErr(''); setMsg('') }}>
                  {t('forgotPw')}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

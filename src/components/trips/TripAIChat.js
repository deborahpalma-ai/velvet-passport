import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const SYSTEM_PROMPTS = {
  en: (trip) => `You are a sophisticated travel intelligence assistant for Velvet Passport, a premium travel platform. 
You are helping a user plan their trip to ${trip.city}, ${trip.country} (${trip.start_date} to ${trip.end_date}).

Your role is to answer travel questions conversationally and helpfully. You can answer questions about:
- Climate and weather for any destination or time of year
- Best periods to visit destinations and why
- Local events, festivals, and cultural happenings
- What to expect weather-wise during specific dates
- Seasonal tips and travel advice
- General destination information

Answer ONLY what the user asks. Be concise, sophisticated, and informative.
Do NOT proactively suggest hotels, restaurants, or tourist attractions unless specifically asked.
Always respond in English.`,

  pt: (trip) => `Você é um sofisticado assistente de inteligência de viagens do Velvet Passport, uma plataforma premium de viagens.
Você está ajudando um usuário a planejar sua viagem para ${trip.city}, ${trip.country} (${trip.start_date} a ${trip.end_date}).

Seu papel é responder perguntas de viagem de forma conversacional e útil. Você pode responder perguntas sobre:
- Clima e tempo para qualquer destino ou época do ano
- Melhores períodos para visitar destinos e por quê
- Eventos locais, festivais e acontecimentos culturais
- O que esperar do clima durante datas específicas
- Dicas sazonais e conselhos de viagem
- Informações gerais sobre destinos

Responda APENAS o que o usuário perguntar. Seja conciso, sofisticado e informativo.
NÃO sugira proativamente hotéis, restaurantes ou atrações turísticas, a menos que seja especificamente solicitado.
Sempre responda em Português.`,

  es: (trip) => `Eres un sofisticado asistente de inteligencia de viajes de Velvet Passport, una plataforma premium de viajes.
Estás ayudando a un usuario a planificar su viaje a ${trip.city}, ${trip.country} (${trip.start_date} a ${trip.end_date}).

Tu función es responder preguntas de viaje de forma conversacional y útil. Puedes responder preguntas sobre:
- Clima y tiempo para cualquier destino o época del año
- Mejores períodos para visitar destinos y por qué
- Eventos locales, festivales y eventos culturales
- Qué esperar del clima durante fechas específicas
- Consejos de temporada y consejos de viaje
- Información general sobre destinos

Responde SOLO lo que el usuario pregunta. Sé conciso, sofisticado e informativo.
NO sugieras proactivamente hoteles, restaurantes o atracciones turísticas a menos que se solicite específicamente.
Siempre responde en Español.`
}

const PLACEHOLDERS = {
  en: "Ask anything about your destination...",
  pt: "Pergunte qualquer coisa sobre seu destino...",
  es: "Pregunta cualquier cosa sobre tu destino..."
}

const SUGGESTIONS = {
  en: [
    "What's the weather like in February?",
    "What's the best time of year to visit?",
    "Are there any festivals during my trip?",
    "What should I pack for this time of year?"
  ],
  pt: [
    "Como é o clima em fevereiro?",
    "Qual é a melhor época do ano para visitar?",
    "Há algum festival durante minha viagem?",
    "O que devo levar para essa época do ano?"
  ],
  es: [
    "¿Cómo es el clima en febrero?",
    "¿Cuál es la mejor época del año para visitar?",
    "¿Hay algún festival durante mi viaje?",
    "¿Qué debo llevar para esta época del año?"
  ]
}

export default function TripAIChat({ trip }) {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'en'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const question = (text || input).trim()
    if (!question || loading) return
    setInput('')

    const userMsg = { role: 'user', content: question }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      // In development, use localhost proxy; in production use /api/ai
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api/ai'
        : '/api/ai'

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: (SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en)(trip)
        })
      })

      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ' + (data.error || 'Something went wrong.') }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Unable to connect. Please try again.' }])
    }
    setLoading(false)
  }

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en
  const placeholder = PLACEHOLDERS[lang] || PLACEHOLDERS.en

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div className="section-title">🤖 AI Travel Assistant</div>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          {lang === 'pt' && 'Pergunte sobre clima, eventos, melhor época para visitar e muito mais.'}
          {lang === 'es' && 'Pregunta sobre clima, eventos, mejor época para visitar y mucho más.'}
          {lang === 'en' && 'Ask about climate, events, best time to visit, and more.'}
        </p>
      </div>

      {/* Suggestions (only when no messages) */}
      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              style={{
                padding: '0.4rem 0.75rem',
                background: 'var(--cream)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                color: 'var(--charcoal)',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseOver={e => { e.target.style.background = 'var(--cream-dark)'; e.target.style.borderColor = 'var(--gold)' }}
              onMouseOut={e => { e.target.style.background = 'var(--cream)'; e.target.style.borderColor = 'var(--border)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', marginBottom: '1rem',
        maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '0.75rem'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '0.75rem 1rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--burgundy)' : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--charcoal)',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '0.75rem 1rem', background: 'white',
              border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px'
            }}>
              <div className="ai-loading" style={{ margin: 0, padding: 0 }}>
                <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
        borderTop: '1px solid var(--border)', paddingTop: '1rem'
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={placeholder}
          rows={2}
          style={{
            flex: 1, padding: '0.6rem 0.9rem',
            border: '1px solid var(--border)', borderRadius: '8px',
            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
            resize: 'none', outline: 'none', lineHeight: 1.5,
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--burgundy)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            padding: '0.6rem 0.9rem',
            background: input.trim() && !loading ? 'var(--burgundy)' : 'var(--border)',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s', display: 'flex', alignItems: 'center'
          }}
        >
          <SendIcon />
        </button>
      </div>

      {messages.length > 0 && (
        <button
          onClick={() => setMessages([])}
          style={{
            marginTop: '0.5rem', background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer',
            letterSpacing: '0.05em', textAlign: 'center'
          }}
        >
          {lang === 'pt' ? 'Limpar conversa' : lang === 'es' ? 'Limpiar conversación' : 'Clear conversation'}
        </button>
      )}
    </div>
  )
}

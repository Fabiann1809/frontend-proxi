import { useCallback, useState } from 'react'
import { Loader2, Send, Wifi, WifiOff } from 'lucide-react'
import { PLAN_COLORS } from './constants'
import { useChat } from './hooks/useChat'
import { useQuota } from './hooks/useQuota'
import { useRateLimit } from './hooks/useRateLimit'

function App() {
  const {
    quotaStatus,
    loading: quotaLoading,
    error: quotaError,
    refreshQuota,
  } = useQuota()
  const { isLimited, secondsRemaining, triggerLimit } = useRateLimit()
  const [quotaNoticeOpen, setQuotaNoticeOpen] = useState(false)

  const onQuotaExceeded = useCallback(() => {
    setQuotaNoticeOpen(true)
  }, [])

  const { messages, isLoading, sendMessage } = useChat({
    refreshQuota,
    triggerLimit,
    onQuotaExceeded,
  })

  const [draft, setDraft] = useState('')

  const handleSend = () => {
    void sendMessage(draft)
    setDraft('')
  }

  const apiConnected = !quotaLoading && quotaStatus !== null && !quotaError
  const apiFailed = !quotaLoading && quotaError !== null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 pb-24 md:p-8">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Prueba de conexión con el API
          </h1>
          <p className="text-sm text-slate-400">
            Comprueba si el front en Vercel llega a tu backend (Render).
          </p>
        </header>

        <section
          className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
          aria-live="polite"
        >
          {quotaLoading ? (
            <>
              <Loader2 className="size-5 shrink-0 animate-spin text-slate-400" />
              <span className="text-sm">Conectando con el servidor…</span>
            </>
          ) : apiConnected ? (
            <>
              <Wifi className="size-5 shrink-0 text-emerald-400" />
              <span className="text-sm text-emerald-100">
                Conectado al API
                {quotaStatus ? (
                  <span className="ml-2 text-slate-400">
                    · Plan{' '}
                    <span
                      className="font-medium"
                      style={{
                        color: PLAN_COLORS[quotaStatus.plan] ?? '#94a3b8',
                      }}
                    >
                      {quotaStatus.plan}
                    </span>
                    · Tokens restantes: {quotaStatus.tokensRemaining}
                  </span>
                ) : null}
              </span>
            </>
          ) : apiFailed ? (
            <>
              <WifiOff className="size-5 shrink-0 text-rose-400" />
              <div className="text-sm">
                <p className="text-rose-100">No se pudo cargar la cuota desde el API.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Revisa <code className="rounded bg-slate-800 px-1">VITE_API_URL</code> en
                  Vercel y que el backend esté en marcha.
                </p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="size-5 shrink-0 text-amber-400" />
              <span className="text-sm text-amber-100">Sin datos de cuota.</span>
            </>
          )}
          <button
            type="button"
            onClick={() => void refreshQuota()}
            className="ml-auto rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Actualizar cuota
          </button>
        </section>

        {isLimited ? (
          <div
            className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
            role="status"
          >
            Límite de solicitudes activo. Espera{' '}
            <strong>{secondsRemaining}</strong> s antes de reintentar.
          </div>
        ) : null}

        {quotaNoticeOpen ? (
          <div className="rounded-lg border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">
            <p>Has alcanzado el límite de cuota según el servidor.</p>
            <button
              type="button"
              className="mt-2 text-xs underline hover:text-white"
              onClick={() => setQuotaNoticeOpen(false)}
            >
              Cerrar
            </button>
          </div>
        ) : null}

        <section className="flex min-h-[240px] flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Chat (mensajes de prueba)
          </div>
          <ul className="max-h-[min(50vh,420px)] flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <li className="text-center text-sm text-slate-500">
                Escribe un mensaje y pulsa Enviar. Deberías ver la petición en la pestaña
                Red del navegador.
              </li>
            ) : (
              messages.map((m) => (
                <li
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : m.error
                          ? 'border border-rose-800/60 bg-rose-950/50 text-rose-100'
                          : 'bg-slate-800 text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.tokensUsed != null && !m.error ? (
                      <p className="mt-1 text-xs opacity-70">Tokens: {m.tokensUsed}</p>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
          <div className="mx-auto flex max-w-3xl gap-2">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!isLoading && draft.trim()) handleSend()
                }
              }}
              placeholder="Escribe un mensaje de prueba…"
              className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isLoading || quotaLoading}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || quotaLoading || !draft.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

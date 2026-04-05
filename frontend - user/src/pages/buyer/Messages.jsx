import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageSquare, Send, Loader2, Building2 } from 'lucide-react'
import { messagesService } from '../../services/messages.service'
import { authService } from '../../services/auth.service'

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return date.toLocaleDateString()
}

function Messages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const supplierIdParam = searchParams.get('supplierId')

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await messagesService.listThreads()
      setThreads(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e?.message || 'Failed to load conversations')
      setThreads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (!supplierIdParam || loading) return
    let cancelled = false
    ;(async () => {
      try {
        const thread = await messagesService.getOrCreateThread({ supplierId: supplierIdParam })
        if (cancelled || !thread?.id) return
        setSelectedId(thread.id)
        const next = new URLSearchParams(searchParams)
        next.delete('supplierId')
        setSearchParams(next, { replace: true })
        await loadThreads()
      } catch (_) {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supplierIdParam, loading, searchParams, setSearchParams, loadThreads])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setMsgLoading(true)
        const list = await messagesService.listMessages(selectedId)
        if (!cancelled) setMessages(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setMsgLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const selectedThread = threads.find((t) => t.id === selectedId)
  const peerName = (t) => {
    if (t?.supplier?.companyName) return t.supplier.companyName
    if (t?.buyer?.companyName) return t.buyer.companyName
    if (t?.buyer?.fullName) return t.buyer.fullName
    if (t?.buyer?.email) return t.buyer.email
    return 'Conversation'
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selectedId || !draft.trim() || sending) return
    try {
      setSending(true)
      await messagesService.sendMessage(selectedId, draft.trim())
      setDraft('')
      const list = await messagesService.listMessages(selectedId)
      setMessages(Array.isArray(list) ? list : [])
      loadThreads()
    } catch (_) {
      setError('Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600">Communicate with suppliers</p>
        <p className="mt-1 text-sm text-slate-500">
          Start a thread from a{' '}
          <Link to="/buyer/suppliers" className="font-medium text-blue-600 hover:text-blue-700">
            supplier profile
          </Link>{' '}
          (Message button) or continue below.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <div className="flex h-[min(600px,calc(100dvh-12rem))] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="w-full max-w-[min(100%,20rem)] flex-shrink-0 overflow-y-auto border-r border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">Conversations</h2>
          </div>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              <Building2 className="mx-auto mb-2 h-10 w-10 text-slate-300" />
              No conversations yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {threads.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${
                    selectedId === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">{peerName(conv)}</h3>
                  </div>
                  <p className="truncate text-sm text-slate-600">
                    {conv.messages?.[0]?.body || 'No messages yet'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{formatTime(conv.lastMessageAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {selectedId ? (
            <>
              <div className="border-b border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900">{peerName(selectedThread)}</h3>
                {selectedThread?.rfq?.rfqNumber ? (
                  <p className="text-xs text-slate-500">RFQ {selectedThread.rfq.rfqNumber}</p>
                ) : null}
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {msgLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const me = msg.senderId === authService.getCurrentUser()?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${me ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            me ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <p className={`mt-1 text-xs ${me ? 'text-blue-100' : 'text-slate-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <form onSubmit={handleSend} className="border-t border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    aria-label="Send"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-slate-500">
              <MessageSquare className="h-12 w-12 text-slate-300" />
              <p>Select a conversation or open a supplier profile to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Send, Loader2, User } from 'lucide-react'
import { messagesService } from '@/services/messages.service'

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return date.toLocaleDateString()
}

export default function SupplierMessages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const buyerIdParam = searchParams.get('buyerId')

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
    if (!buyerIdParam || loading) return
    let cancelled = false
    ;(async () => {
      try {
        const thread = await messagesService.getOrCreateThread({ buyerId: buyerIdParam })
        if (cancelled || !thread?.id) return
        setSelectedId(thread.id)
        const next = new URLSearchParams(searchParams)
        next.delete('buyerId')
        setSearchParams(next, { replace: true })
        await loadThreads()
      } catch (_) {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [buyerIdParam, loading, searchParams, setSearchParams, loadThreads])

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
    if (t?.buyer?.companyName) return t.buyer.companyName
    if (t?.buyer?.fullName) return t.buyer.fullName
    if (t?.buyer?.email) return t.buyer.email
    if (t?.supplier?.companyName) return t.supplier.companyName
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
    } catch {
      setError('Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Chat with buyers who have contacted you</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex h-[min(560px,calc(100dvh-10rem))] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="w-full max-w-[min(100%,18rem)] flex-shrink-0 overflow-y-auto border-r border-border">
          <div className="border-b border-border p-3">
            <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
          </div>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <User className="mx-auto mb-2 h-8 w-8 opacity-40" />
              No conversations yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {threads.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                    selectedId === conv.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="font-medium text-foreground">{peerName(conv)}</div>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.messages?.[0]?.body || 'No messages'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/80">{formatTime(conv.lastMessageAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {selectedId ? (
            <>
              <div className="border-b border-border p-3">
                <h3 className="font-semibold text-foreground">{peerName(selectedThread)}</h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {msgLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const me = msg.sender?.role === 'VENDOR'
                    return (
                      <div key={msg.id} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            me ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                          <p
                            className={`mt-1 text-[10px] ${me ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <form onSubmit={handleSend} className="border-t border-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"
                    aria-label="Send"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-40" />
              <p className="text-sm">Select a conversation</p>
              <p className="text-xs">Buyers can message you from your public profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

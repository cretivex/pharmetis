import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getNotifications, markAsRead, markAllAsRead } from '@/services/notifications.service'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

export default function Notifications() {
  const navigate = useNavigate()
  const [data, setData] = useState({ notifications: [], totalCount: 0, unreadCount: 0 })
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const result = await getNotifications()
      setData(result)
    } catch {
      setData({ notifications: [], totalCount: 0, unreadCount: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    setMarkingId(id)
    try {
      await markAsRead(id)
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }))
      window.dispatchEvent(new Event('notifications-updated'))
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await markAllAsRead()
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }))
      window.dispatchEvent(new Event('notifications-updated'))
    } finally {
      setMarkingAll(false)
    }
  }

  const goTo = (link) => {
    if (link) navigate(link)
  }

  const list = data.notifications ?? []
  const hasUnread = (data.unreadCount ?? 0) > 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Activity and alerts</p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCheck className="w-4 h-4 mr-2" />}
            Mark all as read
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-muted-foreground animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading notifications…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">When you have notifications, they will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-muted/30' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    className="text-left w-full block"
                    onClick={() => goTo(n.link)}
                  >
                    <p className="font-medium text-foreground truncate">{n.title}</p>
                    {n.message && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                  </button>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleMarkAsRead(n.id)}
                    disabled={markingId === n.id}
                    aria-label="Mark as read"
                  >
                    {markingId === n.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { MessageSquare, Send, Paperclip } from 'lucide-react'

function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [message, setMessage] = useState('')

  const conversations = [
    { id: 1, name: 'Supplier ABC', lastMessage: 'Thank you for your inquiry...', time: '2h ago', unread: 2 },
    { id: 2, name: 'Supplier XYZ', lastMessage: 'We can provide the following...', time: '1d ago', unread: 0 },
  ]

  const messages = selectedConversation ? [
    { id: 1, sender: 'Supplier ABC', text: 'Thank you for your inquiry. We can provide the requested products.', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'You', text: 'Great! What is the lead time?', time: '10:35 AM', isMe: true },
    { id: 3, sender: 'Supplier ABC', text: 'Lead time is 2-3 weeks for bulk orders.', time: '10:40 AM', isMe: false },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
        <p className="text-slate-600">Communicate with suppliers</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-[600px] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Conversations</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-slate-900">{conv.name}</h3>
                  {conv.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-slate-500 mt-1">{conv.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">
                  {conversations.find(c => c.id === selectedConversation)?.name}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-slate-600" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages

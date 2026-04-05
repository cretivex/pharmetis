import api from './api.js'

export const messagesService = {
  async listThreads() {
    const response = await api.get('/messages/threads')
    return response.data?.data ?? response.data ?? []
  },

  async getOrCreateThread(payload) {
    const response = await api.post('/messages/threads', payload)
    return response.data?.data ?? response.data
  },

  async listMessages(threadId) {
    const response = await api.get(`/messages/threads/${threadId}/messages`)
    return response.data?.data ?? response.data ?? []
  },

  async sendMessage(threadId, body) {
    const response = await api.post(`/messages/threads/${threadId}/messages`, { body })
    return response.data?.data ?? response.data
  },
}

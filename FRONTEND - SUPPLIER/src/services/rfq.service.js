import api from './api.js'

export const getAssignedRFQs = async () => {
  const response = await api.get('/rfqs/assigned')
  return response.data?.data || response.data
}

/** GET /supplier/rfqs?status=RESPONDED - RFQs where supplier has submitted a quotation (quotation status SUBMITTED or SENT_TO_BUYER). */
export const getSupplierRfqs = async (params = {}) => {
  const response = await api.get('/supplier/rfqs', { params })
  return response.data?.data ?? response.data ?? []
}

export const getRFQById = async (id) => {
  const response = await api.get(`/rfqs/${id}`)
  return response.data?.data || response.data
}

export const submitRFQResponse = async (rfqId, data) => {
  const formData = new FormData()
  formData.append('items', JSON.stringify(data.items))
  
  if (data.totalAmount) {
    formData.append('totalAmount', data.totalAmount.toString())
  }
  if (data.currency) {
    formData.append('currency', data.currency)
  }
  if (data.validity) {
    formData.append('validity', data.validity instanceof Date ? data.validity.toISOString() : data.validity)
  }
  if (data.notes) {
    formData.append('notes', data.notes)
  }
  if (data.commercialTerms) {
    formData.append('commercialTerms', JSON.stringify(data.commercialTerms))
  }
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file)
    })
  }
  if (data.quotationFile) {
    formData.append('quotationFile', data.quotationFile)
  }

  const response = await api.post(`/rfq-responses/${rfqId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data?.data || response.data
}

export const getMyResponses = async () => {
  const response = await api.get('/rfq-responses/my')
  return response.data?.data || response.data
}

export const resubmitQuotation = async (responseId, data) => {
  const formData = new FormData()
  formData.append('items', JSON.stringify(data.items))

  if (data.totalAmount) {
    formData.append('totalAmount', data.totalAmount.toString())
  }
  if (data.currency) {
    formData.append('currency', data.currency)
  }
  if (data.validity) {
    formData.append('validity', data.validity instanceof Date ? data.validity.toISOString() : data.validity)
  }
  if (data.notes) {
    formData.append('notes', data.notes)
  }
  if (data.commercialTerms) {
    formData.append('commercialTerms', JSON.stringify(data.commercialTerms))
  }
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file)
    })
  }
  if (data.quotationFile) {
    formData.append('quotationFile', data.quotationFile)
  }

  const response = await api.post(`/rfq-responses/${responseId}/resubmit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data?.data || response.data
}

/** POST /rfq-responses/:id/negotiation-response - Supplier response to buyer's price request (Accept / Counter / Reject) */
export const submitNegotiationResponse = async (responseId, payload) => {
  const response = await api.post(`/rfq-responses/${responseId}/negotiation-response`, payload)
  return response.data?.data || response.data
}

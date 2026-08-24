export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function isOverdue(dueDate, completed = false) {
  if (completed || !dueDate) return false
  return new Date(dueDate) < new Date()
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || ''
  return text.slice(0, maxLength).trim() + '...'
}

export function generateFilePreview(fileId) {
  if (!fileId) return null
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
  const bucketId = import.meta.env.VITE_APPWRITE_STORAGE_ID || ''
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}`
}

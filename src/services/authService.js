import { account, ID } from '../lib/appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'

function handleAuthError(error, action = 'authenticate') {
  console.error(`[AuthService] ${action} error:`, {
    message: error.message,
    type: error.type,
    code: error.code,
    response: error.response,
    name: error.name,
    stack: error.stack,
  })

  // Network-level failure: the browser could not reach the Appwrite server at all
  if (
    error.message === 'Failed to fetch' ||
    (error.name === 'TypeError' && error.message.includes('fetch'))
  ) {
    throw new Error(
      `Unable to connect to the Appwrite server at ${endpoint}. ` +
      'Please check your internet connection, verify the endpoint URL, ' +
      'and ensure CORS is configured to allow this origin.'
    )
  }

  // Appwrite-specific errors carry a `type` and `code`
  if (error.code) {
    switch (error.code) {
      case 401:
        throw new Error('Invalid email or password. Please try again.')
      case 404:
        throw new Error('Account not found. Please register first.')
      case 429:
        throw new Error('Too many attempts. Please wait a moment and try again.')
      case 500:
      case 502:
      case 503:
        throw new Error('Server error. Please try again later.')
      default:
        throw new Error(error.message || `${action} failed (code: ${error.code})`)
    }
  }

  throw new Error(error.message || `Failed to ${action}`)
}

export const authService = {
  async register(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name)
      await this.login(email, password)
      return user
    } catch (error) {
      handleAuthError(error, 'register')
    }
  },

  async login(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password)
      return session
    } catch (error) {
      handleAuthError(error, 'login')
    }
  },

  async logout() {
    try {
      await account.deleteSession('current')
    } catch (error) {
      console.error('[AuthService] Logout error:', error)
      throw new Error(error.message || 'Failed to logout')
    }
  },

  async getCurrentUser() {
    try {
      return await account.get()
    } catch {
      return null
    }
  }
}

import { account, ID } from '../lib/appwrite'

export const authService = {
  async register(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name)
      await this.login(email, password)
      return user
    } catch (error) {
      throw new Error(error.message || 'Failed to register user')
    }
  },

  async login(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password)
      return session
    } catch (error) {
      throw new Error(error.message || 'Failed to login')
    }
  },

  async logout() {
    try {
      await account.deleteSession('current')
    } catch (error) {
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

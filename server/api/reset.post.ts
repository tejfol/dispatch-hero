import { clearAllStores } from '~/lib/dispatch/index'

export default defineEventHandler(() => {
  clearAllStores()
  return { ok: true }
})

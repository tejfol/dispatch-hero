import { orderStore, courierStore } from '~/lib/dispatch/index'

export default defineEventHandler(() => {
  orderStore.clear()
  courierStore.clear()
  return { ok: true }
})

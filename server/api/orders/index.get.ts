import { orderStore } from '~/lib/dispatch/index'

export default defineEventHandler(() => {
  return orderStore.getAll()
})

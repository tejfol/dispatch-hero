import { courierStore } from '~/lib/dispatch/index'

export default defineEventHandler(() => {
  return courierStore.getAll()
})

import { courierStore } from '~/lib/dispatch/index'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Courier id required' })
  const deleted = courierStore.delete(id)
  if (!deleted) throw createError({ statusCode: 404, message: 'Courier not found' })
  setResponseStatus(event, 204)
})

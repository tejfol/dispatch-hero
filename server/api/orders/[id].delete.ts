import { orderStore } from '~/lib/dispatch/index'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Order id required' })
  const deleted = orderStore.delete(id)
  if (!deleted) throw createError({ statusCode: 404, message: 'Order not found' })
  setResponseStatus(event, 204)
})

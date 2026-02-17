import { orderStore } from '~/lib/dispatch/index'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return null
  const order = orderStore.getById(id)
  if (!order) throw createError({ statusCode: 404, message: 'Order not found' })
  return order
})

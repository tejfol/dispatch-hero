import {
  orderStore,
  queueStore,
  courierStore,
  tryAssignQueuedToCourier,
  type Order,
  type Courier
} from '~/lib/dispatch/index'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Order id required' })
  const order = orderStore.getById(id)
  if (!order) throw createError({ statusCode: 404, message: 'Order not found' })
  if (order.status === 'delivered') throw createError({ statusCode: 400, message: 'Cannot cancel delivered order' })

  const updatedOrder: Order = { ...order, status: 'cancelled' }
  orderStore.set(updatedOrder)

  if (order.status === 'queued') {
    queueStore.remove(id)
  } else if (order.courierId) {
    const courier = courierStore.getById(order.courierId)
    if (courier) {
      const freed: Courier = {
        ...courier,
        status: 'idle',
        currentOrderId: undefined
      }
      courierStore.set(freed)
      tryAssignQueuedToCourier(freed)
    }
  }

  return { order: updatedOrder }
})

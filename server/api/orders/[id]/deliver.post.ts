import {
  orderStore,
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
  if (!order.courierId) throw createError({ statusCode: 400, message: 'Order not assigned' })

  const courier = courierStore.getById(order.courierId)
  if (!courier) throw createError({ statusCode: 404, message: 'Courier not found' })

  const updatedOrder: Order = { ...order, status: 'delivered' }
  const updatedCourier: Courier = {
    ...courier,
    status: 'idle',
    currentOrderId: undefined,
    completedOrdersToday: (courier.completedOrdersToday ?? 0) + 1
  }
  orderStore.set(updatedOrder)
  courierStore.set(updatedCourier)
  tryAssignQueuedToCourier(updatedCourier)

  return { order: updatedOrder, courier: updatedCourier }
})

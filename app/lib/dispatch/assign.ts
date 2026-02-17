/**
 * Stage 1–3: assign courier (nearest, tie-break by completedOrdersToday), queue when none free.
 */
import type { Courier, Order } from './types'
import { MAX_WEIGHT_BY_TRANSPORT } from './types'
import { distance } from './grid'
import { orderStore, courierStore, queueStore } from './store'

export type AssignmentResult =
  | { assigned: true; order: Order; courier: Courier; distance: number }
  | { assigned: false; queued: true; order: Order; message: string }
  | { assigned: false; queued?: false; message: string }

/** True if courier's transport can carry order weight (kg). */
function canCarryWeight(weightKg: number, transport: Courier['transport']): boolean {
  return weightKg <= MAX_WEIGHT_BY_TRANSPORT[transport ?? 'walker']
}

/**
 * Assign a specific order to a specific courier (used when courier frees up from queue).
 */
export function assignOrderToCourier(order: Order, courier: Courier): void {
  const updatedCourier: Courier = {
    ...courier,
    status: 'busy',
    currentOrderId: order.id,
    completedOrdersToday: courier.completedOrdersToday ?? 0
  }
  const updatedOrder: Order = {
    ...order,
    status: 'assigned',
    courierId: courier.id
  }
  courierStore.set(updatedCourier)
  orderStore.set(updatedOrder)
  queueStore.remove(order.id)
}

/**
 * When a courier becomes idle, try to assign the first suitable order from the queue.
 */
export function tryAssignQueuedToCourier(courier: Courier): boolean {
  const completed = courier.completedOrdersToday ?? 0
  const ids = queueStore.getAll()
  if (ids.length === 0) return false

  let tried = 0
  while (tried < ids.length) {
    const orderId = queueStore.dequeue()
    if (!orderId) break
    const order = orderStore.getById(orderId)
    if (!order || order.status !== 'queued') {
      tried++
      continue
    }
    const weightKg = order.weightKg ?? 0
    if (!canCarryWeight(weightKg, courier.transport ?? 'walker')) {
      queueStore.enqueue(orderId)
      tried++
      continue
    }
    assignOrderToCourier(order, { ...courier, completedOrdersToday: completed })
    return true
  }
  return false
}

/**
 * 1. Find all idle couriers that can carry order weight.
 * 2. Sort by distance to restaurant; if distance diff < 1, prefer fewer completedOrdersToday.
 * 3. Assign nearest (with tie-break). If none, put order in queue.
 */
export function assignNearestCourier(order: Order): AssignmentResult {
  const weightKg = order.weightKg ?? 0
  const freeCouriers = courierStore
    .getAll()
    .filter((c) => c.status === 'idle' && canCarryWeight(weightKg, c.transport ?? 'walker'))

  if (freeCouriers.length === 0) {
    const queuedOrder: Order = { ...order, status: 'queued' }
    orderStore.set(queuedOrder)
    queueStore.enqueue(order.id)
    return { assigned: false, queued: true, order: queuedOrder, message: 'Queued' }
  }

  const restaurant = order.pickup
  const withDistance = freeCouriers.map((c) => ({
    courier: c,
    distance: distance(c.position, restaurant),
    completed: c.completedOrdersToday ?? 0
  }))
  withDistance.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) < 1) {
      return a.completed - b.completed
    }
    return a.distance - b.distance
  })

  const nearest = withDistance[0]!
  const { courier: chosen, distance: minDistance } = nearest

  const updatedCourier: Courier = {
    ...chosen,
    status: 'busy',
    currentOrderId: order.id,
    completedOrdersToday: chosen.completedOrdersToday ?? 0
  }
  const updatedOrder: Order = {
    ...order,
    status: 'assigned',
    courierId: chosen.id
  }

  courierStore.set(updatedCourier)
  orderStore.set(updatedOrder)

  return {
    assigned: true,
    order: updatedOrder,
    courier: updatedCourier,
    distance: minDistance
  }
}

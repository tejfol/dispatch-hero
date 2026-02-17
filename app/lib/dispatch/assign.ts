/**
 * Stage 1 MVP: assign nearest free courier to an order (restaurant = pickup).
 */
import type { Courier, Order } from './types'
import { distance } from './grid'
import { orderStore, courierStore } from './store'

export type AssignmentResult =
  | { assigned: true; order: Order; courier: Courier; distance: number }
  | { assigned: false; message: string }

/**
 * 1. Find all couriers with status Free (idle).
 * 2. Compute distance from courier to restaurant (order.pickup).
 * 3. Assign nearest courier.
 * 4. Set courier status to Busy and link order.
 * 5. Return result JSON or "No couriers available".
 */
export function assignNearestCourier(order: Order): AssignmentResult {
  const freeCouriers = courierStore
    .getAll()
    .filter((c) => c.status === 'idle')

  if (freeCouriers.length === 0) {
    return { assigned: false, message: 'No couriers available' }
  }

  const restaurant = order.pickup
  let nearest: Courier | null = null
  let minDistance = Infinity

  for (const courier of freeCouriers) {
    const d = distance(courier.position, restaurant)
    if (d < minDistance) {
      minDistance = d
      nearest = courier
    }
  }

  if (!nearest) {
    return { assigned: false, message: 'No couriers available' }
  }

  const updatedCourier: Courier = {
    ...nearest,
    status: 'busy',
    currentOrderId: order.id
  }
  const updatedOrder: Order = {
    ...order,
    status: 'assigned',
    courierId: nearest.id
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

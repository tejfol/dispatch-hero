/**
 * Stage 1 MVP + Stage 2: assign nearest courier that can carry order weight.
 */
import type { Courier, Order } from './types'
import { MAX_WEIGHT_BY_TRANSPORT } from './types'
import { distance } from './grid'
import { orderStore, courierStore } from './store'

export type AssignmentResult =
  | { assigned: true; order: Order; courier: Courier; distance: number }
  | { assigned: false; message: string }

/** True if courier's transport can carry order weight (kg). */
function canCarryWeight(weightKg: number, transport: Courier['transport']): boolean {
  return weightKg <= MAX_WEIGHT_BY_TRANSPORT[transport]
}

/**
 * 1. Find all couriers that are Free (idle) and whose transport can carry order weight.
 * 2. Among them, compute distance from courier to restaurant (order.pickup).
 * 3. Assign nearest courier.
 * 4. Set courier status to Busy and link order.
 */
export function assignNearestCourier(order: Order): AssignmentResult {
  const weightKg = order.weightKg ?? 0
  const freeCouriers = courierStore
    .getAll()
    .filter((c) => c.status === 'idle' && canCarryWeight(weightKg, c.transport ?? 'walker'))

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

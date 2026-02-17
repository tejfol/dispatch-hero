import {
  orderStore,
  isPointInGrid,
  DEFAULT_GRID,
  assignNearestCourier,
  type Order
} from '~/lib/dispatch/index'

const createId = () => `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    pickup: { x: number; y: number }
    dropoff: { x: number; y: number }
    weightKg?: number
  }>(event)
  if (!body?.pickup || !body?.dropoff) {
    throw createError({ statusCode: 400, message: 'pickup and dropoff points required' })
  }
  const pickup = body.pickup
  const dropoff = body.dropoff
  const weightKg = typeof body.weightKg === 'number' && body.weightKg >= 0 ? body.weightKg : 0
  if (!isPointInGrid(pickup, DEFAULT_GRID) || !isPointInGrid(dropoff, DEFAULT_GRID)) {
    throw createError({ statusCode: 400, message: 'pickup and dropoff must be within grid 0–100' })
  }
  const order: Order = {
    id: createId(),
    pickup,
    dropoff,
    weightKg,
    status: 'pending',
    createdAt: Date.now()
  }
  orderStore.set(order)

  const assignment = assignNearestCourier(order)

  return {
    order: assignment.assigned ? assignment.order : order,
    assignment: assignment.assigned
      ? {
          assigned: true,
          courierId: assignment.courier.id,
          courier: assignment.courier,
          distance: assignment.distance
        }
      : { assigned: false, message: assignment.message }
  }
})

import {
  courierStore,
  isPointInGrid,
  DEFAULT_GRID,
  type Courier,
  type TransportType
} from '~/lib/dispatch/index'

const createId = () => `courier-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const TRANSPORT_VALUES: TransportType[] = ['walker', 'bicycle', 'car']

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    position?: { x: number; y: number }
    transport?: TransportType
  }>(event)
  const position = body?.position ?? { x: 0, y: 0 }
  const transport =
    body?.transport && TRANSPORT_VALUES.includes(body.transport)
      ? body.transport
      : 'walker'
  if (!isPointInGrid(position, DEFAULT_GRID)) {
    throw createError({ statusCode: 400, message: 'position must be within grid 0–100' })
  }
  const courier: Courier = {
    id: createId(),
    position,
    transport,
    status: 'idle',
    completedOrdersToday: 0
  }
  courierStore.set(courier)
  return courier
})

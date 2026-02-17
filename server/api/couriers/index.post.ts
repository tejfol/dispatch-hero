import { courierStore, isPointInGrid, DEFAULT_GRID, type Courier } from '~/lib/dispatch/index'

const createId = () => `courier-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export default defineEventHandler(async (event) => {
  const body = await readBody<{ position?: { x: number; y: number } }>(event)
  const position = body?.position ?? { x: 0, y: 0 }
  if (!isPointInGrid(position, DEFAULT_GRID)) {
    throw createError({ statusCode: 400, message: 'position must be within grid 0–100' })
  }
  const courier: Courier = {
    id: createId(),
    position,
    status: 'idle'
  }
  courierStore.set(courier)
  return courier
})

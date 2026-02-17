/**
 * Composable for the dispatch core: grid, orders, couriers via API.
 */
import type { CityGrid, Order, Courier } from '~/lib/dispatch/index'

export function useDispatch() {
  const grid = useFetch<CityGrid>('/api/grid', { default: () => ({ minX: 0, maxX: 100, minY: 0, maxY: 100 }) })
  const orders = useFetch<Order[]>('/api/orders', { default: () => [] })
  const couriers = useFetch<Courier[]>('/api/couriers', { default: () => [] })

  async function createOrder(pickup: { x: number; y: number }, dropoff: { x: number; y: number }) {
    const res = await $fetch<{
      order: Order
      assignment: { assigned: true; courierId: string; courier: Courier; distance: number } | { assigned: false; message: string }
    }>('/api/orders', {
      method: 'POST',
      body: { pickup, dropoff }
    })
    await Promise.all([orders.refresh(), couriers.refresh()])
    return res
  }

  async function createCourier(position?: { x: number; y: number }) {
    const res = await $fetch<Courier>('/api/couriers', {
      method: 'POST',
      body: { position: position ?? { x: 0, y: 0 } }
    })
    await couriers.refresh()
    return res
  }

  async function clearAll() {
    await $fetch('/api/reset', { method: 'POST' })
    await Promise.all([grid.refresh(), orders.refresh(), couriers.refresh()])
  }

  return {
    grid,
    orders,
    couriers,
    createOrder,
    createCourier,
    refresh: async () => {
      await Promise.all([grid.refresh(), orders.refresh(), couriers.refresh()])
    },
    clearAll
  }
}

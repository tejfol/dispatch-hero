/**
 * Composable for the dispatch core: grid, orders, couriers via API.
 */
import type { CityGrid, Order, Courier } from '~/lib/dispatch/index'

export function useDispatch() {
  const grid = useFetch<CityGrid>('/api/grid', { key: 'dispatch-grid', default: () => ({ minX: 0, maxX: 100, minY: 0, maxY: 100 }) })
  const orders = useFetch<Order[]>('/api/orders', { key: 'dispatch-orders', default: () => [] })
  const couriers = useFetch<Courier[]>('/api/couriers', { key: 'dispatch-couriers', default: () => [] })

  async function createOrder(
    pickup: { x: number; y: number },
    dropoff: { x: number; y: number },
    weightKg: number
  ) {
    const res = await $fetch<{
      order: Order
      assignment:
        | { assigned: true; courierId: string; courier: Courier; distance: number }
        | { assigned: false; queued?: boolean; message: string }
    }>('/api/orders', {
      method: 'POST',
      body: { pickup, dropoff, weightKg }
    })
    // Optimistic: show new order and updated courier immediately
    if (orders.data?.value) {
      const list = Array.isArray(orders.data.value) ? [...orders.data.value] : []
      const idx = list.findIndex((o) => o?.id === res.order.id)
      if (idx >= 0) list[idx] = res.order
      else list.unshift(res.order)
      orders.data.value = list
    }
    if (res.assignment?.assigned && couriers.data?.value) {
      const list = Array.isArray(couriers.data.value) ? [...couriers.data.value] : []
      const i = list.findIndex((c) => c?.id === res.assignment.courier.id)
      if (i >= 0) list[i] = res.assignment.courier
      couriers.data.value = list
    }
    await Promise.all([orders.refresh(), couriers.refresh()])
    return res
  }

  async function deliverOrder(id: string) {
    const res = await $fetch<{ order: Order; courier: Courier }>(`/api/orders/${id}/deliver`, { method: 'POST' })
    // Optimistic: apply delivered order and freed courier
    if (orders.data?.value) {
      const list = [...(Array.isArray(orders.data.value) ? orders.data.value : [])]
      const i = list.findIndex((o) => o?.id === id)
      if (i >= 0) list[i] = res.order
      orders.data.value = list
    }
    if (couriers.data?.value) {
      const list = [...(Array.isArray(couriers.data.value) ? couriers.data.value : [])]
      const i = list.findIndex((c) => c?.id === res.courier.id)
      if (i >= 0) list[i] = res.courier
      couriers.data.value = list
    }
    await Promise.all([orders.refresh(), couriers.refresh()])
  }

  async function cancelOrder(id: string) {
    const res = await $fetch<{ order: Order }>(`/api/orders/${id}/cancel`, { method: 'POST' })
    if (orders.data?.value) {
      const list = [...(Array.isArray(orders.data.value) ? orders.data.value : [])]
      const i = list.findIndex((o) => o?.id === id)
      if (i >= 0) list[i] = res.order
      orders.data.value = list
    }
    await Promise.all([orders.refresh(), couriers.refresh()])
  }

  async function createCourier(
    position?: { x: number; y: number },
    transport?: 'walker' | 'bicycle' | 'car'
  ) {
    const res = await $fetch<Courier>('/api/couriers', {
      method: 'POST',
      body: { position: position ?? { x: 0, y: 0 }, transport }
    })
    // New courier may get a queued order; refresh both
    if (couriers.data?.value) {
      const list = Array.isArray(couriers.data.value) ? [...couriers.data.value] : []
      list.unshift(res)
      couriers.data.value = list
    }
    await Promise.all([orders.refresh(), couriers.refresh()])
    return res
  }

  async function deleteOrder(id: string) {
    await $fetch(`/api/orders/${id}`, { method: 'DELETE' })
    // Optimistic: remove from list immediately
    if (orders.data?.value && Array.isArray(orders.data.value)) {
      orders.data.value = orders.data.value.filter((o) => o?.id !== id)
    }
    await Promise.all([orders.refresh(), couriers.refresh()])
  }

  async function deleteCourier(id: string) {
    await $fetch(`/api/couriers/${id}`, { method: 'DELETE' })
    if (couriers.data?.value && Array.isArray(couriers.data.value)) {
      couriers.data.value = couriers.data.value.filter((c) => c?.id !== id)
    }
    await Promise.all([orders.refresh(), couriers.refresh()])
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
    deleteOrder,
    deleteCourier,
    deliverOrder,
    cancelOrder,
    refresh: async () => {
      await Promise.all([grid.refresh(), orders.refresh(), couriers.refresh()])
    },
    clearAll
  }
}

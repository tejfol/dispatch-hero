/**
 * In-memory store for orders and couriers.
 * Used from server only so a single process holds the data.
 */
import type { Courier, Order } from './types'

const orders = new Map<string, Order>()
const couriers = new Map<string, Courier>()
/** Queue of order IDs (FIFO) when no courier is available. */
const orderQueue: string[] = []

/** Orders: mutable in-memory map. */
export const orderStore = {
  getAll(): Order[] {
    return Array.from(orders.values())
  },

  getById(id: string): Order | undefined {
    return orders.get(id)
  },

  set(order: Order): void {
    orders.set(order.id, order)
  },

  delete(id: string): boolean {
    return orders.delete(id)
  },

  clear(): void {
    orders.clear()
  }
}

/** Queue of order IDs for orders waiting for a courier. */
export const queueStore = {
  enqueue(orderId: string): void {
    orderQueue.push(orderId)
  },

  dequeue(): string | undefined {
    return orderQueue.shift()
  },

  remove(orderId: string): void {
    const i = orderQueue.indexOf(orderId)
    if (i !== -1) orderQueue.splice(i, 1)
  },

  getAll(): string[] {
    return [...orderQueue]
  },

  clear(): void {
    orderQueue.length = 0
  }
}

/** Couriers: mutable in-memory map. */
export const courierStore = {
  getAll(): Courier[] {
    return Array.from(couriers.values())
  },

  getById(id: string): Courier | undefined {
    return couriers.get(id)
  },

  set(courier: Courier): void {
    couriers.set(courier.id, courier)
  },

  delete(id: string): boolean {
    return couriers.delete(id)
  },

  clear(): void {
    couriers.clear()
  }
}

/** Clear all stores (orders, queue, couriers). */
export function clearAllStores(): void {
  orderStore.clear()
  queueStore.clear()
  courierStore.clear()
}

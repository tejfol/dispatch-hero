/**
 * In-memory store for orders and couriers.
 * Used from server only so a single process holds the data.
 */
import type { Courier, Order } from './types'

const orders = new Map<string, Order>()
const couriers = new Map<string, Courier>()

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

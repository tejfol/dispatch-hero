/**
 * Core types for the delivery order dispatch system.
 * City is a coordinate grid (e.g. 0–100 on X and Y).
 */

/** A point on the city grid (x, y). */
export interface Point {
  x: number
  y: number
}

/** City grid bounds (inclusive). Default 0–100 on both axes. */
export interface CityGrid {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/** Order status in the dispatch flow. */
export type OrderStatus =
  | 'pending'   // created, not yet assigned
  | 'assigned'  // assigned to a courier
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

/** Delivery order: pickup and dropoff points on the grid. */
export interface Order {
  id: string
  pickup: Point
  dropoff: Point
  status: OrderStatus
  createdAt: number
  /** Courier id when status is assigned or later. */
  courierId?: string
}

/** Courier status. */
export type CourierStatus = 'idle' | 'busy' | 'offline'

/** Courier that can be assigned orders. */
export interface Courier {
  id: string
  position: Point
  status: CourierStatus
  /** Order id when status is busy. */
  currentOrderId?: string
}

/** Default city grid: 0–100 on X and Y. */
export const DEFAULT_GRID: CityGrid = {
  minX: 0,
  maxX: 100,
  minY: 0,
  maxY: 100
}

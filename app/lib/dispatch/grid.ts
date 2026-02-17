/**
 * City grid utilities: validation and distance on the coordinate grid.
 */
import type { CityGrid, Point } from './types'
import { DEFAULT_GRID } from './types'

/**
 * Checks if a point is inside the grid bounds.
 */
export function isPointInGrid(
  point: Point,
  grid: CityGrid = DEFAULT_GRID
): boolean {
  return (
    point.x >= grid.minX &&
    point.x <= grid.maxX &&
    point.y >= grid.minY &&
    point.y <= grid.maxY
  )
}

/**
 * Clamps a point to the grid bounds.
 */
export function clampToGrid(
  point: Point,
  grid: CityGrid = DEFAULT_GRID
): Point {
  return {
    x: Math.max(grid.minX, Math.min(grid.maxX, point.x)),
    y: Math.max(grid.minY, Math.min(grid.maxY, point.y))
  }
}

/**
 * Euclidean distance between two points on the grid.
 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

/**
 * Manhattan distance (sum of axis-aligned segments).
 * Useful for grid-based routing.
 */
export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
}

/**
 * Creates a grid with the given bounds (default 0–100).
 */
export function createGrid(
  maxX = 100,
  maxY = 100,
  minX = 0,
  minY = 0
): CityGrid {
  return { minX, maxX, minY, maxY }
}

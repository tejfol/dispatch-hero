# Dispatch Hero

A delivery order dispatch system: the city is a coordinate grid (0–100 on X and Y). Orders are created with pickup and dropoff points; the system assigns the best available courier or queues the order until someone is free.

**In-memory only** — no database. Data lives in the server process and is cleared on restart or via “Clear all”.

---

## How it works

### City grid

- The map is a **100×100** grid. All coordinates are integers in `[0, 100]` for both X and Y.
- **Pickup** (restaurant) and **dropoff** (customer) are points on this grid.
- Distance between points is Euclidean (same as “as the crow flies”).

### Orders

- Each order has:
  - **Pickup** and **dropoff** coordinates
  - **Weight (kg)** — used to decide which couriers can take it
  - **Status**: `pending` → `queued` or `assigned` → … → `delivered` or `cancelled`
- When you create an order, the system tries to assign a courier immediately (see *Assignment* below). If no suitable courier is free, the order goes into a **queue** and gets status `queued`.

### Couriers

- Each courier has:
  - **Position** (x, y) on the grid
  - **Transport type**, which limits max order weight:
    - **Walker** — up to 5 kg
    - **Bicycle** — up to 15 kg
    - **Car/Scooter** — up to 50 kg
  - **completedOrdersToday** — number of orders delivered today (used for tie-breaking)
- Status is either **idle** (free) or **busy** (has an order).

### Assignment rules

1. Only **idle** couriers are considered.
2. A courier can be assigned only if their transport allows the order’s **weight** (Walker ≤5 kg, Bicycle ≤15 kg, Car ≤50 kg).
3. Among those, the system picks the **nearest** to the **pickup** (restaurant).
4. **Tie-break**: if two couriers are within **1 unit** of distance, the one with **fewer completed orders today** gets the order (fairer distribution).

### Queue and auto-assign

- If there is **no free courier** that can carry the order’s weight, the order is **queued** (FIFO).
- When a courier becomes free (after **deliver** or **cancel**, or when an assigned order is **deleted**), the system automatically tries to assign them the **first order from the queue** that they can carry. If they can’t carry the first one, it goes back to the end and the next is tried, until one fits or the queue is exhausted.

### Deliver and cancel

- **Deliver** (for assigned/picked_up/in_transit): marks the order as `delivered`, sets the courier to `idle`, increments their `completedOrdersToday`, then runs auto-assign from the queue.
- **Cancel** (for pending/queued/assigned): sets the order to `cancelled`; if it was assigned, the courier is freed and auto-assign from the queue runs.

---

## Setup & run

Install dependencies (project uses pnpm):

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Open **http://localhost:3000**. Use “New order” and “Add courier” to create data; the grid shows pickups (green), dropoffs (amber), and couriers (blue when idle, purple when busy). Use **Refresh** to reload data and **Clear all** to reset orders, queue, and couriers.

---

## API

All under `/api`. Data is JSON; IDs are strings like `order-1739…` / `courier-1739…`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/grid` | Grid bounds `{ minX, maxX, minY, maxY }` (default 0–100) |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | One order |
| POST | `/api/orders` | Create order. Body: `{ pickup: {x,y}, dropoff: {x,y}, weightKg?: number }`. Returns `{ order, assignment }` where `assignment` is either `{ assigned: true, courierId, courier, distance }` or `{ assigned: false, queued?: true, message }`. |
| DELETE | `/api/orders/:id` | Delete order. If it was assigned, frees the courier and runs queue assign. If queued, removes it from the queue. |
| POST | `/api/orders/:id/deliver` | Mark order delivered, free courier, increment `completedOrdersToday`, try assign from queue. |
| POST | `/api/orders/:id/cancel` | Cancel order; if assigned, free courier and try assign from queue. |
| GET | `/api/couriers` | List all couriers |
| POST | `/api/couriers` | Create courier. Body: `{ position?: {x,y}, transport?: 'walker'|'bicycle'|'car' }`. |
| DELETE | `/api/couriers/:id` | Delete courier. |
| POST | `/api/reset` | Clear all orders, queue, and couriers. |

---

## UI overview

- **City grid**: SVG overlay with pickup/dropoff dots and courier positions; dashed lines show order routes.
- **New order**: Pickup X/Y, Dropoff X/Y, Weight (kg). “Randomize” then submit; response shows assigned, queued, or error.
- **Add courier**: X, Y, Transport (Walker / Bicycle / Car). “Randomize” then submit.
- **Orders list**: ID, weight, status badge, **Deliver** (when assigned/picked_up/in_transit), **Cancel** (when pending/queued/assigned), **Remove** (delete).
- **Couriers list**: ID, transport, “N today”, position, status, **Remove**.

---

## Tech stack

- **Nuxt 4** (Vue 3), **TypeScript**
- **Nuxt UI 4** (components, Tailwind-based)
- **Tailwind 4**
- Server API and dispatch logic run in the Nuxt server; storage is in-memory in `app/lib/dispatch/store.ts`. Composable `useDispatch()` in `app/composables/useDispatch.ts` talks to the API and exposes `orders`, `couriers`, `createOrder`, `createCourier`, `deleteOrder`, `deleteCourier`, `deliverOrder`, `cancelOrder`, `refresh`, `clearAll`.

See [Nuxt docs](https://nuxt.com/docs) and [Nuxt UI](https://ui.nuxt.com) for more.

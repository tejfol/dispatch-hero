# Dispatch Hero

Delivery order dispatch system: city as a coordinate grid (0–100 on X and Y), in-memory storage.

## Dispatch core

- **City grid**: Bounds `0–100` on both axes (configurable). Points are `{ x, y }`.
- **Storage**: In-memory only (no DB). Orders and couriers live in process memory on the server.
- **API**: `GET/POST /api/orders`, `GET /api/orders/:id`, `GET/POST /api/couriers`, `GET /api/grid`.
- **App**: Use `useDispatch()` in components for grid, orders, couriers and `createOrder` / `createCourier`.

See [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) for more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

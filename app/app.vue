<template>
  <div class="min-h-screen bg-default">
    <NuxtRouteAnnouncer />

    <UHeader
      title="Dispatch Hero"
      :ui="{ root: 'border-b border-default bg-default/80 backdrop-blur' }"
    >
      <template #right>
        <span class="text-sm text-muted hidden sm:inline"
          >Grid 0-100 × 0-100</span
        >
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :loading="refreshStatus === 'pending'"
          :disabled="refreshStatus === 'pending'"
          @click="onRefresh"
        >
          {{ refreshStatus === "pending" ? "Refreshing…" : "Refresh" }}
        </UButton>
        <UButton
          color="error"
          variant="outline"
          size="sm"
          :loading="clearStatus === 'pending'"
          :disabled="clearStatus === 'pending'"
          @click="onClearAll"
        >
          {{ clearStatus === "pending" ? "Clearing…" : "Clear all" }}
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <UContainer class="py-6">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- City grid -->
          <section class="xl:col-span-2">
            <UCard>
              <template #header>
                <span class="font-semibold text-default">City grid</span>
              </template>

              <div
                class="relative aspect-square max-h-[420px] w-full overflow-hidden rounded-lg bg-elevated/50"
              >
                <div
                  class="absolute inset-0 opacity-40"
                  :style="{
                    backgroundImage: `
                      linear-gradient(to right, var(--ui-border) 1px, transparent 1px),
                      linear-gradient(to bottom, var(--ui-border) 1px, transparent 1px)
                    `,
                    backgroundSize: '10% 10%',
                  }"
                />
                <svg
                  class="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <line
                    v-for="(order, i) in orderList"
                    v-show="order?.pickup && order?.dropoff"
                    :key="order?.id ?? `line-${i}`"
                    :x1="pct(order.pickup?.x)"
                    :y1="pct(order.pickup?.y)"
                    :x2="pct(order.dropoff?.x)"
                    :y2="pct(order.dropoff?.y)"
                    stroke="currentColor"
                    stroke-width="0.5"
                    stroke-dasharray="4 2"
                    class="text-muted opacity-50"
                  />
                </svg>
                <div
                  v-for="(order, i) in orderList"
                  v-show="order?.pickup"
                  :key="`pickup-${order?.id ?? i}`"
                  class="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-default bg-success shadow-sm"
                  :style="pointStyle(order.pickup)"
                />
                <div
                  v-for="(order, i) in orderList"
                  v-show="order?.dropoff"
                  :key="`dropoff-${order?.id ?? i}`"
                  class="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-default bg-warning shadow-sm"
                  :style="pointStyle(order.dropoff)"
                />
                <div
                  v-for="(c, i) in courierList"
                  v-show="c?.position"
                  :key="c?.id ?? `courier-${i}`"
                  class="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-default shadow-sm"
                  :class="courierDotClass(c)"
                  :style="pointStyle(c.position)"
                  :title="`${c?.id ?? ''} (${c?.status ?? ''})`"
                />
              </div>

              <template #footer>
                <p class="text-xs text-muted">
                  Green = pickup · Amber = dropoff · Blue = courier
                </p>
              </template>
            </UCard>
          </section>

          <!-- Sidebar -->
          <aside class="space-y-6">
            <!-- New order -->
            <UCard>
              <template #header>
                <span class="font-semibold text-default">New order</span>
              </template>

              <form class="space-y-4" @submit.prevent="submitOrder">
                <div class="grid grid-cols-2 gap-3">
                  <UFormField label="Pickup X">
                    <UInput
                      v-model.number="newOrder.pickupX"
                      type="number"
                      min="0"
                      max="100"
                      size="sm"
                      variant="outline"
                    />
                  </UFormField>
                  <UFormField label="Pickup Y">
                    <UInput
                      v-model.number="newOrder.pickupY"
                      type="number"
                      min="0"
                      max="100"
                      size="sm"
                      variant="outline"
                    />
                  </UFormField>
                  <UFormField label="Dropoff X">
                    <UInput
                      v-model.number="newOrder.dropoffX"
                      type="number"
                      min="0"
                      max="100"
                      size="sm"
                      variant="outline"
                    />
                  </UFormField>
                  <UFormField label="Dropoff Y">
                    <UInput
                      v-model.number="newOrder.dropoffY"
                      type="number"
                      min="0"
                      max="100"
                      size="sm"
                      variant="outline"
                    />
                  </UFormField>
                </div>
                <UAlert
                  v-if="orderError"
                  color="warning"
                  variant="soft"
                  size="sm"
                  :title="orderError"
                  class="mb-0"
                />
                <UButton
                  type="submit"
                  block
                  color="primary"
                  :loading="orderSubmitStatus === 'pending'"
                  :disabled="orderSubmitStatus === 'pending'"
                >
                  Create order
                </UButton>
              </form>
            </UCard>

            <!-- Add courier -->
            <UCard>
              <template #header>
                <span class="font-semibold text-default">Add courier</span>
              </template>

              <form class="space-y-4" @submit.prevent="submitCourier">
                <div class="grid grid-cols-2 gap-3">
                  <UFormField label="X">
                    <UInput
                      v-model.number="newCourier.x"
                      type="number"
                      min="0"
                      max="100"
                      size="sm"
                      variant="outline"
                    />
                  </UFormField>
                  <UFormField label="Y">
                    <UInput
                      v-model.number="newCourier.y"
                      type="number"
                      min="0"
                      max="100"
                      size="sm"
                      variant="outline"
                    />
                  </UFormField>
                </div>
                <UAlert
                  v-if="courierError"
                  color="warning"
                  variant="soft"
                  size="sm"
                  :title="courierError"
                  class="mb-0"
                />
                <UButton
                  type="submit"
                  block
                  color="neutral"
                  variant="outline"
                  :loading="courierSubmitStatus === 'pending'"
                  :disabled="courierSubmitStatus === 'pending'"
                >
                  Add courier
                </UButton>
              </form>
            </UCard>

            <!-- Orders list -->
            <UCard>
              <template #header>
                <span class="font-semibold text-default">
                  Orders ({{ orderList.length }})
                </span>
              </template>

              <UScrollArea v-if="orderList.length" class="max-h-48">
                <ul class="space-y-2 pr-2">
                  <li
                    v-for="(order, i) in orderList"
                    :key="order?.id ?? `order-${i}`"
                    class="flex items-center justify-between gap-2 rounded-md bg-elevated/50 px-3 py-2"
                  >
                    <span
                      class="truncate font-mono text-sm text-muted"
                      :title="order?.id ?? ''"
                    >
                      {{ order?.id?.slice(-8) ?? "—" }}
                    </span>
                    <UBadge
                      :color="orderStatusColor(order?.status)"
                      variant="soft"
                      size="sm"
                    >
                      {{ order?.status ?? "—" }}
                    </UBadge>
                  </li>
                </ul>
              </UScrollArea>
              <UEmpty
                v-else
                title="No orders yet"
                description="Create an order above"
                class="py-6"
              />
            </UCard>

            <!-- Couriers list -->
            <UCard>
              <template #header>
                <span class="font-semibold text-default">
                  Couriers ({{ courierList.length }})
                </span>
              </template>

              <UScrollArea v-if="courierList.length" class="max-h-48">
                <ul class="space-y-2 pr-2">
                  <li
                    v-for="(c, i) in courierList"
                    :key="c?.id ?? `courier-${i}`"
                    class="flex items-center justify-between gap-2 rounded-md bg-elevated/50 px-3 py-2"
                  >
                    <span
                      class="truncate font-mono text-sm text-muted"
                      :title="c?.id ?? ''"
                    >
                      {{ c?.id?.slice(-8) ?? "—" }}
                    </span>
                    <span class="shrink-0 text-xs text-muted"
                      >({{ c?.position?.x ?? "—" }}, {{ c?.position?.y ?? "—" }})</span
                    >
                    <UBadge
                      :color="courierStatusColor(c?.status)"
                      variant="soft"
                      size="sm"
                    >
                      {{ c?.status ?? "—" }}
                    </UBadge>
                  </li>
                </ul>
              </UScrollArea>
              <UEmpty
                v-else
                title="No couriers yet"
                description="Add a courier above"
                class="py-6"
              />
            </UCard>
          </aside>
        </div>
      </UContainer>
    </UMain>
  </div>
</template>

<script setup lang="ts">
const dispatch = useDispatch()
const { orders, couriers, createOrder, createCourier, clearAll } = dispatch
const refreshData = dispatch.refresh

const refreshStatus = ref<"idle" | "pending">("idle")
const clearStatus = ref<"idle" | "pending">("idle")
const orderSubmitStatus = ref<"idle" | "pending">("idle")
const courierSubmitStatus = ref<"idle" | "pending">("idle")
const orderError = ref("");
const courierError = ref("");

const newOrder = reactive({
  pickupX: 20,
  pickupY: 30,
  dropoffX: 80,
  dropoffY: 70,
});

const newCourier = reactive({
  x: 50,
  y: 50,
});

const orderList = computed(() => {
  const data = orders.data?.value ?? []
  return Array.isArray(data) ? data.filter(Boolean) : []
})

const courierList = computed(() => {
  const data = couriers.data?.value ?? []
  return Array.isArray(data) ? data.filter(Boolean) : []
})

function randomInt(max: number): number {
  return Math.floor(Math.random() * (max + 1));
}

function randomizeOrderCoords(): void {
  newOrder.pickupX = randomInt(100);
  newOrder.pickupY = randomInt(100);
  newOrder.dropoffX = randomInt(100);
  newOrder.dropoffY = randomInt(100);
}

function randomizeCourierCoords(): void {
  newCourier.x = randomInt(100);
  newCourier.y = randomInt(100);
}

function pct(n: number | undefined): string {
  const num = Number(n);
  if (Number.isNaN(num)) return "0%";
  return `${Math.max(0, Math.min(100, num))}%`;
}

function pointStyle(p: { x: number; y: number } | undefined): { left: string; top: string } {
  if (!p || typeof p.x !== "number" || typeof p.y !== "number") {
    return { left: "0%", top: "0%" };
  }
  return {
    left: pct(p.x),
    top: pct(p.y),
  };
}

function courierDotClass(c: { status?: string } | undefined): string {
  if (!c) return "bg-muted"
  switch (c.status) {
    case "idle":
      return "bg-info";
    case "busy":
      return "bg-primary";
    default:
      return "bg-muted";
  }
}

type BadgeColor = "primary" | "secondary" | "success" | "warning" | "info" | "error" | "neutral"

function orderStatusColor(status: string | undefined): BadgeColor {
  if (status == null) return "neutral"
  const map: Record<string, BadgeColor> = {
    pending: "warning",
    assigned: "info",
    picked_up: "primary",
    in_transit: "primary",
    delivered: "success",
    cancelled: "neutral",
  }
  return map[status] ?? "neutral"
}

function courierStatusColor(status: string | undefined): BadgeColor {
  if (status == null) return "neutral"
  switch (status) {
    case "idle":
      return "info"
    case "busy":
      return "primary"
    default:
      return "neutral"
  }
}

async function onRefresh() {
  refreshStatus.value = "pending";
  try {
    await refreshData();
  } finally {
    refreshStatus.value = "idle";
  }
}

async function onClearAll() {
  clearStatus.value = "pending";
  try {
    await clearAll();
  } finally {
    clearStatus.value = "idle";
  }
}

async function submitOrder() {
  orderError.value = "";
  randomizeOrderCoords();
  orderSubmitStatus.value = "pending";
  try {
    const res = await createOrder(
      { x: newOrder.pickupX, y: newOrder.pickupY },
      { x: newOrder.dropoffX, y: newOrder.dropoffY },
    );
    if (res?.assignment && !res.assignment.assigned) {
      orderError.value = res.assignment.message ?? "No couriers available";
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    orderError.value =
      err?.data?.message ?? err?.message ?? "Failed to create order";
  } finally {
    orderSubmitStatus.value = "idle";
  }
}

async function submitCourier() {
  courierError.value = "";
  randomizeCourierCoords();
  courierSubmitStatus.value = "pending";
  try {
    await createCourier({ x: newCourier.x, y: newCourier.y });
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    courierError.value =
      err?.data?.message ?? err?.message ?? "Failed to add courier";
  } finally {
    courierSubmitStatus.value = "idle";
  }
}
</script>

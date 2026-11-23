// Return requests, kept in THIS browser only (localStorage) while the site is in DEMO MODE.
// Nothing is picked up and no money is refunded. Round 2: replace these functions with database calls.

import { DEMO_MODE, RETURNS_STORAGE_KEY } from "@/lib/constants";
import { getOrderById } from "@/lib/orders";
import type { Order, ReturnItem, ReturnReason, ReturnRequest } from "@/lib/types";

/** Days after delivery during which a return can be requested. The window ends at the end of the last day. */
export const RETURN_WINDOW_DAYS = 7;
export const RETURN_NOTE_MAX = 300;
const MAX_RETURNS = 100;

export const RETURN_REASONS: { id: ReturnReason; label: string }[] = [
  { id: "damaged", label: "The item arrived damaged" },
  { id: "wrong_item", label: "I received the wrong item" },
  { id: "not_as_described", label: "The item is not as described" },
  { id: "size_fit", label: "Size or fit problem" },
  { id: "no_longer_needed", label: "I no longer need it" },
  { id: "other", label: "Another reason" },
];

export function reasonLabel(id: ReturnReason): string {
  return RETURN_REASONS.find((r) => r.id === id)?.label ?? "Another reason";
}

/** Last moment a return can be requested: the end of the 7th day after delivery. Null if there is no delivery date. */
export function returnDeadline(order: Order): Date | null {
  if (!order.deliveredAt) return null;
  const d = new Date(order.deliveredAt);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + RETURN_WINDOW_DAYS);
  d.setHours(23, 59, 59, 999);
  return d;
}

export type ReturnState =
  | { kind: "not_delivered" }
  | { kind: "no_date" }
  | { kind: "all_requested" }
  | { kind: "expired"; deadline: Date }
  | { kind: "eligible"; deadline: Date; availableIndexes: number[] };

/** Can this order be returned right now, and which of its lines are still open for a return? */
export function returnState(order: Order, returns: ReturnRequest[], now: Date = new Date()): ReturnState {
  if (order.status !== "delivered") return { kind: "not_delivered" };
  const deadline = returnDeadline(order);
  if (!deadline) return { kind: "no_date" };
  const taken = new Set<number>();
  for (const r of returns) {
    if (r.orderId === order.id) for (const i of r.items) taken.add(i.orderItemIndex);
  }
  const availableIndexes = order.items.map((_, i) => i).filter((i) => !taken.has(i));
  if (availableIndexes.length === 0) return { kind: "all_requested" };
  if (now.getTime() > deadline.getTime()) return { kind: "expired", deadline };
  return { kind: "eligible", deadline, availableIndexes };
}

function createReturnId(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${DEMO_MODE ? "DEMO-RET" : "RET"}-${yy}${mm}${dd}-${rand}`;
}

const REASON_IDS: string[] = RETURN_REASONS.map((r) => r.id);

/** All saved return requests, newest first. Broken data is ignored. */
export function loadReturns(): ReturnRequest[] {
  try {
    const raw = localStorage.getItem(RETURNS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (r): r is ReturnRequest =>
        r &&
        typeof r.id === "string" &&
        typeof r.orderId === "string" &&
        Array.isArray(r.items) &&
        r.items.every((i: ReturnItem) => i && Number.isInteger(i.orderItemIndex) && typeof i.name === "string") &&
        REASON_IDS.includes(r.reason) &&
        typeof r.createdAt === "string"
    );
  } catch {
    return [];
  }
}

export type SubmitResult =
  | { ok: true; request: ReturnRequest }
  | { ok: false; reason: "missing" | "not_eligible" | "nothing_selected" | "storage" };

/**
 * Saves a return request. It checks everything again right now (order, 7-day window, lines not
 * already requested) and reads the data back, so it only says "ok" when the request is really saved.
 */
export function submitReturn(args: {
  orderId: string;
  itemIndexes: number[];
  reason: ReturnReason;
  note: string;
}): SubmitResult {
  const order = getOrderById(args.orderId);
  if (!order) return { ok: false, reason: "missing" };

  const existing = loadReturns();
  const state = returnState(order, existing);
  if (state.kind !== "eligible") return { ok: false, reason: "not_eligible" };

  const chosen = Array.from(new Set(args.itemIndexes)).filter((i) => state.availableIndexes.includes(i));
  if (chosen.length === 0) return { ok: false, reason: "nothing_selected" };

  const items: ReturnItem[] = chosen
    .sort((a, b) => a - b)
    .map((i) => {
      const it = order.items[i];
      return {
        orderItemIndex: i,
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        emoji: it.emoji,
        variant: it.variant,
      };
    });

  const note = args.note.trim().slice(0, RETURN_NOTE_MAX);
  const request: ReturnRequest = {
    id: createReturnId(),
    orderId: order.id,
    items,
    reason: args.reason,
    note: note || undefined,
    status: "received",
    createdAt: new Date().toISOString(),
    isDemo: DEMO_MODE,
  };

  try {
    localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify([request, ...existing].slice(0, MAX_RETURNS)));
    return loadReturns().some((r) => r.id === request.id) ? { ok: true, request } : { ok: false, reason: "storage" };
  } catch {
    return { ok: false, reason: "storage" };
  }
}

import { cacheLife } from "next/cache";
import { apiFetch } from "../http";
import { env } from "../env";

export interface BuyerStats {
  total_orders: number;
  orders_by_status: {
    created: number;
    awaiting_payment: number;
    paid: number;
    picked_up: number;
    shipping: number;
    delivered: number;
    shipping_failed: number;
    cancelled: number;
  };
  average_ticket: number;
  currency: string;
}

export async function getBuyerStats(
  dateFrom?: string,
  dateTo?: string,
): Promise<BuyerStats> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams();
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<BuyerStats>(
    `${env.buyerApiUrl}/api/buyer/admin/stats?${p}`,
    env.internalApiKey,
  );
}

export async function getActiveBuyersCount(
  dateFrom?: string,
  dateTo?: string,
): Promise<number> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams();
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  const { count } = await apiFetch<{ count: number }>(
    `${env.buyerApiUrl}/api/buyer/admin/usuarios-activos?${p}`,
    env.internalApiKey,
  );
  return count;
}

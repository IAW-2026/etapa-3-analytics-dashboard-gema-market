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

export interface BuyerOrder {
  order_id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface BuyerOrdersPage {
  items: BuyerOrder[];
  page: number;
  page_size: number;
  total: number;
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

export async function getBuyerOrders(
  page = 1,
  pageSize = 20,
  dateFrom?: string,
  dateTo?: string,
): Promise<BuyerOrdersPage> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<BuyerOrdersPage>(
    `${env.buyerApiUrl}/api/buyer/admin/ordenes?${p}`,
    env.internalApiKey,
  );
}

export async function getActiveBuyersCount(
  dateFrom?: string,
  dateTo?: string,
): Promise<number> {
  "use cache";
  cacheLife("minutes");
  const PAGE_SIZE = 100;
  const MAX_PAGES = 20;
  const buyerIds = new Set<string>();

  const buildUrl = (page: number) => {
    const p = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    return `${env.buyerApiUrl}/api/buyer/admin/ordenes?${p}`;
  };

  const first = await apiFetch<BuyerOrdersPage>(buildUrl(1), env.internalApiKey);
  for (const o of first.items) buyerIds.add(o.buyer_id);

  const totalPages = Math.min(Math.ceil(first.total / PAGE_SIZE), MAX_PAGES);
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        apiFetch<BuyerOrdersPage>(buildUrl(i + 2), env.internalApiKey),
      ),
    );
    for (const page of rest)
      for (const o of page.items) buyerIds.add(o.buyer_id);
  }

  return buyerIds.size;
}

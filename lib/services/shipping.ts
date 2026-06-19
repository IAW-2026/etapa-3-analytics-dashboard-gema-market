import { cacheLife } from "next/cache";
import { apiFetch } from "../http";
import { env } from "../env";

export type ShipmentStatus =
  | "waiting_for_courier"
  | "pending_pickup"
  | "picked_up"
  | "in_transit"
  | "delivered";

export interface ShippingStats {
  total_shipments: number;
  shipments_by_status: Record<ShipmentStatus, number>;
  average_delivery_hours: number;
  on_time_rate: number;
}

export interface ShippingTimeseries {
  granularity: "day" | "week" | "month";
  series: Array<{ bucket: string; value: number }>;
}

export async function getShippingStats(
  dateFrom?: string,
  dateTo?: string,
): Promise<ShippingStats> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams();
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<ShippingStats>(
    `${env.shippingApiUrl}/api/shipping/admin/stats?${p}`,
    env.internalApiKey,
  );
}

export async function getShippingTimeseries(
  metric: "shipments" | "delivered" = "shipments",
  granularity: "day" | "week" | "month" = "day",
  dateFrom?: string,
  dateTo?: string,
): Promise<ShippingTimeseries> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams({ metric, granularity });
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<ShippingTimeseries>(
    `${env.shippingApiUrl}/api/shipping/admin/stats/timeseries?${p}`,
    env.internalApiKey,
  );
}

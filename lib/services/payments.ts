import { cacheLife } from "next/cache";
import { apiFetch } from "../http";
import { env } from "../env";

export type PaymentStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "in_mediation";

export interface PaymentsStats {
  total_payments: number;
  payments_by_status: Record<PaymentStatus, number>;
  total_volume: number;
  currency: string;
  approval_rate: number;
}

export interface TimeseriesPoint {
  bucket: string;
  value: number;
}

export interface PaymentsTimeseries {
  granularity: "day" | "week" | "month";
  metric: "count" | "total_volume";
  series: TimeseriesPoint[];
}

export interface PaymentOrder {
  payment_id: string;
  buyer_id: string;
  orders: Array<{
    order_id: string;
    seller_id: string;
    product_id: string;
    quote_id?: string;
    amount: number;
  }>;
  total_amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  paid_at: string | null;
}

export interface PaymentOrdersPage {
  items: PaymentOrder[];
  page: number;
  page_size: number;
  total: number;
}

export async function getPaymentsStats(
  dateFrom?: string,
  dateTo?: string,
): Promise<PaymentsStats> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams();
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<PaymentsStats>(
    `${env.paymentsApiUrl}/api/payments/admin/stats?${p}`,
    env.internalApiKey,
  );
}

export async function getPaymentsTimeseries(
  metric: "count" | "total_volume" = "total_volume",
  granularity: "day" | "week" | "month" = "day",
  dateFrom?: string,
  dateTo?: string,
): Promise<PaymentsTimeseries> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams({ metric, granularity });
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<PaymentsTimeseries>(
    `${env.paymentsApiUrl}/api/payments/admin/stats/timeseries?${p}`,
    env.internalApiKey,
  );
}

export async function getPaymentOrders(
  page = 1,
  pageSize = 20,
  dateFrom?: string,
  dateTo?: string,
): Promise<PaymentOrdersPage> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<PaymentOrdersPage>(
    `${env.paymentsApiUrl}/api/payments/admin/ordenes-de-pago?${p}`,
    env.internalApiKey,
  );
}

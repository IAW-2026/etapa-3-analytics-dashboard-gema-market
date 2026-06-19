import type { BuyerStats } from "./services/buyer";
import type { SellerStats } from "./services/seller";
import type { PaymentsStats } from "./services/payments";
import type { ShippingStats } from "./services/shipping";

export interface GlobalKPIs {
  gmv: number;
  currency: string;
  completedOrders: number;
  activeUsers: number;
  approvalRate: number;
  deliveredShipments: number;
  onTimeRate: number;
  averageDeliveryHours: number;
  averageTicket: number;
  activeCatalogProducts: number;
  ordersSnapshot: BuyerStats["orders_by_status"] | null;
  paymentsByStatus: Record<string, number> | null;
  shipmentsByStatus: Record<string, number> | null;
}

type Settled<T> = PromiseSettledResult<T>;

export function buildKPIs(
  buyerResult: Settled<BuyerStats>,
  sellerResult: Settled<SellerStats>,
  paymentsResult: Settled<PaymentsStats>,
  shippingResult: Settled<ShippingStats>,
  activeUsers: number,
): GlobalKPIs {
  const buyer = buyerResult.status === "fulfilled" ? buyerResult.value : null;
  const seller = sellerResult.status === "fulfilled" ? sellerResult.value : null;
  const payments = paymentsResult.status === "fulfilled" ? paymentsResult.value : null;
  const shipping = shippingResult.status === "fulfilled" ? shippingResult.value : null;

  const deliveredShipments = shipping?.shipments_by_status.delivered ?? 0;

  return {
    gmv: payments?.total_volume ?? 0,
    currency: payments?.currency ?? buyer?.currency ?? "ARS",
    completedOrders: buyer?.orders_by_status.delivered ?? 0,
    activeUsers,
    approvalRate: payments?.approval_rate ?? 0,
    deliveredShipments,
    onTimeRate: shipping?.on_time_rate ?? 0,
    averageDeliveryHours: shipping?.average_delivery_hours ?? 0,
    averageTicket: buyer?.average_ticket ?? 0,
    activeCatalogProducts: seller?.products_by_status.active ?? 0,
    ordersSnapshot: buyer?.orders_by_status ?? null,
    paymentsByStatus: payments?.payments_by_status ?? null,
    shipmentsByStatus: shipping?.shipments_by_status ?? null,
  };
}

export function formatCurrency(value: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

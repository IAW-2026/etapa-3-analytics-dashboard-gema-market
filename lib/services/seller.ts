import { cacheLife } from "next/cache";
import { apiFetch } from "../http";
import { env } from "../env";

export interface SellerStats {
  total_products: number;
  products_by_status: { active: number; paused: number };
  hidden_products: number;
  total_sales: number;
  total_revenue: number;
  currency: string;
  top_categories: Array<{ category_id: string; name: string; count: number }>;
  top_sellers: Array<{ seller_id: string; shop_name: string; revenue: number }>;
}

export interface Venta {
  venta_id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  buyer_name: string;
  amount: number;
  fee: number;
  status: "paid" | "shipping" | "delivered" | "shipping_failed";
  tracking_code: string | null;
  created_at: string;
}

export interface VentasPage {
  items: Venta[];
  page: number;
  page_size: number;
  total: number;
}

export interface Producto {
  product_id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  category_id: string;
  category_name: string;
  status: "active" | "paused";
  condition: "nuevo" | "usado";
  stock: number;
  hidden_by_admin: boolean;
  deleted_at: string | null;
  created_at: string;
}

export interface ProductosPage {
  items: Producto[];
  page: number;
  page_size: number;
  total: number;
}

export async function getSellerStats(
  dateFrom?: string,
  dateTo?: string,
): Promise<SellerStats> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams();
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<SellerStats>(
    `${env.sellerApiUrl}/api/seller/admin/stats?${p}`,
    env.sellerInternalApiKey,
  );
}

export async function getVentas(
  page = 1,
  pageSize = 20,
  dateFrom?: string,
  dateTo?: string,
): Promise<VentasPage> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  return apiFetch<VentasPage>(
    `${env.sellerApiUrl}/api/seller/admin/ventas?${p}`,
    env.sellerInternalApiKey,
  );
}

export async function getProductos(
  page = 1,
  pageSize = 20,
  sortBy = "stock",
  order: "asc" | "desc" = "asc",
): Promise<ProductosPage> {
  "use cache";
  cacheLife("minutes");
  const p = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
    order,
  });
  return apiFetch<ProductosPage>(
    `${env.sellerApiUrl}/api/seller/admin/productos?${p}`,
    env.sellerInternalApiKey,
  );
}

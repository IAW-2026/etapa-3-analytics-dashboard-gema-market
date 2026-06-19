# Plan de ejecución — Etapa 3 · Analytics Dashboard (NUEVO · `proyecto-c-analytics-gema-market`)

> **Orden de ejecución:** 6 de 6 (último). Se ejecuta **después** de los planes 01–04, porque consume sus
> endpoints `/admin/stats` (y los listados admin para desgloses).
> **Disputas: fuera de alcance.** **Marca:** "UniHousing — Analytics". **Persistencia:** **sin DB**
> (agregador puro con cache de lectura). **Auth:** humano `superadmin` (Clerk); backend con API-key.

## Objetivo

Herramienta de **lectura y análisis** del sistema completo. **No es un CRUD.** Consolida datos de las 4 apps
y los presenta con KPIs y visualizaciones para entender el estado "de un vistazo". La complejidad está en
**consolidar múltiples fuentes** y presentarlas de forma útil.

## Stack y principios

- **Next.js (App Router) + TypeScript estricto + Tailwind v4** + **Clerk** (login `superadmin`) +
  **Recharts** (ya usado en Shipping; reutilizar criterio visual). **Sin Prisma / sin DB.**
- **Solo lectura.** Toda data se obtiene server-side con la **API-key**.
- **Cache de lectura:** `fetch(url, { next: { revalidate: 60 } })` (o cache in-memory por request) — no
  hace falta frescura al segundo. Filtro de rango de fechas reutilizado en todas las páginas (params URL).
- **Resiliencia:** `Promise.allSettled`; si una app falla, su tarjeta/gráfico muestra "no disponible" y el
  resto del dashboard sigue.

## Estructura del repo

```
proyecto-c-analytics-gema-market/
├─ app/
│  ├─ layout.tsx  ├─ globals.css  (tokens @theme)
│  ├─ page.tsx               # /  → resumen ejecutivo
│  ├─ ventas/page.tsx
│  ├─ pagos/page.tsx
│  ├─ logistica/page.tsx
│  ├─ catalogo/page.tsx
│  ├─ unauthorized/page.tsx  ├─ sign-in/[[...sign-in]]/page.tsx
│  ├─ error.tsx  ├─ not-found.tsx  ├─ loading.tsx
├─ lib/
│  ├─ env.ts  ├─ api-key.ts  ├─ http.ts
│  ├─ services/  (seller.ts, buyer.ts, shipping.ts, payments.ts)  # solo lecturas (stats + listados)
│  └─ aggregate.ts          # consolida los 4 stats en KPIs globales
├─ components/
│  ├─ shell/ (SideNav, TopBar, BottomNav, DateRangePicker)
│  ├─ charts/ (BarChart, LineChart, DonutChart)  # wrappers de Recharts con la paleta
│  └─ ui/ (MetricCard, Card, DataTable, Badge, Skeleton, Icon, EmptyState, ErrorState)
├─ middleware.ts            # Clerk: rol superadmin
├─ .env.example  └─ README.md
```

## Design system (consistencia visual)

- Mismos tokens que las 4 apps (copiar `@theme` de `proyecto-c-buyer-gema-market/app/globals.css`):
  paleta earth-tone, `r1–r4`, `sh-1..3`, `lgx 1100px`. Fuentes Inter + JetBrains Mono.
- **Acento sugerido:** `moss`/`success` (datos/insights), para diferenciarse del Control Plane (`forest`).
- **Charts con la paleta:** series usando `moss/clay/olive/sand/forest`; ejes/grid `line`/`ink-3`; tooltips
  `bg-paper border-line rounded-r2 shadow-sh-2`. `MetricCard` para KPIs (número grande + delta + label mono).
- **Accesibilidad:** cada gráfico acompañado de una **tabla/numérico** equivalente (alternativa textual);
  contraste AA; `aria-label` en los SVG de Recharts.

## Variables de entorno (`.env.example`)

Idénticas al Control Plane salvo que **no** requiere `CLERK_SECRET_KEY` para Backend API (no muta usuarios):
```
SELLER_API_URL=...   BUYER_API_URL=...   SHIPPING_API_URL=...   PAYMENTS_API_URL=...
INTERNAL_API_KEY=...        SELLER_INTERNAL_API_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...   CLERK_SECRET_KEY=...   # solo para validar la sesión
```

## Capa de integración

- `lib/api-key.ts` / `lib/http.ts`: igual que Control Plane (`hashApiKey` SHA-256 hex-UPPER, header
  `x-api-key-hash`), pero con `next: { revalidate: 60 }`.
- `lib/services/*`: **solo lecturas** → `getStats(range)` (`GET /api/{app}/admin/stats?date_from&date_to`),
  más los listados admin para desgloses (`/admin/ventas`, `/admin/envios`, `/admin/ordenes`,
  `/admin/ordenes-de-pago`) y, si existen, `/admin/stats/timeseries`.
- `lib/aggregate.ts`: combina los 4 stats en KPIs globales. Mapeos clave:
  - **Ingresos / GMV** = `payments.total_volume`.
  - **Pedidos completados** = `buyer.orders_by_status.delivered`.
  - **Tasa de aprobación de pagos** = `payments.approval_rate`.
  - **Envíos entregados / tasa de fallo** = `shipping.shipments_by_status.delivered` / `shipping.failure_rate`.
  - **Ticket promedio** = `buyer.average_ticket`. **Catálogo activo** = `seller.products_by_status.active`.
  - **Usuarios activos** = unión de usuarios de las 4 apps (vía `/admin/usuarios`) o, más simple, conteo de
    compradores con órdenes en el rango.

## Páginas y visualizaciones

### `/` — Resumen ejecutivo
- Fila de `MetricCard`: Ingresos (GMV), Pedidos completados, Usuarios activos, Tasa de aprobación de pagos,
  Envíos entregados, Ticket promedio.
- Mini-charts: órdenes por estado (donut, Buyer), volumen de pagos por estado (barras, Payments).
- Filtro de rango de fechas global (aplica a todas las llamadas vía `date_from/date_to`).
- `allSettled` sobre los 4 `getStats` + placeholders por fuente caída.

### `/ventas` — comercio
- Embudo de órdenes por estado (barras horizontales, `buyer.orders_by_status`).
- Ventas e ingresos por vendedor (`seller.getStats().top_sellers` + `GET /api/seller/admin/ventas` para
  desglose). Tabla top-N + barras.

### `/pagos` — finanzas
- Volumen por estado (barras), approval rate (gauge/`MetricCard`), evolución temporal de volumen
  (línea, `payments` timeseries si existe; si no, derivar paginando `/admin/ordenes-de-pago` por fecha).

### `/logistica` — operaciones
- Envíos por estado (donut, `shipping.shipments_by_status`), tiempo promedio de entrega
  (`average_delivery_hours`, `MetricCard`), % fallidos (`failure_rate`). Tendencia de envíos (línea).

### `/catalogo` — inventario
- Productos por estado/categoría (barras apiladas, `seller.products_by_status` + `top_categories`),
  top productos/vendedores (tabla). Stock bajo (derivado de `/admin/productos?sort_by=stock&order=asc`).

## Patrones obligatorios

- **No CRUD:** sin botones de mutación. Solo lectura, filtros y export opcional (CSV de una tabla).
- Filtro de fechas con params URL (`?date_from=&date_to=`) compartido por todas las páginas.
- `loading.tsx`/Skeletons por tarjeta; `ErrorState` por fuente caída; `not-found`/`error` boundaries.
- Cada gráfico con su tabla/numérico equivalente (accesibilidad).

## Datos de prueba

Usa los seeds de las 4 apps. Para la defensa, mostrar cómo al completar una compra real (Buyer→Payments→
Seller→Shipping) los contadores del dashboard suben.

## README

Descripción, link al deploy, credenciales `superadmin`, nota de que es solo-lectura y consolida las 4 apps.
Commits progresivos.

## Checklist de ejecución

- [ ] Scaffold Next.js + Tailwind v4 + tokens + Recharts + fuentes.
- [ ] `middleware.ts` (rol `superadmin`) + `/unauthorized` + `/sign-in`.
- [ ] `lib/{env,api-key,http,aggregate}.ts` + `lib/services/{seller,buyer,shipping,payments}.ts` (lecturas).
- [ ] `components/charts/*` (Recharts con paleta) + `MetricCard`/`DataTable`/`DateRangePicker`.
- [ ] Páginas: resumen → ventas → pagos → logística → catálogo.
- [ ] Cache `revalidate: 60` + `allSettled` + estados de error.
- [ ] Alternativa textual (tabla) por gráfico (accesibilidad).
- [ ] `.env.example` + deploy Vercel.
- [ ] README + verificación (KPIs cuadran contra los `/admin/stats` crudos; app caída ⇒ panel "no disponible").

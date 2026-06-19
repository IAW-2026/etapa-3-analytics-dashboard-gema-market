# UniHousing — Analytics Dashboard

Dashboard de **lectura y análisis** para UniHousing. Consolida datos de las 4 aplicaciones del marketplace (Seller, Buyer, Shipping, Payments) y los presenta con KPIs y visualizaciones para entender el estado del negocio "de un vistazo".

> **Proyecto académico** — Ingeniería de Aplicaciones Web 2026 · Universidad nacional del Sur

## Deploy [https://etapa-3-analytics-dashboard-gema-ma.vercel.app/]
## Stack

- **Next.js 16** (App Router) + **TypeScript** estricto
- **Tailwind CSS v4** con sistema de tokens (`@theme`) heredado de las apps del marketplace
- **Clerk** — autenticación y autorización (rol `superadmin`)
- **Recharts** — visualizaciones (wrappers con paleta _earth-tone_)
- **Sin base de datos** — agregador puro con caché de lectura (`revalidate: 60`)

## Funcionalidades

- **Solo lectura** — sin botones de mutación. Filtros y exportación opcional CSV.
- **Filtro de rango de fechas global** — compartido por todas las páginas vía `?date_from=&date_to=`.
- **Resiliencia** — si una API fuente falla, su tarjeta/gráfico muestra _"no disponible"_ y el resto del dashboard sigue intacto.
- **Accesibilidad** — cada gráfico acompañado de una tabla/numérico equivalente; contraste AA; `aria-label` en los SVG.

## Páginas

| Ruta | Sección | KPIs principales |
|------|---------|------------------|
| `/` | Resumen ejecutivo | GMV, pedidos, usuarios activos, aprobación pagos, envíos, ticket promedio |
| `/ventas` | Comercio | Órdenes por estado, top vendedores, ingresos por vendedor |
| `/pagos` | Finanzas | Volumen por estado, approval rate, evolución temporal |
| `/logistica` | Operaciones | Envíos por estado, tiempo promedio entrega, tasa de fallo |
| `/catalogo` | Inventario | Productos por estado/categoría, stock bajo, top productos |

## Arquitectura

```
app/                          # Next.js App Router pages + layouts
├── (app)/                    # Grupo autenticado (layout con SideNav + TopBar)
│   ├── page.tsx              #   /  → Resumen ejecutivo
│   ├── ventas/page.tsx       #   /ventas
│   ├── pagos/page.tsx        #   /pagos
│   ├── logistica/page.tsx    #   /logistica
│   └── catalogo/page.tsx     #   /catalogo
├── sign-in/                  # Login con Clerk
├── unauthorized/             # Página 403
├── error.tsx / not-found.tsx
lib/
├── env.ts                    # Variables de entorno tipadas
├── api-key.ts                # Hash SHA-256 para autenticación entre servicios
├── http.ts                   # Fetch wrapper con cache
├── aggregate.ts              # Consolidación de KPIs globales
└── services/                 # Lecturas contra APIs de las 4 apps
    ├── seller.ts
    ├── buyer.ts
    ├── shipping.ts
    └── payments.ts
components/
├── shell/                    # SideNav, TopBar, BottomNav, DateRangePicker
├── charts/                   # BarChartWidget, LineChartWidget, DonutChartWidget
└── ui/                       # MetricCard, Card, DataTable, Badge, Skeleton, etc.
middleware.ts                 # Clerk: protege rutas con rol superadmin
```

## Variables de entorno

```env
# URLs de las APIs del marketplace
SELLER_API_URL=...
BUYER_API_URL=...
SHIPPING_API_URL=...
PAYMENTS_API_URL=...

# API keys para autenticación entre servicios
INTERNAL_API_KEY=...
SELLER_INTERNAL_API_KEY=...

# Clerk (frontend + backend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) e iniciar sesión con credenciales `superadmin`.

## Credenciales de prueba (superadmin)

| Campo | Valor |
|-------|-------|
| Email | `analyticsdashboard+cler_test@iaw.com` |
| pass | `iawuser#` |

> El dashboard es **solo lectura**. Los datos se generan completando compras reales en las 4 apps del marketplace (Buyer → Payments → Seller → Shipping) y se ven reflejados aquí con hasta 60 segundos de desfase.

## Deploy

```bash
pnpm build   # Produce .next/ listo para Vercel
```



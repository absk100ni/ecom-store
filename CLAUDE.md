# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

ElectroMart — a modern, responsive electronics e-commerce **storefront** (frontend only). It is the React/TypeScript UI that talks to a separate Go backend (`ecom-core-service`) running at `http://localhost:8080`. The full shopping flow is implemented: browse → product detail → cart → OTP login → checkout → payment (Razorpay + Cashfree) → order history.

This repo contains **no backend code**. The API contract it consumes is documented in [.context.md](.context.md), which is the source of truth for endpoints, response shapes, seed data, and coupons.

## Commands

```bash
npm install        # install deps
npm run dev        # dev server on http://localhost:3000 (NOT 5173 — README is outdated)
npm run build      # tsc type-check + vite production build → dist/
npm run preview    # serve the built dist/
```

The backend must be running on port 8080 for anything beyond static UI to work. There is **no test runner, linter, or formatter** configured — `npm run build` (which runs `tsc`) is the only verification gate. Type-check changes with it before considering work done.

## Backend connection & environment

- `src/services/api.ts` reads `import.meta.env.VITE_API_URL`, defaulting to `/api/v1`.
- In dev, requests to `/api/*` are proxied to `http://localhost:8080` via [vite.config.ts](vite.config.ts#L5) (`changeOrigin: true`). So the default relative base works without setting any env var.
- Set `VITE_API_URL` (e.g. in `.env.local`) only to point at a non-local backend.
- OTP in backend dev mode is always `123456`.

## Architecture & conventions

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Zustand (state), Axios (HTTP), React Router v6, react-hot-toast (notifications), lucide-react (icons). No component library.

**Routing** — All routes live in [src/App.tsx](src/App.tsx) inside `AppLayout`. Layout chrome (AnnouncementBar, Header, Footer, MobileBottomNav) wraps every page except `/login`. A `ScrollToTop` helper resets scroll on navigation. Unknown routes redirect to `/`.

**API layer** — [src/services/api.ts](src/services/api.ts) exports flat functions (`getProducts`, `addToCart`, `createOrder`, …), each a thin Axios wrapper returning the raw Axios promise. Import the whole module as a namespace: `import * as api from '../services/api'`, then `api.getProducts(...)`. A request interceptor injects `Authorization: Bearer <token>` from `localStorage`. When adding an endpoint, add a function here — do not call `axios` directly from components.

**State (Zustand)** — [src/store/useStore.ts](src/store/useStore.ts) holds only **auth** (`user`, `token`, `isAuth`) and **cart** (`cart`, `cartTotal`, `cartCount`). Auth state is persisted to and hydrated from `localStorage` (`token`, `user`); `setAuth`/`logout` keep both in sync. Cart is **not** persisted in the store — pages re-fetch it with `api.getCart()` on mount and push into the store via `setCart`. Everything else (product lists, filters, checkout steps) is local `useState` per page.

**Data fetching** — Pages fetch in `useEffect` with `.then().catch(() => {}).finally(...)`, tracking a local `loading` flag. Errors are generally swallowed or surfaced via `toast.error(err.response?.data?.error || '...')`. Filtering/sorting on the products page is done **client-side** over a fetched page of results (see [ProductsPage.tsx](src/pages/ProductsPage.tsx)) — the backend only does category/search/pagination.

**Money** — All prices from the API are in **paise (integers)**. Always divide by 100 for display and format with `.toLocaleString('en-IN')` → `₹{(price / 100).toLocaleString('en-IN')}`. Never store or send rupee floats.

**Payments** — Checkout is a 4-step state machine (`address → review → payment → success`) in [src/pages/CheckoutPage.tsx](src/pages/CheckoutPage.tsx). The flow: `createOrder` → `createPayment` → branch on `payData.gateway` to open Razorpay or Cashfree. Both SDKs are loaded via `<script>` tags in [index.html](index.html) and accessed off `window` (typed via a `declare global`). If no gateway is configured, the order is placed and payment is skipped (mock success). `verifyPayment` is sent a `gateway` discriminator plus gateway-specific fields.

**Styling** — Tailwind utility classes inline, plus reusable component classes defined with `@layer components` in [src/index.css](src/index.css): `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-accent`, `btn-dark`, `input-field`, `card`, `card-hover`, `badge`, `badge-sale`/`badge-new`/`badge-hot`, `section-heading`, `glass`, `shimmer` (skeleton loaders), `line-clamp-*`. Prefer these over re-deriving the same utility strings. Theme is in [tailwind.config.js](tailwind.config.js): brand color is `primary` (sky blue, `primary-600` = `#0284c7`), with `accent` (fuchsia), `neon`, and `surface` palettes; font is Inter. Mobile-first; `lg:` breakpoint switches between mobile bottom-nav and desktop layouts.

**TypeScript style** — Pragmatic, not strict. API payloads are typed as `any` (`useState<any[]>`, `params?: any`); only the Zustand store defines real interfaces. Match the surrounding looseness rather than introducing heavy typing for API data.

**Structure** — `src/components/{layout,home,ui}` for reusable pieces, `src/pages` for routed pages. `ProductCard` ([src/components/ui/ProductCard.tsx](src/components/ui/ProductCard.tsx)) is the shared card used in grids and supports a `view: 'grid' | 'list'` prop.

## Notable gotchas

- README port (5173) is wrong; the real dev port is **3000**.
- Order/payment responses may use either snake_case or PascalCase keys — existing code reads both (`order.id || order.ID`, `order.order_number || order.OrderNumber`).
- Cart cancellation paths intentionally still navigate to `success` ("Order saved — pay later from Orders").
- Several README "To Do" items (wishlist, profile page, reviews UI, coupon input) have backend support but no frontend yet — check [README.md](README.md) before assuming a feature is missing.

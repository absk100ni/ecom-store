# 🛍️ ElectroMart — E-Commerce Storefront

A modern, responsive e-commerce storefront built with React + TypeScript + Tailwind CSS. Features a rich homepage with promo banners, category grid, featured products, trust badges, and a complete shopping flow with Razorpay payment integration.

## 🚀 Quick Start

```bash
cd ecom-store
npm install
npm run dev
```

Frontend starts on **http://localhost:5173** (needs backend on port 8080)

## ✅ What's Done

| Feature | Status | Details |
|---------|--------|---------|
| Homepage | ✅ Complete | Hero banner, announcement bar, category grid, featured products, deal of the day, trust badges |
| Product Listing | ✅ Complete | Grid/list view, sidebar filters (category, price, rating), sort options |
| Product Detail | ✅ Complete | Image gallery, variants, add to cart, related products, star rating |
| Shopping Cart | ✅ Complete | Add/remove/update quantity, cart total, proceed to checkout |
| Checkout Flow | ✅ Complete | 3-step: Address → Review → Razorpay Payment → Success |
| Razorpay Integration | ✅ Complete | Opens Razorpay popup, signature verification, dev-mode fallback |
| OTP Login | ✅ Complete | Phone number + OTP, JWT token storage |
| My Orders | ✅ Complete | Order history, status tracking |
| Header/Footer | ✅ Complete | Search bar, cart icon with count, category nav, mobile responsive |
| Mobile Bottom Nav | ✅ Complete | Home, categories, cart, profile tabs for mobile |
| Responsive Design | ✅ Complete | Mobile-first, works on all screen sizes |
| Zustand Store | ✅ Complete | Global state for auth, cart, UI |

## ❌ What's Left To Do

### 🔴 Must Have (Before Production)
- [ ] **Razorpay Key** — Set `RAZORPAY_KEY_ID` in backend env so payment popup opens (currently skips payment in dev mode)
- [ ] **Backend URL** — Update `VITE_API_URL` if backend is not on localhost:8080
- [ ] **Product Images** — Replace placeholder images with real product photos
- [ ] **Error Boundaries** — Add React error boundaries for graceful crash handling

### 🟡 Should Have (Enhancement)
- [ ] **Wishlist Page** — UI for viewing/managing wishlisted products (API exists in backend)
- [ ] **User Profile Page** — View/edit profile, saved addresses, change phone
- [ ] **Product Reviews UI** — Submit reviews, display star ratings from other users
- [ ] **Coupon Code Input** — Add coupon input field in cart/checkout (backend supports it)
- [ ] **Search with Autocomplete** — Debounced search with dropdown suggestions
- [ ] **Category Pages** — Dedicated pages for each category with SEO-friendly URLs
- [ ] **Order Tracking Page** — Visual tracking timeline (placed → shipped → delivered)
- [ ] **Image Zoom** — Pinch-to-zoom on product images
- [ ] **Skeleton Loading** — Replace loading spinners with skeleton screens
- [ ] **Toast Notifications** — Improve toast styles and positioning

### 🔵 Nice To Have (Future)
- [ ] **PWA Support** — Service worker, offline mode, install prompt
- [ ] **Push Notifications** — FCM integration for order updates
- [ ] **Dark Mode** — Theme toggle with system preference detection
- [ ] **Product Comparison** — Side-by-side product comparison
- [ ] **Recently Viewed** — Track and display recently viewed products
- [ ] **Share Product** — WhatsApp/social share buttons
- [ ] **SEO** — React Helmet for meta tags, Open Graph
- [ ] **Analytics** — Google Analytics / Mixpanel integration
- [ ] **Internationalization (i18n)** — Multi-language support
- [ ] **A/B Testing** — Feature flags for homepage layouts
- [ ] **Performance** — Lazy loading images, code splitting, bundle optimization

## 🏗 Architecture

```
ecom-store/
├── index.html                          # Razorpay script loaded here
├── src/
│   ├── App.tsx                         # Router + Layout
│   ├── main.tsx                        # Entry point
│   ├── index.css                       # Tailwind + custom styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top nav, search, cart
│   │   │   ├── Footer.tsx              # Site footer
│   │   │   ├── AnnouncementBar.tsx     # Top promo strip
│   │   │   └── MobileBottomNav.tsx     # Mobile tab bar
│   │   ├── home/
│   │   │   ├── HeroBanner.tsx          # Hero carousel
│   │   │   ├── CategoryGrid.tsx        # Category cards
│   │   │   ├── FeaturedProducts.tsx    # Featured section
│   │   │   ├── PromoBanners.tsx        # Promo cards
│   │   │   ├── DealOfTheDay.tsx        # Countdown deal
│   │   │   └── TrustBadges.tsx         # Trust indicators
│   │   └── ui/
│   │       ├── ProductCard.tsx         # Reusable product card
│   │       ├── StarRating.tsx          # Star rating display
│   │       └── CountdownTimer.tsx      # Deal countdown
│   ├── pages/
│   │   ├── HomePage.tsx                # Landing page
│   │   ├── ProductsPage.tsx            # Listing + filters
│   │   ├── ProductDetailPage.tsx       # Product detail
│   │   ├── CartPage.tsx                # Shopping cart
│   │   ├── CheckoutPage.tsx            # 3-step checkout + Razorpay
│   │   ├── OrdersPage.tsx              # Order history
│   │   └── LoginPage.tsx               # OTP login
│   ├── services/api.ts                 # Axios API client
│   └── store/useStore.ts              # Zustand global state
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8080/api/v1 | Backend API base URL |

## 📄 License
MIT

# 🛍️ LucubraElec — Storefront

React + TypeScript + Tailwind storefront for [LucubraElec.in](https://lucubraelec.in) — electronics & components. Google login for accounts, **guest checkout for social-media (reel) traffic**, Razorpay payments with partial-COD, canonical shareable product URLs.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Starts on **http://localhost:3000** (needs backend on :8080).

## ✅ Feature Status

| Feature | Status | Details |
|---------|--------|---------|
| Homepage | ✅ | Hero, category grid, featured, deal of the day |
| Product listing | ✅ | Grid/list, category sidebar (slug-based filters), sort, search autocomplete |
| Product detail | ✅ | Gallery, variants, serviceability check, share button (canonical URL) |
| Canonical URLs | ✅ | `/p/{slug}` everywhere; legacy `/products/{id}` canonicalizes via history.replaceState |
| Cart | ✅ | Stock-capped steppers ("Max stock (N)"), coupon field, guest localStorage cart |
| Guest checkout | ✅ | No login needed: address → whole-rupee advance/COD split → Razorpay; cart merges into account on later login |
| Checkout | ✅ | All-or-nothing: modal dismiss/failure abandons order (stock+coupon released) and returns to checkout with cart intact; honest Payment Pending screen |
| Order tracking | ✅ | `/track` (public): order number + phone → status timeline; account users get Orders page + retry-payment button |
| Auth | ✅ | Google OAuth (accounts); guest flow avoids webview OAuth block for Instagram/FB/YouTube traffic |
| Wishlist / Reviews / Profile | ✅ | Full pages wired to backend |
| Mobile | ✅ | Responsive + bottom nav (Home / Products / Cart / Profile) |

## ❌ Left for launch

- [ ] Deploy to Vercel + `VITE_*` prod env vars (API URL, store URL, Google client ID)
- [ ] OG-meta edge function for rich link previews (reel links show generic preview until then)
- [ ] Real product catalog + photos (via admin panel)

## ⚙️ Configuration

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API base (default http://localhost:8080/api/v1) |
| VITE_STORE_NAME | Brand name (LucubraElec) |
| VITE_GOOGLE_CLIENT_ID | Google OAuth client |
| VITE_INSTAGRAM_URL / VITE_YOUTUBE_URL / VITE_FACEBOOK_URL | Social links (footer + follow cards) |
| VITE_ENABLE_PHONE_LOGIN | Phone-OTP login UI (hidden unless `true`) |

## 📄 License
MIT

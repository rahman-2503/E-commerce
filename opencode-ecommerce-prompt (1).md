# OPENCODE MASTER PROMPT — "AuroraCart" Full-Stack E-Commerce Platform

Copy everything below this line into opencode and let it run. It's written so the agent can work almost fully autonomously.

---

## ROLE & OPERATING MODE

You are acting as a senior full-stack architect + engineer. Build a complete, production-grade, visually premium e-commerce platform end-to-end, with minimal back-and-forth with me. Work in autonomous agent mode:

- Make all reasonable architectural decisions yourself. Do not ask me to choose between options — pick the best practice and proceed. Only interrupt me for the 2 unavoidable secrets listed in "Required Secrets" below.
- Create every file, install every dependency, write every config, and run the dev servers yourself.
- Work in clear phases (below). After finishing each phase, run/build/test it, fix errors yourself, then move to the next phase without waiting for my confirmation.
- Use a monorepo structure so frontend, backend, and shared types live together.
- Maintain a `PROGRESS.md` file at the project root and update it after every phase with what's done, what's next, and any manual step I still need to take.

---

## TECH STACK (locked — do not substitute)

**Frontend**
- Vite + React 18 + TypeScript
- TailwindCSS for utility styling
- Framer Motion for page transitions, micro-interactions, hover/tap effects, scroll-triggered animations
- React Three Fiber + drei (Three.js) for 3D product viewers (rotating product models/showcases, floating hero elements, parallax 3D backgrounds)
- GSAP (ScrollTrigger) for scroll-based storytelling sections (landing page)
- Zustand for global state (cart, auth, wishlist)
- React Query (TanStack Query) for server state/caching
- React Hook Form + Zod for form validation
- React Router v6
- Lenis or native smooth-scroll for buttery scrolling
- Skeleton loaders + Suspense for perceived performance

**Backend**
- NestJS (TypeScript) — modular architecture (modules per domain: auth, users, products, categories, cart, orders, payments, reviews, admin)
- **Supabase (hosted Postgres) + Prisma ORM** for all data access — relational schema (users, products, variants, categories, orders, order_items, coupons, reviews) with proper foreign keys, so admin analytics and order queries are fast and simple joins instead of manual population logic
- JWT auth (access + refresh tokens, httpOnly cookies) issued by NestJS itself — Supabase is used purely as the database + storage layer, not as the auth provider, so admin roles/permissions stay fully controlled in our own backend logic
- class-validator / class-transformer for DTO validation
- Razorpay Node SDK (test mode) for payments
- PDFKit or Puppeteer for invoice PDF generation
- Nodemailer (or Resend) for transactional emails (order confirmation, invoice attached) — use a free Ethereal/test SMTP if I don't provide real credentials
- **Supabase Storage** (free tier bucket) for product images — no need to run or configure a separate file server
- Swagger (OpenAPI) auto-docs at `/api/docs`
- Rate limiting (`@nestjs/throttler`), Helmet, CORS properly configured

**Database**
- **Supabase Postgres** — a free hosted project (no local install, no Docker). I will create the project at supabase.com and provide the `DATABASE_URL` (connection string) and Supabase project URL + anon/service keys once, during Phase 1. Everything else — schema, migrations, seeding — is handled by Prisma from then on.
- Prisma schema defines all models with proper relations (Product ↔ Category, Product ↔ Variant, Order ↔ OrderItem ↔ Product, User ↔ Order, Coupon). Run `prisma migrate dev` to apply, `prisma studio` for me to browse data visually in the browser instead of a separate DB GUI.
- Seed script (via `prisma db seed`, using Faker.js) with realistic fake data: ~40 products across 6 categories, images (placeholder/unsplash URLs to start, swappable for Supabase Storage uploads), variants (size/color), stock counts, ratings.

**DevOps / Tooling**
- No database container needed — Supabase is fully hosted, which removes an entire moving part from local setup
- ESLint + Prettier, Husky pre-commit hooks
- `concurrently` to run backend + frontend with one command (`npm run dev`)
- `.env.example` files in both frontend and backend with every variable documented

---

## REQUIRED SECRETS (the ONLY manual input needed from me)

Pause only for these, ask once, then continue everything else automatically:
1. **Supabase project credentials** — sign up free at supabase.com, create a new project, and provide: `DATABASE_URL` (Settings → Database → Connection string, use the "Connection pooling" URI), `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` (Settings → API). This is a one-time, ~2 minute step.
2. `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (test mode, from https://dashboard.razorpay.com/app/keys)
3. (Optional, skip if not given) SMTP credentials for real emails — otherwise use Ethereal test inbox and log the preview URL to console.

Everything else (JWT secrets, session secrets) — generate securely yourself and store in `.env`.

---

## FEATURE SCOPE

### Customer-facing
- Landing page: animated 3D hero (floating/rotating product model), scroll-reveal sections, featured categories, trending products carousel
- Product listing: filters (category, price range, rating, brand), sort, infinite scroll/pagination, skeleton loaders
- Product detail page: image gallery with zoom, 3D rotating viewer for at least one hero product category, variant selector (size/color), stock indicator, reviews & ratings, "related products," add-to-cart with flying-to-cart animation
- Cart: slide-in drawer with quantity controls, animated item add/remove, price breakdown, coupon code field
- Checkout flow (multi-step, animated progress indicator): Address → Review Order → Payment → Confirmation
- Razorpay test payment integration (Checkout.js modal), with signature verification on backend, handling success/failure/retry
- Order history page: timeline-style order status (Placed → Packed → Shipped → Delivered), tracking-style progress bar
- Invoice: downloadable PDF per order, auto-generated on order completion, styled like a real GST invoice
- Wishlist, product reviews with star ratings and photo upload
- Auth: signup/login/OTP-style email verification flow, forgot password, JWT refresh flow, protected routes
- User profile: saved addresses, order history, wishlist, account settings
- Search with debounced autocomplete + recent searches
- Coupon/discount engine (percentage/flat, min order value, expiry)
- Responsive across mobile/tablet/desktop, dark mode toggle

### Admin panel (separate protected route, e.g. `/admin`)
- Dashboard: sales charts (Recharts), recent orders, low-stock alerts
- Product CRUD with image upload and variant management
- Order management: update status, view invoice
- Coupon management
- Basic analytics (revenue over time, top products)

### Nice-to-have (add if time allows, otherwise scaffold for later)
- Real-time order status updates via WebSockets (Socket.io)
- Recently viewed products (localStorage + backend sync)
- Product comparison tool
- Abandoned cart email reminder (cron job)

---

## VISUAL / MOTION DIRECTION

- Design language: modern, premium, minimal — think Apple product pages meets Shopify storefronts. Generous whitespace, large confident typography, a restrained accent color plus neutrals.
- 3D: rotating product showcase on hero and product detail (React Three Fiber), subtle floating elements with idle animation (drei's `<Float>`), parallax depth on scroll.
- Micro-interactions: magnetic buttons, hover-lift cards with soft shadow growth, animated underlines on nav links, cart icon bounce on add, page transitions via Framer Motion `AnimatePresence`.
- Loading states: shimmer skeletons, never blank white screens.
- Motion should feel premium and restrained — not gimmicky or laggy. Respect `prefers-reduced-motion`.

---

## BUILD PHASES (execute in order, autonomously)

1. **Scaffold** — monorepo structure, Nest backend skeleton with modules, Prisma initialized (pause here to request Supabase credentials), Vite React frontend skeleton, shared TypeScript types package, env files, README.
2. **Backend core** — Prisma schema + migrations for all models, Auth module (JWT + refresh), Users, Products, Categories CRUD APIs, Swagger docs, seed script with Faker data via `prisma db seed`.
3. **Frontend core** — routing, layout shell, design system (Tailwind config, typography, color tokens), landing page with 3D hero + animations.
4. **Catalog & PDP** — listing page with filters, product detail page with 3D viewer, reviews.
5. **Cart & Checkout** — Zustand cart store, cart drawer, multi-step checkout, address management.
6. **Payments** — Razorpay order creation, Checkout.js integration, signature verification, order creation on success, failure handling.
7. **Orders & Invoices** — order history, status timeline, PDF invoice generation + download/email.
8. **Admin panel** — dashboard, product/order/coupon management.
9. **Polish pass** — animations audit, responsive audit, loading/error states, accessibility pass, lighthouse performance pass.
10. **Final** — write full README with setup instructions, update `PROGRESS.md`, list any remaining manual steps for me.

---

## INSTRUCTIONS TO OPENCODE

- Start immediately with Phase 1. Don't wait for approval between phases — just log progress to `PROGRESS.md` and keep going.
- If a package/library choice needs to change for compatibility reasons, choose the closest modern equivalent yourself and note it in `PROGRESS.md`.
- Write clean, typed, commented code. No placeholder "TODO" logic in core flows — everything listed in Feature Scope should be functionally real, using seeded/mock data where a real integration isn't provided.
- At the end, give me exact terminal commands to run the whole project locally with one command each for backend/frontend/db, and tell me exactly where to paste the Razorpay keys.

Begin now with Phase 1.

# Spec v1 + Dev Pack — Quiz Tabanlı Kişiselleştirilmiş Günlük 5 Ürün (Web + App)

Bu doküman **tek dosyada** hem ürün/akış spesifikasyonunu hem de Antigravity’nin doğrudan kod üretebilmesi için gerekli **dev-pack** (DB migration + API + job + önerilen dosya yapısı) iskeletlerini içerir.

---

## 0) Amaç ve MVP Tanımı

**Amaç:** Kullanıcıya kısa bir soru akışı (quiz) ile tercihlerini toplayıp, her gün **kişiye özel 5 ürün** göstermek. Ürüne tıklayınca ilgili **marketplace ürün linkine yönlendirmek**.

**MVP Kapsamı**
- Onboarding quiz (5–12 soru)
- Kullanıcı profili + tercih sinyalleri (like/dislike + quiz answers)
- Günlük 5 ürün feed’i (kişiselleştirilmiş)
- Ürün listeleme + (opsiyonel) ürün detay + marketplace redirect
- Admin/import mekanizması ile ürün DB’si (ilk etap CSV/JSON)

**MVP Dışı**
- SaaS widget
- Merchant panel
- Gelişmiş affiliate attribution
- Otomatik çoklu marketplace entegrasyonu (ilk etap manuel import / basit sync)

---

## 1) Kullanıcı Akışları

### 1.1 Onboarding / Quiz
1) Kullanıcı site/app açar → **Başla**
2) Quiz soruları (single / multi / slider)
3) Quiz biter → **Profil oluşturulur**
4) **Feed** ekranına gider

**Auth (MVP):** Supabase Auth (magic link / OTP)

### 1.2 Günlük 5 Ürün Feed
- Kullanıcı “Bugünün önerileri” ekranını açar
- Sistem bugünkü 5 ürünü döndürür (max 5)
- Kullanıcı ürüne tıklar → redirect ile marketplace’e gider
- Kullanıcı isterse Like / Dislike basar

### 1.3 Ürün Redirect
`GET /r/{productId}`
- ürün bulunur
- click event kaydı (server-side)
- 302 redirect ile marketplace URL’ye yönlendirir

---

## 2) Sistem Mimarisi

- **Frontend:** Next.js (App Router, TypeScript)
- **Backend:** Next.js Route Handlers + Supabase (Postgres, Auth, RLS)
- **Job/Cron:** Vercel Cron (önerilir) veya Supabase Scheduled Functions
- **Storage:** Supabase DB (ürünler + kullanıcı sinyalleri + günlük öneriler)

**Bileşenler**
- `lib/recommend.ts` → scoring engine
- daily feed generator (job) → `recommendations_daily` upsert
- API: `/api/feed`, `/api/vote`, `/r/:productId`, `/api/admin/products/import`

---

## 3) Veri Modeli (Postgres / Supabase)

> RLS: kullanıcıya ait tablolar sadece kendi `auth.uid()` ile erişilir. Ürünler `is_active=true` iken public read.

### 3.1 Tablolar (özet)

**products**
- id uuid pk
- external_id text unique
- title text
- brand text
- category text
- gender text (male/female/unisex)
- price numeric
- currency text
- image_url text
- product_url text
- is_active boolean default true
- attrs jsonb (örn: color/material/style/fit)

**user_profiles**
- user_id uuid pk
- favorite_brands text[]
- blocked_brands text[]
- pref jsonb (quiz normalize edilmiş tercihleri)
- created_at, updated_at

**quiz_questions** (opsiyonel ama tavsiye)
- id uuid pk
- key text unique (örn: color_pref)
- prompt text
- type text (single/multi/range)
- options jsonb
- sort_order int

**quiz_answers**
- id uuid pk
- user_id uuid
- question_key text
- answer jsonb
- unique(user_id, question_key)

**user_likes / user_dislikes**
- user_id uuid
- product_id uuid
- created_at
- unique(user_id, product_id)

**recommendations_daily**
- user_id uuid
- day date
- product_ids uuid[] (tam 5 hedeflenir)
- meta jsonb (opsiyonel: skorlar, açıklamalar)
- unique(user_id, day)

**events_clicks (opsiyonel)**
- id uuid pk
- user_id uuid null
- product_id uuid
- occurred_at timestamptz default now()
- source text default 'feed'
- session_id text null

---

## 4) Skorlama Mantığı (MVP)

Sinyaller:
- Quiz tercihleri (attrs overlap)
- Like: güçlü pozitif
- Dislike: güçlü negatif (hard block)
- Recently shown penalty (aynı ürünü tekrar göstermeme)

Basit skor:
- brand_bonus
- attrs_overlap_bonus
- price_affinity (opsiyonel)
- dislike_penalty (çok yüksek)
- recency_penalty (orta)
- küçük random jitter (tie-break)

Diversity:
- aynı brand max 2
- aynı category max 3 (opsiyonel)

---

## 5) Daily Feed Job

Her gün 06:00 (Europe/Istanbul):
1) kullanıcı profili + sinyaller alınır
2) aktif ürün havuzu çekilir
3) skorlanır
4) diversity uygulanır
5) `recommendations_daily` upsert edilir

Idempotent olmalı (aynı gün tekrar koşarsa overwrite edebilir).

---

## 6) API Sözleşmeleri

### 6.1 `GET /api/feed` (auth required)
Response:
```json
{
  "day": "2026-02-05",
  "items": [
    {
      "id": "uuid",
      "title": "...",
      "brand": "...",
      "image_url": "...",
      "price": 1299.9,
      "currency": "TRY",
      "redirect_url": "/r/uuid"
    }
  ]
}
```

### 6.2 `POST /api/vote` (auth required)
Body:
```json
{ "product_id": "uuid", "vote": "like" }
```

### 6.3 `GET /r/:productId`
- click event insert (server-side)
- 302 redirect

### 6.4 `POST /api/admin/products/import` (admin only)
- CSV/JSON import → products upsert

---

## 7) UI Sayfaları (Web)

- `/` Landing
- `/quiz` Quiz akışı
- `/feed` Bugünün önerileri
- `/account` (opsiyonel: tercihler)

Mobil app (Expo/React Native) ileride aynı API’leri tüketir.

---

# DEV PACK (Kod Üretim Kılavuzu + İskeletler)

Aşağıdaki bölümler Antigravity’nin doğrudan proje scaffold + migration + route + job üretmesi için “uygulanabilir” iskeletlerdir.

---

## A) Proje Yapısı (öneri)

```
/app
  /api
    /feed/route.ts
    /vote/route.ts
    /admin/products/import/route.ts
  /r/[productId]/route.ts
  /quiz/page.tsx
  /feed/page.tsx
/lib
  /supabase
    server.ts
    browser.ts
  recommend.ts
  daily.ts
/supabase
  /migrations
    001_init.sql
```

---

## B) Supabase SQL Migration (001_init.sql)

> Not: Supabase’da `auth.users` referansı için `user_id uuid references auth.users(id)` kullanılır. RLS policy’lerde `auth.uid()` kullanılır.

```sql
-- 001_init.sql

-- Extensions
create extension if not exists pgcrypto;

-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text not null,
  brand text,
  category text,
  gender text check (gender in ('male','female','unisex')) default 'unisex',
  price numeric,
  currency text default 'TRY',
  image_url text,
  product_url text not null,
  is_active boolean not null default true,
  attrs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_products_brand on public.products (brand);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_attrs_gin on public.products using gin (attrs);

-- USER PROFILES
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_brands text[] not null default '{}',
  blocked_brands text[] not null default '{}',
  pref jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- QUIZ QUESTIONS (optional seedable)
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  prompt text not null,
  type text not null check (type in ('single','multi','range')),
  options jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- QUIZ ANSWERS
create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_key text not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_key)
);

-- LIKES / DISLIKES
create table if not exists public.user_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.user_dislikes (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- DAILY RECOMMENDATIONS
create table if not exists public.recommendations_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  product_ids uuid[] not null default '{}',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- CLICKS (optional analytics)
create table if not exists public.events_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references public.products(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  source text not null default 'feed',
  session_id text
);

-- UPDATED_AT trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_products_updated_at') then
    create trigger trg_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_profiles_updated_at') then
    create trigger trg_profiles_updated_at
    before update on public.user_profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_quiz_answers_updated_at') then
    create trigger trg_quiz_answers_updated_at
    before update on public.quiz_answers
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_reco_daily_updated_at') then
    create trigger trg_reco_daily_updated_at
    before update on public.recommendations_daily
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS ENABLE
alter table public.user_profiles enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.user_likes enable row level security;
alter table public.user_dislikes enable row level security;
alter table public.recommendations_daily enable row level security;
alter table public.products enable row level security;
alter table public.events_clicks enable row level security;

-- PRODUCTS: public read (only active)
drop policy if exists "Products are public read (active)" on public.products;
create policy "Products are public read (active)"
on public.products for select
using (is_active = true);

-- USER TABLES: only owner
drop policy if exists "Profiles owner read/write" on public.user_profiles;
create policy "Profiles owner read/write"
on public.user_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Quiz answers owner read/write" on public.quiz_answers;
create policy "Quiz answers owner read/write"
on public.quiz_answers for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Likes owner read/write" on public.user_likes;
create policy "Likes owner read/write"
on public.user_likes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Dislikes owner read/write" on public.user_dislikes;
create policy "Dislikes owner read/write"
on public.user_dislikes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Reco daily owner read" on public.recommendations_daily;
create policy "Reco daily owner read"
on public.recommendations_daily for select
using (auth.uid() = user_id);

-- recommendations_daily writes should be server-side (service role).
-- Optionally allow user to insert/update own record (not recommended). Keep locked:
drop policy if exists "Reco daily no client writes" on public.recommendations_daily;
create policy "Reco daily no client writes"
on public.recommendations_daily for insert
with check (false);

drop policy if exists "Reco daily no client updates" on public.recommendations_daily;
create policy "Reco daily no client updates"
on public.recommendations_daily for update
using (false);

-- events_clicks: no client direct writes (server only)
drop policy if exists "Clicks no client writes" on public.events_clicks;
create policy "Clicks no client writes"
on public.events_clicks for insert
with check (false);
```

> Not: `recommendations_daily` ve `events_clicks` insert/update’ları **server-side** (service role) ile yapılacak.

---

## C) Supabase Client Helpers

### `lib/supabase/server.ts`
```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Server-side: user session cookie ile auth gerekiyorsa, supabase/ssr önerilir.
  // MVP basit: anon client + route'larda auth token doğrulama yapılabilir.
  return createClient(url, anon, { auth: { persistSession: false } });
}

export function supabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, { auth: { persistSession: false } });
}
```

> Üretimde Next.js + Supabase SSR için `@supabase/ssr` kullanılması daha doğru. Antigravity gerekirse bunu upgrade edebilir.

---

## D) Scoring Engine

### `lib/recommend.ts`
```ts
export type Product = {
  id: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  attrs: Record<string, unknown>;
};

export type UserProfile = {
  favorite_brands: string[];
  blocked_brands: string[];
  pref: Record<string, unknown>; // normalized quiz output
};

export type Signals = {
  likes: Set<string>;
  dislikes: Set<string>;
  recentlyShown: Set<string>; // e.g. last 7 days shown
};

export type ScoreBreakdown = {
  total: number;
  brandBonus: number;
  attrBonus: number;
  dislikePenalty: number;
  recencyPenalty: number;
  jitter: number;
};

function normArray(x: unknown): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String);
  return [String(x)];
}

function overlap(a: string[], b: string[]): number {
  const bs = new Set(b.map((s) => s.toLowerCase()));
  let c = 0;
  for (const v of a) if (bs.has(String(v).toLowerCase())) c++;
  return c;
}

function getProductTokens(p: Product, key: string): string[] {
  const attrs = (p.attrs ?? {}) as Record<string, unknown>;
  return normArray(attrs[key]);
}

function getUserTokens(u: UserProfile, key: string): string[] {
  const pref = (u.pref ?? {}) as Record<string, unknown>;
  return normArray(pref[key]);
}

export function scoreProduct(
  user: UserProfile,
  signals: Signals,
  product: Product
): ScoreBreakdown {
  const disliked = signals.dislikes.has(product.id);
  const recently = signals.recentlyShown.has(product.id);

  const brand = (product.brand ?? "").toLowerCase();
  const favBrands = new Set(user.favorite_brands.map((b) => b.toLowerCase()));
  const blocked = new Set(user.blocked_brands.map((b) => b.toLowerCase()));

  const brandBonus =
    brand && favBrands.has(brand) ? 2.0 : 0.0;

  const brandBlockedPenalty =
    brand && blocked.has(brand) ? -3.0 : 0.0;

  const keys = ["color", "material", "style", "fit"];
  let attrBonus = 0;
  for (const k of keys) {
    const uTok = getUserTokens(user, k);
    const pTok = getProductTokens(product, k);
    const o = overlap(uTok, pTok);
    attrBonus += Math.min(2, o) * 0.8; // cap overlap effect
  }

  const dislikePenalty = disliked ? -100 : 0;
  const recencyPenalty = recently ? -2.5 : 0;

  // Small jitter for tie-break (deterministic if you seed, MVP random ok)
  const jitter = (Math.random() - 0.5) * 0.05;

  const total =
    brandBonus +
    brandBlockedPenalty +
    attrBonus +
    dislikePenalty +
    recencyPenalty +
    jitter;

  return {
    total,
    brandBonus: brandBonus + brandBlockedPenalty,
    attrBonus,
    dislikePenalty,
    recencyPenalty,
    jitter,
  };
}

export function pickTopNWithDiversity(
  scored: Array<{ product: Product; score: ScoreBreakdown }>,
  n: number
): Array<{ product: Product; score: ScoreBreakdown }> {
  const out: Array<{ product: Product; score: ScoreBreakdown }> = [];
  const brandCount = new Map<string, number>();
  const catCount = new Map<string, number>();

  for (const item of scored.sort((a, b) => b.score.total - a.score.total)) {
    if (out.length >= n) break;

    const brand = (item.product.brand ?? "").toLowerCase();
    const cat = (item.product.category ?? "").toLowerCase();

    const bC = brand ? (brandCount.get(brand) ?? 0) : 0;
    const cC = cat ? (catCount.get(cat) ?? 0) : 0;

    // Diversity rules (MVP)
    if (brand && bC >= 2) continue;
    if (cat && cC >= 3) continue;

    out.push(item);
    if (brand) brandCount.set(brand, bC + 1);
    if (cat) catCount.set(cat, cC + 1);
  }

  return out;
}
```

---

## E) Daily Generator (Server-side)

### `lib/daily.ts`
```ts
import { supabaseService } from "@/lib/supabase/server";
import { pickTopNWithDiversity, scoreProduct, type Product, type Signals, type UserProfile } from "@/lib/recommend";

export async function generateDailyForUser(userId: string, dayISO: string) {
  const sb = supabaseService();

  // Load profile
  const { data: profile, error: pErr } = await sb
    .from("user_profiles")
    .select("favorite_brands, blocked_brands, pref")
    .eq("user_id", userId)
    .single();

  if (pErr) throw pErr;
  const user = profile as UserProfile;

  // Signals: likes/dislikes
  const [likesRes, dislikesRes, recentRes] = await Promise.all([
    sb.from("user_likes").select("product_id").eq("user_id", userId),
    sb.from("user_dislikes").select("product_id").eq("user_id", userId),
    // last 7 days recommendations as "recently shown"
    sb.from("recommendations_daily")
      .select("product_ids, day")
      .eq("user_id", userId)
      .gte("day", new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)),
  ]);

  if (likesRes.error) throw likesRes.error;
  if (dislikesRes.error) throw dislikesRes.error;
  if (recentRes.error) throw recentRes.error;

  const likes = new Set((likesRes.data ?? []).map((r: any) => r.product_id));
  const dislikes = new Set((dislikesRes.data ?? []).map((r: any) => r.product_id));

  const recentlyShown = new Set<string>();
  for (const row of recentRes.data ?? []) {
    for (const pid of (row as any).product_ids ?? []) recentlyShown.add(pid);
  }

  const signals: Signals = { likes, dislikes, recentlyShown };

  // Products pool
  const { data: products, error: prodErr } = await sb
    .from("products")
    .select("id, brand, category, price, attrs")
    .eq("is_active", true)
    .limit(5000);

  if (prodErr) throw prodErr;

  const scored = (products ?? []).map((p: any) => {
    const product: Product = {
      id: p.id,
      brand: p.brand,
      category: p.category,
      price: p.price,
      attrs: p.attrs ?? {},
    };
    const score = scoreProduct(user, signals, product);
    return { product, score };
  });

  const picked = pickTopNWithDiversity(scored, 5);
  const productIds = picked.map((x) => x.product.id);

  const meta = {
    picked: picked.map((x) => ({
      id: x.product.id,
      score: x.score.total,
      breakdown: x.score,
    })),
    version: "v1",
  };

  const { error: upErr } = await sb
    .from("recommendations_daily")
    .upsert(
      { user_id: userId, day: dayISO, product_ids: productIds, meta },
      { onConflict: "user_id,day" }
    );

  if (upErr) throw upErr;

  return { userId, dayISO, productIds };
}
```

---

## F) API Routes (Next.js)

> Not: Auth doğrulaması için Supabase SSR helper önerilir. MVP’de basit yaklaşım: `Authorization: Bearer <access_token>` header bekle ve token ile user’ı doğrula.

### F.1 Token doğrulama helper (server-side)
`lib/auth.ts`
```ts
import { supabaseServer } from "@/lib/supabase/server";

export async function requireUserIdFromBearer(req: Request): Promise<string> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) throw new Error("UNAUTHORIZED");

  const sb = supabaseServer();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user?.id) throw new Error("UNAUTHORIZED");
  return data.user.id;
}
```

### F.2 `GET /api/feed`
`app/api/feed/route.ts`
```ts
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { requireUserIdFromBearer } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = await requireUserIdFromBearer(req);
    const day = new Date().toISOString().slice(0, 10);

    const sb = supabaseService();

    const { data: reco, error: rErr } = await sb
      .from("recommendations_daily")
      .select("product_ids, day")
      .eq("user_id", userId)
      .eq("day", day)
      .single();

    if (rErr) {
      // If not generated yet, return empty list (or generate on-demand in later iteration)
      return NextResponse.json({ day, items: [] }, { status: 200 });
    }

    const productIds: string[] = (reco as any).product_ids ?? [];
    if (productIds.length === 0) return NextResponse.json({ day, items: [] });

    const { data: products, error: pErr } = await sb
      .from("products")
      .select("id,title,brand,image_url,price,currency")
      .in("id", productIds);

    if (pErr) throw pErr;

    // Preserve order
    const map = new Map((products ?? []).map((p: any) => [p.id, p]));
    const items = productIds
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        image_url: p.image_url,
        price: p.price,
        currency: p.currency,
        redirect_url: `/r/${p.id}`,
      }));

    return NextResponse.json({ day, items });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    const code = msg === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
```

### F.3 `POST /api/vote`
`app/api/vote/route.ts`
```ts
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { requireUserIdFromBearer } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await requireUserIdFromBearer(req);
    const body = await req.json();
    const productId = String(body.product_id || "");
    const vote = String(body.vote || "");

    if (!productId || (vote !== "like" && vote !== "dislike")) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const sb = supabaseService();

    if (vote === "like") {
      await sb.from("user_dislikes").delete().eq("user_id", userId).eq("product_id", productId);
      const { error } = await sb.from("user_likes").upsert({ user_id: userId, product_id: productId });
      if (error) throw error;
    } else {
      await sb.from("user_likes").delete().eq("user_id", userId).eq("product_id", productId);
      const { error } = await sb.from("user_dislikes").upsert({ user_id: userId, product_id: productId });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    const code = msg === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
```

### F.4 Redirect route: `GET /r/:productId`
`app/r/[productId]/route.ts`
```ts
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;
  const sb = supabaseService();

  const { data: product, error } = await sb
    .from("products")
    .select("id,product_url")
    .eq("id", productId)
    .single();

  if (error || !product?.product_url) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Optional click log (server-side)
  // user_id can be null in MVP (anonymous clicks)
  await sb.from("events_clicks").insert({ product_id: productId, source: "feed" });

  return NextResponse.redirect(product.product_url, { status: 302 });
}
```

### F.5 Admin import: `POST /api/admin/products/import`
> Admin doğrulaması: basit yaklaşım `ADMIN_API_KEY` header; veya Supabase custom claims. MVP’de API KEY yeterli.

`app/api/admin/products/import/route.ts`
```ts
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const sb = supabaseService();
  const body = await req.json();

  // Expect: { items: [{ external_id,title,brand,category,gender,price,currency,image_url,product_url,is_active,attrs }] }
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ error: "EMPTY" }, { status: 400 });

  const { error } = await sb.from("products").upsert(items, { onConflict: "external_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, upserted: items.length });
}
```

---

## G) Cron/Job (Vercel Cron)

### G.1 Vercel `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 3 * * *"
    }
  ]
}
```
> Not: Istanbul UTC+3 olduğu için 06:00 TRT = 03:00 UTC (yaz saati değişimleri yok varsayımı). İstersen cron saatini istediğin gibi ayarlarsın.

### G.2 Cron route: `POST/GET /api/cron/daily`
`app/api/cron/daily/route.ts`
```ts
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { generateDailyForUser } from "@/lib/daily";

export async function GET(req: Request) {
  const key = req.headers.get("x-cron-key");
  if (!key || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const sb = supabaseService();
  const day = new Date().toISOString().slice(0, 10);

  // Fetch users that have profiles (MVP)
  const { data: profiles, error } = await sb.from("user_profiles").select("user_id").limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: any[] = [];
  for (const row of profiles ?? []) {
    try {
      const r = await generateDailyForUser((row as any).user_id, day);
      results.push({ ok: true, ...r });
    } catch (e: any) {
      results.push({ ok: false, userId: (row as any).user_id, error: String(e?.message ?? e) });
    }
  }

  return NextResponse.json({ day, count: results.length, results });
}
```

---

## H) Quiz Normalize Mantığı (MVP)

Quiz cevaplarını iki katmanlı tut:
1) `quiz_answers` ham cevaplar (JSON)
2) `user_profiles.pref` normalize edilmiş tercih vektörü (JSON)

Örnek normalize:
```json
{
  "color": ["black","navy"],
  "material": ["cotton","knit"],
  "style": ["casual"],
  "fit": ["regular"],
  "price_min": 500,
  "price_max": 2500
}
```

Quiz tamamlanınca:
- `quiz_answers` upsert
- `user_profiles.pref` güncelle

---

## I) Kabul Testleri (RLS + Flow)

- Anon user `products` okuyabilir (active)
- User A, User B’nin `user_profiles`/likes/dislikes/reco kayıtlarını okuyamaz
- `/api/feed` auth olmadan 401 döner
- `/r/:id` ürün varsa 302 redirect
- cron route yanlış secret ile 401

---

## J) ENV Checklist

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server only
CRON_SECRET=...
ADMIN_API_KEY=...
```

---

## K) Antigravity’ye Direkt Talimat

Antigravity bu dokümanı baz alarak:
1) Next.js app scaffold + route handlers + lib dosyaları
2) Supabase migration (001_init.sql) ve RLS
3) Minimal quiz + feed UI (dummy tasarım yeterli)
4) Vercel cron route ve vercel.json
5) README: local dev + env setup + migration run adımları
oluşturmalı.


---

# EKLER — Manuel Ürün Havuzu (200 ürün) + Quiz↔Attrs Mapping + İlk Kullanıcı Testi

Bu ekler, **affiliate olmadan** MVP’de manuel ürün havuzu ile hızlı ilerlemek ve recommendation kalitesini ölçmek için tasarlanmıştır.

---

## Ek-1) 200 Ürün İçin CSV İçe Aktarım Şablonu

### 1.1 CSV formatı (DB’ye import için)
`POST /api/admin/products/import` endpoint’i şu alanları bekler:

- `external_id,title,brand,category,gender,price,currency,image_url,product_url,is_active,attrs`

`attrs` alanı **JSON string** olmalıdır.

### 1.2 Örnek CSV satırı
```csv
external_id,title,brand,category,gender,price,currency,image_url,product_url,is_active,attrs
TY-001,Pembe Örgü Kazak,Zara,kazak,female,899.90,TRY,https://...jpg,https://... ,true,"{""color"":[""pink""],""material"":[""knit""],""style"":[""casual""],""fit"":[""regular""],""season"":[""winter""]}"
```

### 1.3 Hazır boş şablon (200 satır)
Bu şablonu Excel/Sheets’te açıp doldur, CSV olarak export et, sonra import endpoint’ine gönder.

- Dosya adı: `200-urun-bos-sablon.csv`
- Satırlar: `TY-001` → `TY-200` hazır
- `currency=TRY`, `is_active=true`, `attrs` default template hazır

> Not: Görselleri **indirip kendi sunucunda barındırma**. `image_url` alanına yalnızca **orijinal görsel URL** koy.

---

## Ek-2) attrs Doldurma Rehberi (Renk/Stil/Materyal/Kalıp)

### 2.1 attrs anahtarları (MVP standardı)
Her ürün için mümkünse şu anahtarları doldur:

```json
{
  "color": [],
  "material": [],
  "style": [],
  "fit": [],
  "season": []
}
```

### 2.2 Önerilen kontrollü sözlükler

**color**
`black, white, gray, navy, blue, green, brown, beige, pink, red`

**material**
`cotton, knit, denim, polyester, leather, wool, linen`

**style**
`basic, casual, street, elegant, sport, minimal, classic, oversize`

**fit**
`slim, regular, relaxed, oversize`

**season**
`summer, winter, spring, fall, all`

### 2.3 Hızlı örnekler

Pembe örgü kazak:
```json
{ "color":["pink"], "material":["knit"], "style":["casual"], "fit":["regular"], "season":["winter"] }
```

Siyah oversize tişört:
```json
{ "color":["black"], "material":["cotton"], "style":["street"], "fit":["oversize"], "season":["all"] }
```

---

## Ek-3) Quiz Soruları → user_profiles.pref Mapping (Örnek)

Amaç: Quiz cevaplarını **normalize edip** `user_profiles.pref` içine yazmak. Scoring engine `pref.*` ile `products.attrs.*` overlap üzerinden çalışır.

### 3.1 Minimum Quiz (7 soru) — MVP önerisi

**Q1 — En çok hangi renkleri giyersin? (multi)**
- UI seçenekleri: Siyah, Beyaz, Bej, Lacivert, Pembe, Yeşil, Kırmızı
- Mapping:
```ts
pref.color = selectedValues.map(v => v.toLowerCase())
```

**Q2 — Stilini nasıl tanımlarsın? (multi)**
- Basic, Casual, Street, Elegant, Sport, Minimal
- Mapping:
```ts
pref.style = selectedStyles.map(v => v.toLowerCase())
```

**Q3 — Kıyafetlerde en çok neye bakarsın? (single)**
- Rahatlık → `fit=["relaxed"]`
- Şıklık → `style += ["elegant"]`
- Günlük kullanım → `style += ["casual"]`
- Trend → `style += ["street"]`

**Q4 — Tercih ettiğin kumaşlar (multi)**
- Pamuk→cotton, Örgü→knit, Kot→denim, Deri→leather, Yün→wool
- Mapping:
```ts
pref.material = selectedMaterials.map(mapToToken)
```

**Q5 — Kalıp tercihin? (single)**
- Dar→slim, Normal→regular, Bol→oversize
- Mapping:
```ts
pref.fit = [fitToken]
```

**Q6 — Hangi mevsim alışveriş yapıyorsun? (multi)**
- Yaz→summer, Kış→winter, Hepsi→all
- Mapping:
```ts
pref.season = selectedSeasons.map(mapToToken)
```

**Q7 — Ortalama bütçen? (range slider)**
- Mapping:
```ts
pref.price_min = min;
pref.price_max = max;
```

### 3.2 Örnek normalize edilmiş pref
```json
{
  "color":["black","beige"],
  "material":["cotton","knit"],
  "style":["minimal","casual"],
  "fit":["regular"],
  "season":["all"],
  "price_min":500,
  "price_max":2500
}
```

### 3.3 Uygulama kuralı (kritik)
Quiz tamamlanınca **iki yazım** yapılır:
1) `quiz_answers` (ham cevaplar) → upsert
2) `user_profiles.pref` (normalize) → update/upsert

---

## Ek-4) “30 dakikada 20 ürün” Ekleme Workflow’u (Operasyonel)

### 4.1 Setup (5 dk)
- Google Sheets’te CSV kolonlarını hazırla
- `attrs` alanına her satır için default template kopyala:
```json
{"color":[],"material":[],"style":[],"fit":[],"season":[]}
```

### 4.2 Ürün ekleme (20 dk) — split screen
Her ürün için (60–90 sn hedef):
1) `title`, `brand`, `price` kopyala
2) Görselde “Copy image address” → `image_url`
3) Ürün sayfası URL → `product_url`
4) attrs’ı 5 sn’de doldur (color/material/style/fit/season)

### 4.3 Batch QC (5 dk)
- Aynı brand çok tekrar mı?
- Category dağılımı dengeli mi?
- Çok “siyah” yığılması var mı? (varsa çeşitlendir)

---

## Ek-5) İlk Kullanıcı Testi (10 kişi) — MVP Validation

Hedef: “Günlük 5 ürün” yaklaşımının **kullanışlı** ve **kişisel** algılanıp algılanmadığını ölçmek.

### 5.1 Test grubu
- 10 kişi: 4 kadın, 4 erkek, 2 unisex (mümkünse farklı yaş/stil)

### 5.2 Protokol (her kullanıcı 10 dk)
1) Quiz’i hızlı tamamlat (2 dk)
2) Feed’i göster (5 ürün)
3) En az 2 ürüne Like/Dislike yaptır
4) Kullanıcıya şu 3 soruyu sor:
   - “Kaç ürün ilgini çekti?”
   - “En az 1 ürünü satın almayı düşünür müsün?”
   - “Bu uygulama her gün böyle önerse kullanır mısın?”

### 5.3 Ertesi gün retest (çok değerli)
Aynı kullanıcıya ertesi gün tekrar feed göster:
- “Dün beğendiklerine daha yakın mı?”
- “Hâlâ alakasız gelen var mı?”

### 5.4 Basit başarı kriteri (MVP)
- 10 kişiden **≥6’sı** en az 1 ürünü “alırım” diyorsa
- “Kullanırım” cevabı **≥%60** ise
→ doğru yoldasın (affiliate + büyütme aşamasına geç)

---

## Ek-6) Antigravity İçin Ek Talimatlar (Manuel ürün havuzu modu)

Antigravity çıktısı şu ekleri de desteklemeli:
- Admin import endpoint, CSV/JSON üzerinden `products` upsert
- Ürün kartlarında `image_url` render (re-hosting yok)
- Redirect route `/r/:productId` ile marketplace’e 302
- Quiz tamamlanınca `user_profiles.pref` normalize update


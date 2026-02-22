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

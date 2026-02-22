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

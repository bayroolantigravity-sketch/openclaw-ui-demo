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

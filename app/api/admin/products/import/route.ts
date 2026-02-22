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

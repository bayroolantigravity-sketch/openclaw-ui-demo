import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    const { productId } = await params;
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

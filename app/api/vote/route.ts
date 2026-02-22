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

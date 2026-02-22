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

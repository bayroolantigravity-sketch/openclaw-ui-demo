import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { requireUserIdFromBearer } from "@/lib/auth";

// Helper type for quiz answers
type QuizSubmission = {
    answers: Record<string, any>; // key (question_id) -> value
    preferences: Record<string, any>; // normalized preferences
};

export async function POST(req: Request) {
    try {
        const userId = await requireUserIdFromBearer(req);
        const body = await req.json() as QuizSubmission;

        const { answers, preferences } = body;

        if (!answers || !preferences) {
            return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
        }

        const sb = supabaseService();

        // 1. Upsert Quiz Answers
        const answerUpserts = Object.entries(answers).map(([key, val]) => ({
            user_id: userId,
            question_key: key,
            answer: val,
        }));

        // We do this in a loop or batch if possible. Supabase upsert supports array.
        if (answerUpserts.length > 0) {
            const { error: ansErr } = await sb
                .from("quiz_answers")
                .upsert(answerUpserts, { onConflict: "user_id,question_key" });

            if (ansErr) throw ansErr;
        }

        // 2. Update User Profile Preferences
        // We fetch existing pref first to merge, or just overwrite? Spec says "normalize... update".
        // Let's overwrite "pref" but keep other fields.
        const { error: profErr } = await sb
            .from("user_profiles")
            .upsert({
                user_id: userId,
                pref: preferences,
                // we might want to set defaults for favorite/blocked brands if new
            }, { onConflict: "user_id" });

        if (profErr) throw profErr;

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("Quiz Submit Error:", e);
        const msg = String(e?.message ?? e);
        const code = msg === "UNAUTHORIZED" ? 401 : 500;
        return NextResponse.json({ error: msg }, { status: code });
    }
}

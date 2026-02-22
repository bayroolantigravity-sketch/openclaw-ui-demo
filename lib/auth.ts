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
